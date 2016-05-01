/**
 * Recherche de patients et d'infirmier
 */

var constants = require("../../constants.js");
var utils = require("../../utils.js");

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
                    name: constants.indexFileName
                })
                .then(function(response) {
                    vm.indexContent = utils.markDownToHTML(response);
                });

        }
    ]
};
