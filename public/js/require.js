requirejs.config({
    baseUrl: '/js',
    urlArgs : "v=0.1",
    enforceDefine: true,
    paths: {
        jquery:     '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.2/jquery.min',

        underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min',
        backbone:   '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
        parse:      '//www.parsecdn.com/js/parse-1.2.13.min',
    },
    shim: {

        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },

        parse: {
            deps: ['authkeys'],
            exports: 'Parse',
            init: function () {
//                var authkeys = require('authkeys');
//                var appType;
//                switch (location.hostname) {
//                    case 'rewardable.com':
//                    case 'www.rewardable.com':
//                    case 'rewardable.parseapp.com':
//                    case 'ipsosrealitycheck.com':
//                    case 'www.ipsosrealitycheck.com':
//                        appType = 'production';
//                        break;
//                    case 'rewardable-staging.parseapp.com':
//                        appType = 'staging';
//                        break;
//                    default:
//                        appType = 'dev';
//                }
//                Parse.initialize(authkeys[appType].applicationId,
//                    authkeys[appType].javascriptKey);
            }
        },
        urls: {
            exports: 'urls'
        }
    }
});
define({}); // dummy define to appease the enforceDefine setting
