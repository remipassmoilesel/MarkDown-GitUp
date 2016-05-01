/**
 * Recherche de patients et d'infirmier
 */

var constants = require("../../constants.js");
var utils = require("../../utils.js");

module.exports = {
    urlPatterns: [
        "/category/:name"
    ],
    template: require("./showCategory-template.html"),

    controller: [
        "$routeParams", constants.servicePublications,

        function($routeParams, publications) {

            // nom et categorie de l'article
            this.categoryName = $routeParams["name"];

            this.articles = [];

            var vm = this;
            // récuperer le contenu de la publication
            publications.getPublicationList()
                .then(function(response) {

                    console.log(vm.categoryName);
                    console.log(response);

                    if(typeof response.categories[vm.categoryName] !== "undefined"){
                        var content = response.categories[vm.categoryName].descriptionContent;
                        vm.categoryContent = utils.markDownToHTML(content);
                        vm.articles = response.categories[vm.categoryName].articles;
                    }

                    else {
                        vm.categoryContent = "";
                        vm.articles = [];
                    }


                });

            // emplacement de la publication
            this.location = this.categoryName + " / ";

        }
    ]
};
