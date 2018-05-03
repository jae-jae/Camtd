// 'use strict';

$(document).ready(function () {
    var favorite = localStorage["path"];
    var enabled = localStorage["enabled"];
    if (favorite) {
        $('#path').val(favorite);
    }
    favorite = localStorage["size"];
    if (favorite) {
        $('#size').val(favorite);
    }
    $("#size").blur(function () {
        save_options('size');
    });
    $("#path").blur(function () {
        save_options('path');
    });
    function save_options(name) {
        this.tmp = $.trim($('#' + name).val());
        if (!this.tmp) {
            show(name, "不可为空");
            $('#' + name).focus();
            return false;
        } else {
            localStorage[name] = this.tmp;
            localStorage['enabled'] = 1;
            showEnable();
            show(name, "已保存");
        }
    }
    function show(name, msg) {
        $('#' + name).next('span').html(msg);
        setTimeout(function () {
            $('#' + name).next('span').html('');
        }, 3000);
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
});

