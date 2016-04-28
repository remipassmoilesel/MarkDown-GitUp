/**
 * En tete de page
 *
 */

var template = require("./header-template.html");

var HeaderController = function(){

};

module.exports = function(angularMod) {
    angularMod.component("header", {
        template: template,
        controller: HeaderController,
        bindings: {
        }
    });
};
