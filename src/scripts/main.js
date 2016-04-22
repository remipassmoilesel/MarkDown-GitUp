var angular = require("angular");

var angMod = angular.module("markdownGithub", []);

// module d'affichage des repos
require("./components/availables-repos/availables-repos-component.js")(angMod);

angMod.run(function($http) {
    console.log("mardown-github initalized !");
});
