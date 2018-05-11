// 'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

let preNum = 0;
let currentUrl = '';

var getStorage = (key) => {
  if (key === 'size') {
    let size = localStorage['size'] || 0
    size = size * 1024 * 1024
    return size
  } else if (key === 'path') {
    return localStorage['path'] || 'http://localhost:6800/jsonrpc'
  } else if (key === 'enableFilter') {
    return localStorage['enableFilter'] || 'disabled'
  } else if (key === 'filterUrlRegs') {
    return localStorage['filterUrlRegs'] === undefined ? [] : localStorage['filterUrlRegs'].split(',').map((reg) => eval(reg))
  }
  return localStorage[key]
}

var notice = (message, title = 'Camtd') => {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/default/icon-38.png',
    title,
    message
  }, (id) => {
    setTimeout(_ => {
      chrome.notifications.clear(id);
    }, 5000);
  })
}

var sendAnimMsg = () => {
  console.log('sending msg');
  chrome.tabs.query({ active: true }, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'show-add-task-anim'
      });
      console.log('msg send');
    })
  })
}

let getGlobalStatus = (callback) => {
  postaria2obj({
    'jsonrpc': '2.0',
    'method': 'aria2.getGlobalStat',
    'id': (new Date()).getTime().toString()
  }, callback)
}

// 测试URL是否满足正则集合中某条正则
let testUrl = (url, regs) => {
  return regs.some((reg) => {
    return reg.test(url)
  })
}

let getTabUrl = () => {
  chrome.tabs.query({ active: true }, function (tabs) {
    tabs.forEach(function (tab) {
      currentUrl = tab.url
    })
  })

}

let isIgnore = (down) => {
  if (
    /^blob:/.test(down.finalUrl)
    || getStorage('enabled') == 0
    || Math.abs(down.fileSize) < getStorage('size')
  ) {
    console.log('Ignore file')
    return true;
  }
  return false
}

setInterval(() => {
  getGlobalStatus((data) => {
    let num = data['result']['numActive']
    if (num > 0) {
      chrome.browserAction.setBadgeText({ text: num });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#00CC66' });
    } else {
      chrome.browserAction.setBadgeText({ text: '' });
    }
    if (preNum > num) {
      notice('Download completed!');
    }
    preNum = num;
  })
}, 1000)



chrome.tabs.onActivated.addListener(() => {
  getTabUrl()
})

chrome.tabs.onUpdated.addListener(() => {
  getTabUrl()
})

chrome.notifications.onClicked.addListener(function (itemId) {
  // chrome.downloads.show(parseInt(itemId));
  chrome.downloads.showDefaultFolder()
  chrome.notifications.clear(itemId, function (wasCleared) { });
});

chrome.downloads.onDeterminingFilename.addListener(function (down) {
  if (!getStorage('path')) {
    alert('Camtd has not been configured');
    chrome.tabs.create({ 'url': 'options.html' }, function (s) { });
    return 0;
  }

  if (isIgnore(down)) {
    return 0
  }

  let downloadUrl = down.finalUrl
  let enableFilter = getStorage('enableFilter')
  let filterUrls = getStorage('filterUrlRegs')
  if (enableFilter === 'disabled') {
    add(down)
  } else if (enableFilter === 'blacklist') {
    if (!testUrl(currentUrl, filterUrls) && !testUrl(downloadUrl, filterUrls)) {
      add(down)
    } else {
      console.log('blacklist:', currentUrl, downloadUrl)
    }
  } else {
    if (testUrl(currentUrl, filterUrls) || testUrl(downloadUrl, filterUrls)) {
      add(down)
    } else {
      console.log('not in whitelist:', currentUrl, downloadUrl)
    }
  }
});

