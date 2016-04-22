/**
 * Afficher les depots github d'un utilisateur
 *
 * @type
 */

// récuperer le template et le css
var template = require('./availables-repos-template.html');
require('./availables-repos-component.css');

var AvailablesReposController = function($http, $scope) {

    // conserver les références des services
    this.$http = $http;
    this.$scope = $scope;

    this.updateRepos();

};
// injection de dépendance sous forme d'un tableau de chaine de caractères
AvailablesReposController.$inject = ["$http", "$scope"];


/**
Mettre à jour les depots disponibles
*/
AvailablesReposController.prototype.updateRepos = function() {
    var vm = this;
    this.$http.get("https://api.github.com/users/" + this.username + "/repos")
        .then(function(response) {

            console.log(response);

            vm.repos = [];

            for (var i = 0; i < response.data.length; i++) {
                var rep = response.data[i];
                vm.repos.push({
                    name: rep.name,
                    language: rep.language,
                    sizeKo: rep.size
                });
            }

        })

    .catch(function(response) {
        vm.repos = response;
        vm.errorMessage = "erreur lors de l'accés aux ressources.";
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
