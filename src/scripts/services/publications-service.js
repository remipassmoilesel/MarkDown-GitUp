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

        // console.log(request);

        // demander un dossier
        return vm.$http.get(request)

        // requete executée avec succes
        .then(
            function(response) {

                var output = [];

                // itérer les fichiers et ajouter leurs desritptions
                var descriptionIndex = -1;
                response.data.forEach(function(file, index) {
                    // verifier le nom et le type du fichier
                    if (file.type === 'dir' || file.name.endsWith(".md")) {

                        // l'enregistrer
                        var f = {
                            category: path,
                            type: file.type,
                            name: file.name,
                            path: file.path,
                            download_url: file.download_url
                        };
                        output.push(f);

                        if (file.name === constants.descriptionFileName) {
                            descriptionIndex = index;
                        }
                    }
                });

                // si le dossier contient un descripteur récupérer son contenu
                // et retourner le tout
                if (descriptionIndex !== -1) {
                    var f = output[descriptionIndex];
                    return vm.$http.get(f.download_url)
                        .then(function(response) {
                            f.content = response.data;
                            return output;
                        })
                        .catch(function(response) {
                            console.log(response);
                            f.content = constants.defaultErrorMessage;
                            return output;
                        });
                }

                // sinon retourner directement le tout
                 else {
                    return output;
                }
            }
        )

        // erreur lors de la requete
        .catch(function(resp) {
            console.log(resp);
            return [constants.defaultErrorMessage];
        });
    };

    // lister le répertoire de publications
    return processFolder(constants.publicationDirectory)
        .then(function(list) {

            var output = [];

            list.forEach(function(file) {
                console.log(file);
            })

        });

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
