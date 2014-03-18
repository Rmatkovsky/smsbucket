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
        events: {
        },
        initialize: function(options) {
            var self = this;
            this.confirmId = options.hash;
            this.requestQuery = new Parse.Query("Requests");
            this.requestQuery.get(options.hash, {
                success: function(requestItem) {
                    self.sendDonation();
                    self.render();
                },
                error: function(object, error) {
                    self.render(error);
                }
            });

        },

        sendDonation: function(e) {
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
                    link: 'link'
                }));
            }

            this.delegateEvents();
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
        } else {
            new ConfirmView(this.attr);
        }

    }
  });

    var AppRouter = Parse.Router.extend({
        routes: {
            "sms/:id": "sms",
            "confirm/:id": "confirm"
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
//            Parse.Cloud.run('addDonation',{
//                "senderName":"Sdfs",
//                "photoId":"AYrFQa8fUM",
//                "phoneNumber":"4550600468",
//                "donate":50,
//                "senderEmail":"Ewr",
//                "greetingText":"Please create all AD, FD, ITD, Travel Requests and requests to other Ciklum departments in new ServiceDesk, and please update your bookmarks.",
//                "recipientPhoneNumber":"4522671837"
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
        }

  });

  var hash = new Hash;

  new AppRouter;
 //
  Parse.history.start();
});
