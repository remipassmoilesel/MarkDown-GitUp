/**
 * Afficher les publications disponibles dans un dépot github.
 * Ce composant va rechercher tous les fichiers d'un depot présents dans un dossier
 "publications" portant l'extension ".md"
 * @type
 */

// récuperer le template et le css
var template = require('./availables-publications-template.html');
require('./availables-publications-component.css');

var AvailablesPublicationsController = function($http, $scope) {

    // conserver les références des services
    this.$http = $http;
    this.$scope = $scope;

    this.publicationFolderName = "publications";

    this.updatePublications();

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
AvailablesPublicationsController.$inject = ["$http", "$scope"];


/**
Mettre à jour les depots disponibles
*/
AvailablesPublicationsController.prototype.updatePublications = function() {
    var vm = this;
    this.$http.get("https://api.github.com/repos/" + this.repository + "/contents/"
        + this.publicationFolderName)
        .then(function(response) {

            console.log(response);

            vm.publications = [];

            for (var i = 0; i < response.data.length; i++) {
                var rep = response.data[i];
                vm.publications.push({
                    name: rep.name
                });
            }

        })

    .catch(function(response) {
        vm.publications = [];
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
