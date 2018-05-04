// 'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

let enabled = localStorage['enabled'];
let size = localStorage['size'] === undefined ? 0 : localStorage['size']
size = size * 1024 * 1024;
let path = localStorage['path'];

var notice =  (message,title = 'Camtd') => {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon-38.png',
    title,
    message
  },(id) => {
    setTimeout(_ => {
      chrome.notifications.clear(id);
    },5000);
  })
}

var sendAnimMsg = () => {
	console.log('sending msg');
	chrome.tabs.query({active: true}, function (tabs) {
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

setInterval(() => {
  getGlobalStatus((data) => {
    let num = data['result']['numActive']
    if (num > 0) {
      chrome.browserAction.setBadgeText({text: num});
      chrome.browserAction.setBadgeBackgroundColor({color:'#00CC66'});
    } else {
      chrome.browserAction.setBadgeText({text: ''});
    }
  })
}, 1000)

chrome.downloads.onDeterminingFilename.addListener(add);

function add(down) {
  if (!path) {
    alert('Camtd has not been configured');
    chrome.tabs.create({ 'url': 'options.html' }, function (s) { });
    localStorage['enabled'] = 0;
    return 0;
  }
  if (enabled == 0) {
    return 0;
  }
  if (Math.abs(down.fileSize) > size) {
    chrome.downloads.cancel(down.id, function (s) { });
    getUrlCookie(down.url, (cookies) => {
      var aria2_obj = combination(down,cookies);
      var ifpostback = postaria2obj(aria2_obj);
      if (ifpostback == 'base64_error') {
        notice('Error adding tasks to aria2!','Error')
      } else {
        // notice('Aria2 is starting to download files.', down.filename)
        sendAnimMsg()
      }
    })
    
  }
}

function postaria2obj(addobj, callback = null) {
  var httppost = new XMLHttpRequest();
  var aria2jsonrpcpath = path;
  httppost.open('POST', aria2jsonrpcpath + '?tm=' + (new Date()).getTime().toString(), true);
  var ifregurl = aria2url_reg(aria2jsonrpcpath);
  if (ifregurl) {
    if (!window.btoa) {
      return 'base64_error';
    } else {
      httppost.setRequestHeader('Authorization', 'Basic ' + btoa(ifregurl));
    }
  }
  httppost.onerror = function () {
    notice('Error adding tasks to aria2,please check the configuration!','Error');
  };
  httppost.addEventListener('load', function () {
    let rt = JSON.parse(this.responseText)
    if (callback) {
      callback(rt)
    }
  })
  httppost.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  httppost.send(JSON.stringify(addobj));
  return 'ok';

}

function aria2url_reg(url) {
  if (url.split('@')[0] == url) {
    return null;
  }
  return url.split('@')[0].match('/^(http:\\/\\/\|https:\\/\\/)?(.*)\/')[2];
}


function getUrlCookie(link, callback) {
  chrome.cookies.getAll({ 'url': link }, function(cookies) {
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
    var post_obj = [{
      'jsonrpc': '2.0',
      'method': 'aria2.addUri',
      'id': (new Date()).getTime().toString(),
      'params': [[down.finalUrl], {
        'header': header
      }]
    }];
  } else {
    var post_obj = [{
      'jsonrpc': '2.0',
      'method': 'aria2.addUri',
      'id': (new Date()).getTime().toString(),
      'params': [[down.finalUrl], {
        'out': decodeURIComponent(down.filename),
        'header': header
      }]
    }];
  }
  return post_obj;
}

function rightadd(info, tab) {
  var down = { filename: '' };
  down.finalUrl = info.linkUrl;
  down.referrer = info.pageUrl;
  if (!path || !size) {
    alert('Camtd has not been configured');
    chrome.tabs.create({ 'url': 'options.html' }, function (s) { });
    return 0;
  }
  getUrlCookie(down.url, (cookies) => {
    var aria2_obj = combination(down,cookies);
    var ifpostback = postaria2obj(aria2_obj);
    if (ifpostback == 'base64_error') {
      notice('Error adding tasks to aria2!','Error')
    } else {
      chrome.downloads.cancel(down.id, function (s) { });
      // notice('Aria2 is starting to download files.', down.filename)
      sendAnimMsg()
    }
  })
}

chrome.contextMenus.create({ 'title': 'Send to Aria2', 'contexts': ['link'], 'onclick': rightadd });