function add(down) {
  chrome.downloads.cancel(down.id, function (s) { });
  getUrlCookie(down.url, (cookies) => {
    var aria2_obj = combination(down, cookies);
    var ifpostback = postaria2obj(aria2_obj);
    if (ifpostback == 'base64_error') {
      notice('Error adding tasks to aria2!', 'Error')
    } else {
      // notice('Aria2 is starting to download files.', down.filename)
      sendAnimMsg()
    }
  })
}

function postaria2obj(addobj, callback = null) {
  var aria2jsonrpcpath = getStorage('path');

  var result = parse_url(aria2jsonrpcpath);
  var auth = result[1];
  if (auth && auth.indexOf('token:') == 0) {
    if (addobj.params) {
      addobj.params.unshift(auth);
    } else {
      addobj.params = [auth];
    }
  }

  fetch(result[0] + '?tm=' + (new Date()).getTime().toString(), {
    method: 'POST',
    body: JSON.stringify(addobj),
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  }).then((response) => {
    return response.json()
  }).then((data) => {
    if (callback) {
      callback(data)
    }
  }).catch((error) => {
    console.error('Error:', error)
    console.log('Error aria2 configuration!');
    if (addobj && addobj.method === 'aria2.addUri') {
      notice('Error adding tasks to aria2,please check the configuration!', 'Error');
    }
  })

  return 'ok';

}

function parse_url(url) {
  var auth_str = request_auth(url);
  var auth = null;
  if (auth_str) {
    if (auth_str.indexOf('token:') == 0) {
      auth = auth_str;
    } else {
      auth = 'Basic ' + btoa(auth_str);
    }
  }
  var url_path = remove_auth(url);
  function request_auth(url) {
    return url.match(/^(?:(?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(?:\/\/)?(?:([^:@]*(?::[^:@]*)?)?@)?/)[1];
  }
  function remove_auth(url) {
    return url.replace(/^((?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(\/\/)?(?:(?:[^:@]*(?::[^:@]*)?)?@)?(.*)/, '$1$2$3');
  }
  return [url_path, auth];
}


function getUrlCookie(link, callback) {
  chrome.cookies.getAll({ 'url': link }, function (cookies) {
    var format_cookies = [];
    for (var i in cookies) {
      var cookie = cookies[i];
      format_cookies.push(cookie.name + '=' + cookie.value);
    }
    format_cookies = format_cookies.join('; ');
    callback(format_cookies)
  });
}

function combination(down, cookies) {

  var header = [];
  header.push('Cookie: ' + cookies);
  header.push('User-Agent: ' + navigator.userAgent);
  header.push('Connection: keep-alive');
  header.push('Referer: ' + down.referrer);

  if (down.filename == '') {
    var post_obj = {
      'jsonrpc': '2.0',
      'method': 'aria2.addUri',
      'id': (new Date()).getTime().toString(),
      'params': [[down.finalUrl], {
        'header': header
      }]
    };
  } else {
    var post_obj = {
      'jsonrpc': '2.0',
      'method': 'aria2.addUri',
      'id': (new Date()).getTime().toString(),
      'params': [[down.finalUrl], {
        'out': decodeURIComponent(down.filename),
        'header': header
      }]
    };
  }
  return post_obj;
}

function rightadd(info, tab) {
  var down = { filename: '' };
  down.finalUrl = info.linkUrl;
  down.referrer = info.pageUrl;
  if (!getStorage('path')) {
    alert('Camtd has not been configured');
    chrome.tabs.create({ 'url': 'options.html' }, function (s) { });
    return 0;
  }
  getUrlCookie(down.finalUrl, (cookies) => {
    var aria2_obj = combination(down, cookies);
    var ifpostback = postaria2obj(aria2_obj);
    if (ifpostback == 'base64_error') {
      notice('Error adding tasks to aria2!', 'Error')
    } else {
      // notice('Aria2 is starting to download files.', down.filename)
      sendAnimMsg()
    }
  })
}

chrome.contextMenus.create({ 'title': 'Send to Aria2', 'contexts': ['link'], 'onclick': rightadd });

