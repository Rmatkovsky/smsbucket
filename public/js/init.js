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

    models.Image = Parse.Object.extend("Pictures",{
        defaults: function() {
            return {
                url_image: '',
                url_image2x: '',
                url_thumb: '',
                url_thumb2x: ''
            }
        },
        requiredFields: {
            url_image: Parse.File,
            url_image2x: Parse.File,
            url_thumb: Parse.File,
            url_thumb2x: Parse.File
        }
    });

    models.Text = Parse.Object.extend("Texts",{
        defaults: function() {
            return {
                template: '',
                terms: ''
            }
        },
        requiredFields: {
            template: String,
            terms: String
        }
    });

    models.SmsHistory = Parse.Object.extend("sendsms",{
        initialize: function() {
            var self = this;
        },
        defaults: function() {
            return {
                imageId: null,
                textId: null
            }
        },
        requiredFields: {
            imageId: models.Image,
            textId: models.Text
        }
    });

    models.ImageList = Parse.Collection.extend({
        model: models.Image,
        setQuery: function (options) {
        },
        fetch: 10
    });

    models.TextList = Parse.Collection.extend({
        model: models.Text,
        setQuery: function (options) {
        },
        fetch: 10
    });

    models.SmsList = Parse.Collection.extend({
        model: models.SmsHistory,
        setQuery: function (options) {

            this.query.ascending('createdAt');
        },
        fetch: 10
    });

  var SmsView = Parse.View.extend({
    statsTemplate: _.template($('#smsblock').html()),
    errorTemplate: _.template($('#smsblockerror').html()),
    terms: null,
    template: null,
    imgurl: null,

    el: ".content",
    initialize: function(options) {
        var self = this;
        this.sms = new models.SmsList;
        this.sms.query = new Parse.Query(models.SmsHistory);
        this.sms.query.get(options.hash, {
            success: function(item) {
                this.text = new models.TextList;
                this.text.query = new Parse.Query(models.Text)

                this.image = new models.ImageList;
                this.image.query = new Parse.Query(models.Image)
                Parse.Promise.when(this.text.query.get(item.get('textId').id,{
                        success: function(response) {
                            self.terms = response.get('terms');
                            self.template = response.get('template');

                        }
                    }), this.image.query.get(item.get('imageId').id,{
                        success: function(response) {
                            self.imgurl = response.get('url_image').url();
                        }
                    })).then(function() {
                    self.render();
                })


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

  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    initialize: function(attributes) {
        this.attr = attributes;
      this.render();
    },
      getHash: function() {
          return hash.get("hash")
      },

    render: function() {
        new SmsView(this.attr);
    }
  });

  var AppRouter = Parse.Router.extend({
    routes: {
      "sms/:id": "sms"
    },

    initialize: function(options) {
    },

    sms: function(id) {
        new AppView({hash:id});
    }
  });

  var hash = new Hash;

  new AppRouter;
 //
  Parse.history.start();
});
