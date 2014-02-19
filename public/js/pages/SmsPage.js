define (['backbone','template'],
    function (Backbone, Template) {
        "use strict";

        var SmsView = Backbone.View.extend({
            events: {
            },
            initialize: function () {
                //var user = Parse.User.current();
                this.setElement(new Template('sms'));


                this.render();
            },
            render: function () {

                return this.el.render({
                    title:   'text'
//                    productName: this.model.get('productName'),
//                    submittedAt: submittedAt ? submittedAt.toLocaleFormat('%m/%d/%y') : "Draft",
//                    expiresAt:   expiresAt ? expiresAt.toLocaleFormat('%m/%d/%y') : "Never",
//                    textStatus:  textStatus,
//                    businessName: this.model.get('creator').get('businessName')
                });

            }
        });



        return SmsView;
    });
