// TODO: Poor error messages. Make this better.
define (['jquery'],
function ($) {
  "use strict";

  var templates = null;
  // run this once the entire page has loaded
  function loadTemplates() {
    if (templates) { return; } // abort if templates were already loaded
    templates = {};
    $('[data-template]').each(function (_, template) {
      var $template = $(template);
      templates[$template.attr('data-template')] = template;
      $template.removeAttr('data-template').remove();
    });
  };

  // Looks up the value of an attribute path in an object.
  // E.g.: lookupAttributePath({a:'x'}, 'a')             ==> returns 'x'
  // E.g.: lookupAttributePath({a:{b:{c:'z'}}}, 'a.b.c') ==> returns 'z'
  function lookupAttributePath(object, attributePath) {
    $.each(attributePath.split('.'), function(_, pathSegment) {
      object = object[pathSegment];
    });
    return object;
  }

  // Splices the values of `attributes` into the template's DOM elements that
  // have data-value attributes.
  function renderTemplate(template, attributes) {
    $(template).find('[data-value]').each(function (_, elem) {
      var dataName = $(elem).attr('data-value');
      var value = lookupAttributePath(attributes, dataName);
      if (value === undefined && attributes.get !== undefined) {
        // this permits use of Backbone objects
        value = attributes.get(dataName);
      }

      if (value !== undefined) {
        if (elem.tagName === 'INPUT') {
          $(elem).val(value);
        } if (elem.tagName === 'A') {
          $(elem).attr('href', value);
        } else {
          $(elem).html(value);
        }
      } else {
        if (elem.tagName === 'INPUT') {
          $(elem).val('(undefined)');
        } else {
          $(elem).html('<i style=color:red>undefined</i>');
        } 
      }
    });
    return template;
  }

  function Template(name) {
    templates || loadTemplates();
    var result = $(templates[name]).clone()[0];
    result.render = function (attrs) {
      renderTemplate(this, attrs);
    }
    return result;
  }

  $(loadTemplates); // load templates once the page finishes loading
  return Template;
});
