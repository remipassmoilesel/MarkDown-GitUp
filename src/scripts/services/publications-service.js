/**
Service d'obtention de publications disponibles en lignes.

Le service va rechercher à la base du depot spécifié ci-dessous un dossier 'publications'
et lister tous les fichiers '.md'.

Le service organisera les publications en catégories si
elles sont placées dans des dossiers

*/

var PUBLICATION_DIRECTORY_NAME = "publications";
var CATEGORIE_DESCRIPTION_FILE = "description.md";


var PublicationsService = function($http) {
    this.$http = $http;

    this.updatePublications();
};
PublicationsService.$inject = ['$http'];


var PublicationsService.prototype.getPublications = function() {
    return this.publications;
};

/**
Mettre à jour les publications disponibles
*/
PublicationsService.prototype.updatePublications = function() {
        var vm = this;
        var request = "https://api.github.com/repos/" + this.repository + "/contents" + this.publicationFolderName;
        this.$http.get(request)
            .then(function(response) {

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
            var id = "publications";
            angularMod.service(id, PublictionsService);
            return id;
        };
