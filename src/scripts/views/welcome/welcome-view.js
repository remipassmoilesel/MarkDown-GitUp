/**
 * Recherche de patients et d'infirmier
 */

var constants = require("../../constants.js");

module.exports = {
    urlPatterns: [
        "/welcome"
    ],
    template: require("./welcome-template.html"),

    controller: [
        "$routeParams", constants.servicePublications,

        function($routeParams, publications) {

            var vm = this;

            // récupérer la publication index
            publications.searchContentByObject({
                    name: "index"
                })
                .then(function(response) {
                    vm.indexContent = response;
                    console.log(response);
                });

        }
    ]
};
