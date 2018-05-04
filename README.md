![](https://ww1.sinaimg.cn/large/7de3675bgy1fqyd8vcxm5j20w40ldq89.jpg)

# Camtd
Chrome multi-threaded downloader extension,based on Aria2 and AriaNg.

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