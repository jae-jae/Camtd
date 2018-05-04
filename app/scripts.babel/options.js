'use strict';

new Vue({
    el: '#app',
    data () {
        return {
            config: {
                enabled: parseInt(this.valueKey('enabled',1)),
                path: this.valueKey('path','http://localhost:6800/jsonrpc'),
                size: parseFloat(this.valueKey('size',0))
            },
            saved: false
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
    methods: {
        valueKey (key, defaultValue) {
            return localStorage[key] === undefined ? defaultValue : localStorage[key]
        },
        
        save () {
            console.log(this.config)
            for (let k in this.config) {
                localStorage[k] = this.config[k]
            }
            this.saved = true
        }
    }
})

