/**
 * En tete de page
 *
 */

var template = require("./content-container-template.html");
require("./content-container-template.css");

var constants = require("../../constants.js");

var ContentContainerController = function($http, $scope, publications) {

    // liste des articles
    this.articles = [];
    this.publications = publications;

    this.updateArticles();

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
ContentContainerController.$inject = ["$http", "$scope", constants.servicePublications];

/**
 * Mettre  jour la liste d'articles
 * @return {[type]} [description]
 */
ContentContainerController.prototype.updateArticles = function() {
    var vm = this;

    // recupere la liste de publications
    this.publications.getPublicationList()
        .then(function(publicationContainer) {

            vm.links = [];

            for(cat in publicationContainer.categories){

                vm.links.push({
                    label: cat,
                    href: publicationContainer.categories[cat].url_display,
                    class: "contentComponentMenuCategory"
                });

                // itérer les articles
                for (var i = 0; i < publicationContainer.categories[cat].articles.length; i++) {
                    var art = publicationContainer.categories[cat].articles[i];

                    vm.links.push({
                        label: art.name,
                        href: art.url_display,
                        class: "contentComponentMenuElement"
                    });

                }
            }

        })

    .catch(function(error) {
        console.log(error);

        vm.articles = [];
        vm.categories = [];
    });
};


module.exports = function(angularMod) {
    angularMod.component("content", {
        template: template,
        controller: ContentContainerController,
        bindings: {}
    });
};
