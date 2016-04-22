var angular = require("angular");

console.log("Script loading");

angular.module("crossCallApp", [])

    .config(function() {
        console.log();
    })

    .run(function($http) {
        console.log($http);
    });
