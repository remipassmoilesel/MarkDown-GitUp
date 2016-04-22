/**
Service d'obtention de publications disponibles en lignes.

Le service va rechercher à la base du depot spécifié ci-dessous un dossier 'publications'
et lister tous les fichiers '.md'.

Le service organisera les publications en catégories si
elles sont placées dans des dossiers

*/

var constants = require("../constants.js");

var PublicationsService = function(repository, $http) {
    this.$http = $http;
    this.constants = constants;
    this.repository = repository;

    this.updatePublicationList();
};
PublicationsService.$inject = ['$http'];

/**
 * Obtenir un tableau d'objet décrivant les publications
 * @return {[type]} [description]
 */
PublicationsService.prototype.getPublicationList = function() {
    return this.publications;
};

PublicationsService.prototype.getFileContent = function(filePath) {
    var request = constants.githubApiRepos + vm.repository + "/contents/" + filePath;
    return this.$http.get(request)
        .then(function(response) {
            console.log("PublicationsService.prototype.getFileContent(filePath)");
            console.log(response);
            return response;
        });
};

/**
 * Mettre à jour la liste des publications disponibles. Liste tous les fichiers correspondant
 * et télécharge les description de catégories.
 * @return {[type]} [description]
 */
PublicationsService.prototype.updatePublicationList = function() {

    var vm = this;

    // Retour à attendre
    // var output = {
    //     categories : [],
    //     publications : []
    // }

    // lister les fichiers et ne retenir que les fichiers finissant
    // '.md' et les dossiers
    var processFolder = function(path) {

        var request = constants.githubApiRepos + vm.repository + "/contents/" + path;

        console.log(request);

        // demander un dossier
        return vm.$http.get(request)

        // requete executée avec succes
        .then(
            function(response) {

                // console.log(response);

                var output = [];
                response.data.forEach(function(file) {
                    if (file.type === 'dir' || file.name.endsWith(".md")) {

                        var f = {
                            type: file.type,
                            name: file.name,
                            path: file.path
                        };
                        output.push(f);

                        if (file.name === constants.descriptionFileName) {
                            vm.getFileContent(file.path).then(function(content) {
                                console.log("PublicationsService.prototype.updatePublicationList = function() {");
                                console.log(content);
                                f.content = content;
                            });
                        }
                    }
                });

                return output;
            }
        )

        // erreur lors de la requete
        .catch(function(resp) {
            console.log(resp);
            return ["Erreur lors du traitement de la requête"];
        });
    };

    // lister le répertoire de publications
    return processFolder(constants.publicationDirectory).then(function(list) {

        console.log("return processFolder(constants.publicationDirectory).then(function(list) {");
        console.log(list);

        var output = [];

        list.forEach(function(file) {

        })


    })

};

/**
 * Prends en paramétre un nom depot au format user/rep
 * @param  {[type]} angularMod [description]
 * @param  {[type]} repository [description]
 * @return {[type]}            [description]
 */
module.exports = function(angularMod, repository) {

    if (typeof repository === undefined) {
        throw "You must specify a repository !";
    }

    var id = constants.servicePublications;

    // fabrication du service
    angularMod.factory(id, function($http) {
        return new PublicationsService(repository, $http);
    });

    return id;
};
