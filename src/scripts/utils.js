// outil de conversion markdown / html
var markdown = require("markdown").markdown;

var Utils = function() {}

Utils.prototype.markDownToHTML = function(content) {
    return markdown.toHTML(content);
}


module.exports = new Utils();
