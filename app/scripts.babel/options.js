'use strict';

new Vue({
    el: '#app',
    data () {
        return {
            config: {
                enabled: parseInt(this.valueKey('enabled',1)),
                path: this.valueKey('path','http://localhost:6800/jsonrpc'),
                size: parseFloat(this.valueKey('size',0)),
                enableFilter: this.valueKey('enableFilter','disabled'),
                filterUrls: this.valueKey('filterUrls',''),
            },
            saved: false,
            i18n: {
                title: this.getI18nMessage('optionsTitle'),
                off: this.getI18nMessage('optionsOff'),
                on: this.getI18nMessage('optionsOn'),
                ifIntercept: this.getI18nMessage('optionsIfIntercept'),
                fileSize: this.getI18nMessage('optionsFileSize'),
                aria2Prc: this.getI18nMessage('optionsAria2Prc'),
                save: this.getI18nMessage('optionsSave'),
                saved: this.getI18nMessage('optionsSaved'),
                blacklist: this.getI18nMessage('optionsBlacklist'),
                whitelist: this.getI18nMessage('optionsWhitelist'),
                filter: this.getI18nMessage('optionsFilter'),
                filterUrls: this.getI18nMessage('optionsFilterUrls'),
                blacklistHint: this.getI18nMessage('optionsBlacklistHint'),
                whitelistHint: this.getI18nMessage('optionsWhitelistHint'),
                errorReg: this.getI18nMessage('optionsErrorReg')              
            },
            lastUrl: ''
        }
    },
    watch: {
        config: {
            handler: function () {
                this.saved = false
            },
            deep: true
        }
    },
    computed: {
        urlBoxHint: function () {
            return this.config.enableFilter === 'whitelist' ? this.i18n.whitelistHint : this.i18n.blacklistHint
        }
    },
    methods: {

        getI18nMessage (key) {
           return chrome.i18n.getMessage(key) 
        },

        valueKey (key, defaultValue) {
            return localStorage[key] === undefined ? defaultValue : localStorage[key]
        },

        parseUrls () {
            let filterUrls = this.config.filterUrls
            if (filterUrls) {
                return filterUrls.split(/\n/).filter(function (url) {
                  return url.trim().length > 0;
                }).map((url) => {
                  this.lastUrl = url
                  url = '/' + url.trim() + '/';
                  url = eval(url);
                  return url;
                });
              }
              return [];
        },
        
        save () {
            console.log(this.config)
            try {
                console.log(this.parseUrls())
                localStorage['filterUrlRegs'] = this.parseUrls()
                for (let k in this.config) {
                    localStorage[k] = this.config[k]
                }
                this.saved = true
            } catch (error) {
                alert(this.i18n.errorReg + ' '+ this.lastUrl)
                console.log(error)
            }
        }
    }
})

