// le depot à utiliser
var SOURCE = "remipassmoilesel/MarkDown-GitUp";

// chargement d'angular
var angular = require("angular");
require("angular-sanitize");
require("angular-material/angular-material.css");
require("angular-messages");
require("angular-route");
require("angular-animate");
require("ng-draggable");

/**
 * Application principale
 * @param  {[type]} "markdownGithub" [description]
 * @param  {[type]} ["ngSanitize"    [description]
 * @param  {[type]} "ngRoute"]       [description]
 * @return {[type]}                  [description]
 */
var angMod = angular.module("markdownGithub", ["ngSanitize", "ngRoute"]);

require("./views/routes.js")(angMod);

// service de manipulations des publications
require("./services/publications-service.js")(angMod, SOURCE);

// module d'affichage des repos
require("./components/availables-repos/availables-repos-component.js")(angMod);

// affichage des publications disponibles
require("./components/availables-publications/availables-publications-component.js")(angMod);

// en tete de page
require("./components/header/header-component.js")(angMod);

// contenu de page
require("./components/content-container/content-container-component.js")(angMod);

angMod.run(function($http) {

    // $http.get("https://api.github.com/repos/remipassmoilesel/MarkDown-GitUp/git/trees/master?recursive=1")
    //     .then(function(response) {
    //         console.log(response);
    //     });

});
