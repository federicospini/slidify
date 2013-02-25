var mustache = require('mustache');
var request = require('superagent');
var fs = require('fs');
var highlight = require('highlight.js');
var marked = require('marked').parse;

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  highlight: function(code, lang) {
    if (lang === 'js') {
      return highlight.highlightAuto(code).value;
    }
    return code;
  }
});

var template_file = __dirname + '/template.html';
var code_style_file = __dirname + '/code-github-style.css';

/**
 * Expose build module
 */

module.exports = function (file) {
  var template_data = fs.readFileSync(template_file, 'utf-8');
  var code_style_data = fs.readFileSync(code_style_file, 'utf-8');
  var template = mustache.compile(template_data);


  return function (file, callback) {
    request
      .get(file)
      .end(function (res) {
        if (!res.ok) {
          callback(res.error);
          return;
        }

        var slides = template({
          code_style: code_style_data,
          body: res.text
            .split(/\n[- ]+ *\n/)
            .map(function (data) {
              return '\n<article>\n' + marked(data) + '\n</article>\n';
            })
            .join('\n\n<!-- slide -->\n\n')
        });

        callback(null, slides);
      });
  };
};