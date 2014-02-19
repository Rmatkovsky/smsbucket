define (['backbone', 'underscore'],
function (Backbone,   _) {
  "use strict";

  var exports = {};

  // shortcut for console.log that can be applied to any `this` argument
  exports.log = function() {
    console.log.apply(console, arguments);
  };

  exports.feetPerMile = 5280;

  // unfortunately Parse breaks the global jQuery ajaxSend/ajaxError events, so
  // we have to handle ajax errors using this instead.
  exports.handleAjaxErrors = function (model) {
    model.on('sync', function () {
      $('#error').removeClass('in');
    });
    model.on('error', function (_, error) {
      exports.showError(error.message);
    });
  };

  exports.showError = function (error) {
    $('#error').addClass('in').contents().get(-1).data = error;
  };

  exports.assert = function (assertion, message) {
    if (!assertion) {
      throw new Error('Assertion error: ' + (message || '(no message)'));
    }
  };

  exports.fetchCampaign = function (campaignId, callbacks) {
    if (typeof campaignId === 'undefined') {
      // if no campaignId was specified, create a new campaign
      callbacks.success(new models.Campaign);
    } else if (campaignId instanceof models.Campaign) {
      callbacks.success(campaignId);
    } else {
      new Parse.Query(models.Campaign).include('questions').get(campaignId, {
        success: function (campaign) {
          if (campaign.publishedAt) {
            callbacks.error(new Error('Campaign has already been published'));
          } else {
            // If the campaign hasn't been published, success!
            callbacks.success(campaign);
          }
        },
        error: function (error) {
          console.log('error', error);
          callbacks.error(error);
        }
      });
    }
  };

  exports.concatUserName = function (firstName, lastName) {
    var name = [];
    if (firstName) { name.push(firstName); }
    if (lastName)  { name.push(lastName);  }
    return name.join(' ');
  };


  exports.toISODateString = function (date) {
    return date.toISOString().substring(0, 10);
  };

  /* Navigates to the given url. If `Page` is undefined, the router will be
   * triggered with the new URL. Otherwise, if `Page` is defined, a new Page
   * view will be constructed with the remaining arguments passed to navigate.
   */
  exports.navigate = function (url, Page /*, args... */) {
    var hasPage = Page !== undefined;
    Backbone.history.navigate(url, {trigger: !hasPage});
    if (hasPage) {
      var args = _.map(arguments, function (x) { return x; });
      args.shift(); args.shift(); // get rid of the `url` and `Page` arguments
      navigatePage(Page, args);
    }
  };

  // Creates a new page with the given arguments and adds it to the dom.
  function navigatePage(Page, args) {
    args = [null, {}].concat(_.toArray(args));
    var page = new (Page.bind.apply(Page, args));
    document.title = "Rewardable | " + page.title;
    $('h1').text(page.title);
    $('.tabs li').removeClass('active');
    if (page.tab) {
      $('#' + page.tab + '-tab').addClass('active');
    }
    $('#pages').empty();
    $('#pages').append(page.el);

  }

  exports.PageRouter = Backbone.Router.extend({
    _bindRoutes: function () {
      var pages = this.pages;
      this.routes = _.object(_.map(this.urls, function (routeName, routeURL) {
        var Page = pages[routeName];
        return [routeURL, function () { navigatePage(Page, arguments); }];
      }));

      Backbone.Router.prototype._bindRoutes.call(this, arguments);
    }
  });

  /* Inserts the DOM item into the DOM container as that index'th child of
   * the container
   */
  exports.insertAt = function (container, item, index) {
    var children = container.children();

    if (index > children.size()) {
      throw Error('Index too large in utils.insertAt. Index is: ' +
                  index + ', but container only has ' + children.size() +
                  ' elements.');
    }

    if (index === 0) {
      container.prepend(item);
    } else {
      $(children.get(index-1)).after(item);
    }
  };

  exports.shrinkImageAndUpload = function(file, maxSize, options) {
    var reader = new FileReader();

    reader.onloadend = function() {
      var image = new Image();
    
      image.src = reader.result;

      image.onload = function() {
        var uploadedFile;
        var imageWidth = image.width;
        var imageHeight = image.height;


        if ((imageWidth > maxSize) || (imageHeight > maxSize)) {
          if (imageWidth > imageHeight) {
            if (imageWidth > maxSize) {
              imageHeight *= maxSize / imageWidth;
              imageWidth = maxSize;
            }
          }
          else {
            if (imageHeight > maxSize) {
              imageWidth *= maxSize / imageHeight;
              imageHeight = maxSize;
            }
          }

          console.log("imageWidth = " + imageWidth + ", imageHeight = " + imageHeight);

          var canvas = document.createElement('canvas');

          canvas.width = imageWidth;
          canvas.height = imageHeight;

          var ctx = canvas.getContext("2d");

          ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

          // The resized file ready for upload
          var finalFile = canvas.toDataURL(file.type);

          uploadedFile = new Parse.File(file.name, {base64: finalFile.substring(finalFile.indexOf(',') + 1)});
        }
        else {
          uploadedFile = new Parse.File(file.name, file);
        }

        uploadedFile.save({
          success: function (uploadedFile) {
            if (options && options.success) {
              uploadedFile.save();
              options.success(uploadedFile);
            }
          },
          error: function () {
            if (options && options.error) {
              options.error();
            }
          }
        });
      }
    }

    reader.readAsDataURL(file);
  }

  return exports;
});

Date.prototype.toLocaleFormat = function(format) {
    var f = {y : this.getYear() + 1900,m : this.getMonth() + 1,d : this.getDate(),H : this.getHours(),M : this.getMinutes(),S : this.getSeconds()}
    for(var k in f)
        format = format.replace('%' + k, f[k] < 10 ? "0" + f[k] : f[k]);

    return format;
};
