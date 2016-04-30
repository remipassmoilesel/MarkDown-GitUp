/**
 * En tete de page
 *
 */

var template = require("./content-container-template.html");

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
        .then(function(list) {

            vm.links = [];

            vm.articles = [];
            vm.categories = [];

            // séparer les categories des publications
            list.forEach(function(elmt) {
                if (elmt.type === 'category') {
                    vm.categories.push(elmt);
                } else {
                    vm.articles.push(elmt);
                }
            });

            console.log(vm.categories);
            console.log(vm.articles);

            // trier les categories et les publications
            vm.categories.forEach(function(elmt) {

                // insertion de la catégorie
                vm.links.push({
                    url_display: elmt.url_category,
                    name: elmt.category,
                });

                // recherche de tous les liens associés
                for (var i = 0; i < vm.articles.length; i++) {
                    var art = vm.articles[i];

                    console.log("for (var i = 0; i < vm.articles.length; i++) {");
                    console.log(elmt.category);
                    console.log(art.category);

                    if (art.category === elmt.category) {
                        vm.links.push({
                            url_display: elmt.url_article,
                            name: elmt.name,
                        });
                    }
                }
            });

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
