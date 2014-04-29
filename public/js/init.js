// An example Parse.js Backbone application based on the todo app by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses Parse to persist
// the todo items and provide user authentication and sessions.

$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("X0UY3A7Y78VafC2i6LDnVce3FBd6WKN8TDXpHOkv",
                   "zHM3CGx2uWTbzE4Ek1CPSWAzHt3QC8amCC1tI0gT");

    var models = typeof exports === 'undefined' ? {} : exports;
    var Hash = Parse.Object.extend("Hash",{
        default: {
            hash: null
        }
    })


    var SmsView = Parse.View.extend({
    statsTemplate: _.template($('#smsblock').html()),
    errorTemplate: _.template($('#smsblockerror').html()),
    template: null,
    imgurl: null,
    el: ".content",
    initialize: function(options) {
        var self = this;
        this.requestQuery = new Parse.Query("Requests");
        this.requestQuery.get(options.hash, {
            success: function(requestItem) {
                self.imagesQuery = new Parse.Query("Pictures");
                self.imagesQuery.get(requestItem.get('imageId').id,{
                    success: function(imageItem){
                        self.template = requestItem.get('text');
                        self.imgurl = imageItem.get('url_image').url();
                        self.render();
                    }
                });
            },
            error: function(object, error) {
                self.render(error);
            }
        });

    },


    render: function(error) {
        var self = this;
        if(!!error) {
            this.$el.html(this.errorTemplate({
                error: error.message
            }));
        }
        else
        {
            this.$el.html(this.statsTemplate({
                terms:    self.terms,
                template: self.template,
                imgurl:   self.imgurl
            }));
        }

      this.delegateEvents();
    }
    });

    var ConfirmView = Parse.View.extend({
        statsTemplate: _.template($('#confirmblock').html()),
        errorTemplate: _.template($('#confirmblockerror').html()),
        el: ".content",
        confirmId: null,
        donation: 0,
        events: {
        },
        initialize: function(options) {
            var self = this;
            this.confirmId = options.hash;
            this.requestQuery = new Parse.Query("Requests");
            this.requestQuery.equalTo("objectId",options.hash);
            this.requestQuery.equalTo("used",false);
            this.requestQuery.find({
                success: function(requestItem) {
                    if(requestItem.length>0) {
                        self.donation = requestItem[0].get('donation');
                        self.sendDonation();
                        self.render();
                    } else {
                        self.render({message: 'Object not found'});
                    }

                },
                error: function(object, error) {
                    self.render(error);
                }
            });

        },

        sendDonation: function() {
            var self = this;
            Parse.Cloud.run('sendDonation',{confirmId: self.confirmId},{
                success: function(res){
                    console.log(res)
                },
                error: function(res) {
                    console.log(res)
                }
            });
        },

        render: function(error) {
            var self = this;
            if(!!error) {
                this.$el.html(this.errorTemplate({
                    error: error.message
                }));
            }
            else
            {
                this.$el.html(this.statsTemplate({
                    donation: self.donation
                }));
            }

            this.delegateEvents();
        }
    });


    var DonationView = Parse.View.extend({
        sendsuccess: _.template($('#sendsuccess').html()),
        step4: _.template($('#step4').html()),
        step5: _.template($('#step5').html()),
        step6: _.template($('#step6').html()),
        el: ".content",
        image: null,
        options: {
            "phoneNumber":null,
            "donate": 50,
            "senderName": null,
            "senderEmail": null,
            "recipientPhoneNumber": null,
            "photoId": null,
            "greetingText": null
        },
        events: {
            'click .kr-select li': 'selectDonation',
            'click .nextStep': 'nextToStep',
            'click #backToApp': 'backToApp',
            'click .sendDonation': 'sendDonation',
            'click #newDonation': 'goToDonation'
        },
        initialize: function(options) {
            var self = this;

            this.options.recipientPhoneNumber = options.params.receiver_phone_number;
            this.options.photoId = options.params.image_id;
            this.options.greetingText = options.params.greeting_text;

            var Image = Parse.Object.extend("Pictures"),
                imageQuery = new Parse.Query(Image);

            imageQuery.get(this.options.photoId, {
                success: function(image) {
                    self.image = image;
                }
            });

            this.render('step4');
        },
        backToApp: function() {
            Parse.history.navigate('backToApp');
        },
        nextToStep: function(e) {
            var step = $(e.target).data('step');
            if(step=='6') {
                if((this.options.senderName = this.$el.find('#donatorName').val()) &&
                    (this.options.senderEmail = this.$el.find('#email').val()) &&
                    (this.options.phoneNumber = this.$el.find('#phone').val())) {

                    this.render('step'+step);
                }
            } else {

                this.render('step'+step);
            }
        },
        goToDonation: function() {
            Parse.history.navigate('newDonation');
        },
        selectDonation: function(e) {
            this.options.donate = $(e.target).data('donation');
            $('.kr-select li').removeClass('active');
            $(e.target).addClass('active');
        },
        sendDonation: function(e) {
            var self = this;
            Parse.Cloud.run('addDonation',self.options,{
                success: function(res){
                    self.render('sendsuccess');
                },
                error: function(res) {
                    var result = JSON.parse(res.message);

                    switch(result.status+''){
                        case '400': alert('Kontroller venligst det indtastede og prøv igen');break;
                        case '501': alert('Tjenesten er midlertidig utilgængelig. Prøv venligst senere');break;
                        default : alert('Unknown error');
                    }
                }
            });
        },
        render: function(template) {
            var self = this;

            switch(template) {
                case 'step4': {
                    this.$el.html(this.step4());
                    $('.kr-select li').removeClass('active');
                    $('.kr-select li[data-donation="' + this.options.donate + '"]').addClass('active');
                } break;
                case 'step5': {
                    this.$el.html(this.step5({
                        "donatorName": self.options.senderName,
                        "email": self.options.senderEmail,
                        "phoneNumber": self.options.phoneNumber
                   }));
                } break;
                case 'step6': {
                    this.$el.html(this.step6({
                        "imageUrl": (self.image)?self.image.get('url_image').url() : null,
                        "greetingText": self.options.greetingText
                    }));
                } break;
                case 'sendsuccess': { this.$el.html(this.sendsuccess()); }
            }

        }
    });

  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#smsapp"),

    initialize: function(attributes) {
        this.attr = attributes;
        this.render();
    },

    render: function() {
        if(this.attr.view == 'sms') {
            new SmsView(this.attr);
        } else if(this.attr.view == 'confirm') {
            new ConfirmView(this.attr);
        } else if(this.attr.view == 'donation') {
            new DonationView(this.attr);
        }


    }
  });

    var AppRouter = Parse.Router.extend({
        routes: {
            "sms/:id": "sms",
            "confirm/:id": "confirm",
            "donation/:params":"donation",
            "callback/:params":"callback"
        },

        initialize: function(options) {
//            Parse.Cloud.run('confirmPhoneNumber',{phoneNumber: 4550600468},{
//                success: function(res){
//                    console.log(res)
//                },
//                error: function(res) {
//                    console.log(res)
//                }
//            });
//            Parse.Cloud.run('checkSms',{requestId: 'QWjWSh9w86',smsCode: 8927},{
//                success: function(res){
//                    console.log(res)
//                },
//                error: function(res) {
//                    console.log(res)
//                }
//            });
//            console.log(1);
//            Parse.Cloud.run('addDonation',{
//                "senderName":"Sdfs",
//                "photoId":"AYrFQa8fUM",
//                "phoneNumber":"004522798828",
//                "donate":50,
//                "senderEmail":"Ewr",
//                "greetingText":"Please create all AD, FD, ITD, Travel Requests and requests to other Ciklum departments in new ServiceDesk, and please update your bookmarks.",
//                "recipientPhoneNumber":"004522798828"
//            },{
//                success: function(res){
//                    console.log(res)
//                },
//                error: function(res) {
//                    console.log(res)
//                }
//            });
        },
        sms: function(id) {
            new AppView({hash:id,view: 'sms'});
        },
        confirm: function(id) {
            new AppView({hash:id,view: 'confirm'});
        },
        donation: function(params) {
            new AppView ({params:getQueryVariable(params), view:'donation'})
        },
        callback: function(params){
            var Requests = Parse.Object.extend("Request"),
                requestsQuery = new Parse.Query("Requests"),
                jParams = getQueryVariable(params);

            requestsQuery.get(jParams.sessionid, {
                success: function(item) {
                    item.set('status',jParams.statuscode);
                    item.save();
                }
            });
        }

  });

  var hash = new Hash;

  new AppRouter;
  Parse.history.start();

});

function getQueryVariable(uri) {
    var query = uri,
        response = {};
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        response[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return response;
}
