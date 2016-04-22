/**
 * Afficher les publications disponibles dans un dépot github.
 * Ce composant va rechercher tous les fichiers d'un depot présents dans un dossier
 * "publications" portant l'extension ".md"
 */

// récuperer le template et le css
var template = require('./availables-publications-template.html');
require('./availables-publications-component.css');

var constants = require("../../constants.js");

var AvailablesPublicationsController = function($http, $scope, publications) {

    // conserver les références des services
    this.$http = $http;
    this.$scope = $scope;
    this.publications = publications;

    this.currentPublication = "";

    // conversion markdown / html
    this.markdown = require("markdown").markdown;

    this.updatePublicationList();

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
AvailablesPublicationsController.$inject = ["$http", "$scope", constants.servicePublications];

/**
 * Afficher une publication dans le composant
 * @param  {[type]} publication [description]
 * @return {[type]}             [description]
 */
AvailablesPublicationsController.prototype.showPublication = function(publication) {
    var vm = this;
    this.publications.getContentOf(publication)
        .then(function(pubContent) {
            console.log(pubContent);
            vm.currentPublication = vm.markdown.toHTML(pubContent);
        });
}

/**
Mettre à jour les publications disponibles
*/
AvailablesPublicationsController.prototype.updatePublicationList = function() {

    var vm = this;

    this.publications.getPublicationList()
        .then(function(list) {
            vm.publicationList = list;
        })

    .catch(function(error) {
        console.log(error);
        vm.publicationList = [];
        vm.errorMessage = "Erreur lors de l'accés aux ressources.";
    });

};

module.exports = function(angularMod) {
    angularMod.component("availablesPublications", {
        template: template,
        controller: AvailablesPublicationsController,
        bindings: {
            repository: "@"
        }
    });
};
