
// le depot à utiliser
var REPOSITORY = "remipassmoilesel/markdown-github";

// chargement d'angular
var angular = require("angular");
var angMod = angular.module("markdownGithub", []);

// service de manipulations des publications
require("./services/publications-service.js")(angMod, REPOSITORY);

// module d'affichage des repos
require("./components/availables-repos/availables-repos-component.js")(angMod);

// affichage des publications disponibles
require("./components/availables-publications/availables-publications-component.js")(angMod);

angMod.run(function($http) {
    console.log("mardown-github initalized !");
});
