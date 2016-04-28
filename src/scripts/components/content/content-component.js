/**
 * En tete de page
 *
 */

var template = require("./content-template.html");

var ContentController = function(){

};

module.exports = function(angularMod) {
    angularMod.component("content", {
        template: template,
        controller: ContentController,
        bindings: {
        }
    });
};
