![Xnip2018-05-05_12-40-13.jpg](https://cdn.rawgit.com/jae-jae/_resources/master/Xnip2018-05-05_12-40-13.jpg)

[Camtd中文使用教程](https://github.com/jae-jae/Camtd/wiki/Camtd%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B)

# Camtd
Chrome multi-threaded download manager extension,based on Aria2 and AriaNg.

> Aria2: [https://aria2.github.io](https://aria2.github.io/)

> AriaNg: [https://github.com/mayswind/AriaNg](https://github.com/mayswind/AriaNg)

# Install

ChromeStore: [https://chrome.google.com/webstore/detail/camtd-aria2-download-mana/lcfobgbcebdnnppciffalfndpdfeence?utm_source=chrome-ntp-icon](https://chrome.google.com/webstore/detail/camtd-aria2-download-mana/lcfobgbcebdnnppciffalfndpdfeence?utm_source=chrome-ntp-icon)

Github: [releases](https://github.com/jae-jae/Camtd/releases)

# Usage

1. Run aria2 with RPC enabled
> `aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all`
> with 'JSON-RPC PATH' like `http://hostname:port/jsonrpc`
>
> Recommend: Set `--rpc-secret=<secret>` if you are using aria2 1.18.4(or higher) with 'JSON-RPC PATH' like `http://token:secret@hostname:port/jsonrpc`
>
> Set `--rpc-user=<username>` `--rpc-passwd=<passwd>` if you are using aria2 1.15.2(or higher) with 'JSON-RPC PATH' like `http://username:passwd@hostname:port/jsonrpc`

2. Configuration Camtd
![setting.gif](https://cdn.rawgit.com/jae-jae/_resources/master/setting.gif)

# Demo
![down.gif](https://cdn.rawgit.com/jae-jae/_resources/master/down.gif)

满速下载百度网盘
![pan.gif](https://cdn.rawgit.com/jae-jae/_resources/master/pan.gif)

# Building
```
$ yarn

# Transform updated source written by ES2015 (default option)
$ gulp babel

# or Using watch to update source continuously
$ gulp watch

# Make a production version extension
$ gulp build
```

# Building UI
```
$ cd AriaNg
$ yarn
$ bower install

# build
$ gulp clean build

# starting server
$ gulp serve
```

# Changelog

## 0.0.8 - 2017-05-10
### Added
- Intercept filter，blacklist and whitelist

### Changed
- Remove connect max limit

# License
MIT