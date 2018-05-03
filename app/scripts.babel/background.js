// 'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

// chrome.browserAction.setBadgeText({text: '\'Allo'});

chrome.downloads.onDeterminingFilename.addListener(add);
var enabled = localStorage["enabled"];
chrome.browserAction.onClicked.addListener(changeEnable);
var size = localStorage["size"] * 1024 * 1024;
var path = localStorage["path"];

function changeEnable(tab) {
  if (enabled == 1) {
    chrome.browserAction.setBadgeText({ "text": 'dis' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#880000' });
    localStorage['enabled'] = 0;
  } else {
    chrome.browserAction.setBadgeText({ "text": 'en' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#008800' });
    localStorage['enabled'] = 1;
  }
  enabled = localStorage["enabled"];
}

function showEnable() {
  enabled = localStorage["enabled"];
  if (enabled == 1) {
    chrome.browserAction.setBadgeText({ "text": 'en' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#008800' });
  } else {
    chrome.browserAction.setBadgeText({ "text": 'dis' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#880000' });
  }
}

function add(down) {
  size = localStorage["size"] * 1024 * 1024;
  path = localStorage["path"];
  enabled = localStorage["enabled"];
  //console.debug(down);
  if (!path || !size) {
    alert("插件尚未配置");
    chrome.tabs.create({ "url": "options.html" }, function (s) { });
    localStorage['enabled'] = 0;
    showEnable();
    return 0;
  }
  if (enabled == 0) {
    //var notification = new Notification("添加到aria2当前暂停", {body: "如需启用点击工具栏中图标"});
    return 0;
  }
  if (Math.abs(down.fileSize) > size) {
    this.aria2_obj = combination(down);
    var ifpostback = postaria2obj(this.aria2_obj);
    if (ifpostback == "base64_error") {
      var notification = new Notification("成功！", { body: "添加任务至 aria2 出错！" });
    } else {
      chrome.downloads.cancel(down.id, function (s) { });
      var notification = new Notification("成功！", { body: "下载已送往aria2，请前往确认" });
    }
  }
}

function postaria2obj(addobj) {
  var httppost = new XMLHttpRequest();
  this.aria2jsonrpcpath = path;
  httppost.open("POST", this.aria2jsonrpcpath + "?tm=" + (new Date()).getTime().toString(), true);
  var ifregurl = aria2url_reg(this.aria2jsonrpcpath);
  if (ifregurl) {
    if (!window.btoa) {
      return "base64_error";
    } else {
      httppost.setRequestHeader("Authorization", "Basic " + btoa(ifregurl));
    }
  }
  httppost.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  httppost.send(JSON.stringify(addobj));
  return "ok";

}

function aria2url_reg(url) {
  if (url.split("@")[0] == url) {
    return null;
  }
  return url.split("@")[0].match("/^(http:\\/\\/\|https:\\/\\/)?(.*)\/")[2];
}

function combination(down) {
  if (down.filename == '') {
    var post_obj = [{
      "jsonrpc": "2.0",
      "method": "aria2.addUri",
      "id": (new Date()).getTime().toString(),
      "params": [[down.finalUrl], {
        "header": "Referer: " + down.referrer
      }]
    }];
  } else {
    var post_obj = [{
      "jsonrpc": "2.0",
      "method": "aria2.addUri",
      "id": (new Date()).getTime().toString(),
      "params": [[down.finalUrl], {
        "out": decodeURIComponent(down.filename),
        "header": "Referer: " + down.referrer
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
    alert("插件尚未配置");
    chrome.tabs.create({ "url": "options.html" }, function (s) { });
    return 0;
  }
  this.aria2_obj = combination(down);
  var ifpostback = postaria2obj(this.aria2_obj);
  if (ifpostback == "base64_error") {
    var notification = new Notification("成功！", { body: "添加任务至 aria2 出错！" });
  } else {
    var notification = new Notification("成功！", { body: "下载已送往aria2，请前往确认" });
  }
}

chrome.contextMenus.create({ "title": "添加到Aria2", "contexts": ["link"], "onclick": rightadd });
showEnable();
