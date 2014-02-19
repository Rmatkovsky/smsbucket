define (['backbone',  'urls','utils','pages/smspage'],
    function (Backbone,     urls,utils, SmsPage ) {
        "use strict";

        var SMSApp = Backbone.View.extend({
            initialize: function () {
                this.setElement(document);
                // initialize the main router for the app
                new (utils.PageRouter.extend({
                    pages: {
                        'sms':    SmsPage
                    },
                    urls: urls.urls
                }));
                Backbone.history.start({ pushState: true });

                this.render();

            },
            events: {

            },

            render: function () {
//                var user = Parse.User.current();
//                $('#account-label').text(user.get('businessName'));
            }
        });

        // start the rewardable app once the page's dom is loaded
        $(function () { new SMSApp(); });
    });
