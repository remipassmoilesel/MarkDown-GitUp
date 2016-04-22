/**
 * Afficher les depots github d'un utilisateur
 *
 * @type
 */

// récuperer le template et le css
var template = require('./availables-repos-template.html');
require('./availables-repos-component.css');

var constants = require("../../constants.js");

var AvailablesReposController = function($http, $scope) {

    // conserver les références des services
    this.$http = $http;
    this.$scope = $scope;

    this.errorMessage = "";

    this.updateRepos();

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
AvailablesReposController.$inject = ["$http", "$scope"];

/**
Mettre à jour les depots disponibles
*/
AvailablesReposController.prototype.updateRepos = function() {
    var vm = this;
    this.$http.get(constants.githubApiUsers + this.username + "/repos")
        .then(function(response) {

            vm.repos = [];

            for (var i = 0; i < response.data.length; i++) {
                var rep = response.data[i];
                vm.repos.push({
                    name: rep.name,
                    language: rep.language,
                    sizeBytes: rep.size
                });
            }

        })

    .catch(function(response) {
        vm.publications = [];
        vm.errorMessage = "Erreur lors de l'accés aux ressources.";
    });

};

module.exports = function(angularMod) {
    angularMod.component("availablesRepos", {
        template: template,
        controller: AvailablesReposController,
        bindings: {
            username: "@"
        }
    });
};
