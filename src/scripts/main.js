// le depot à utiliser
var SOURCE = "remipassmoilesel/MarkDown-GitUp";

// chargement d'angular
var angular = require("angular");
require("angular-sanitize");

var angMod = angular.module("markdownGithub", ["ngSanitize"]);

// service de manipulations des publications
require("./services/publications-service.js")(angMod, SOURCE);

// module d'affichage des repos
require("./components/availables-repos/availables-repos-component.js")(angMod);

// affichage des publications disponibles
require("./components/availables-publications/availables-publications-component.js")(angMod);

angMod.run(function($http) {

    console.log("mardown-github initalized !");

    $http.get("https://api.github.com/repos/remipassmoilesel/MarkDown-GitUp/git/trees/master?recursive=1")
        .then(function(response) {
            console.log(response);
        });

});
