/**
Service d'obtention de publications disponibles en lignes.

Le service va rechercher à la base du depot spécifié ci-dessous un dossier 'publications'
et lister tous les fichiers '.md'.

Le service organisera les publications en catégories si
elles sont placées dans des dossiers

*/

var constants = require("../constants.js");

var PublicationsService = function(repository, $http, $q) {
    this.$http = $http;
    this.constants = constants;
    this.repository = repository;
    this.$q = $q;

    // cache de la liste des publications
    this.publicationList = [];

    // cache des publications
    this.publications = {};

    // première mise à jour de la liste
    this.getPublicationList();
};

/**
 * Retourne le contenu d'une publication
 * @param  {[type]} pub [description]
 * @return {[type]}     [description]
 */
PublicationsService.prototype.getContentOf = function(pub) {

    var vm = this;

    // la ressource n'a jamais été demandée, faire un appel et
    // conserver le résultat en cache
    if (typeof this.publications[pub.download_url] === "undefined") {
        return this.$http.get(pub.download_url)
            .then(function(response) {

                vm.publications[pub.download_url] = response.data;

                return response.data;
            });
    }

    else {
        return this.$q(function(resolve, reject) {
            resolve(vm.publications[pub.download_url]);
        });
    }
};

/**
 * Obtenir un tableau d'objet décrivant les publications
 * @return {[type]} [description]
 */
PublicationsService.prototype.getPublicationList = function() {

    var vm = this;

    // la liste des publications n'a jamais été encore demandé
    if (this.publicationList.length < 1) {
        return this.loadPublicationList()
            .then(function(list) {
                vm.publicationList = list;
                return list;
            });
    }

    // la liste est en cache
    else {
        return this.$q(function(resolve, reject) {
            resolve(vm.publicationList);
        });
    }

};

/**
 * Mettre à jour la liste des publications disponibles. Liste tous les fichiers correspondant
 * et télécharge les description de catégories.
 * @return {[type]} [description]
 */
PublicationsService.prototype.loadPublicationList = function() {

    var vm = this;

    // lister les fichiers et ne retenir que les fichiers finissant
    // '.md' et les dossiers
    var processFolder = function(path, mode) {

        var request = constants.githubApiRepos + vm.repository + "/contents/" + path;

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
                    if ((mode !== 'filesOnly' && file.type === 'dir') || file.name.endsWith(".md")) {

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
            var promises = [];

            list.forEach(function(file) {

                // sous dossier, analyse et conservation de la promesse
                if (file.type === "dir") {

                    var sp = processFolder(file.path, "filesOnly")
                        .then(function(subList) {
                            return subList;
                        });

                    promises.push(sp);
                }

                // fichier standard, ajout simple
                else {
                    output.push(file);
                }

            });

            // Attendre la fin de toutes les promesses et renvoyer le résultat
            return vm.$q.all(promises).then(function(result) {
                for (var i = 0; i < result.length; i++) {
                    output = output.concat(result[i]);
                }
                //console.log(result);
                return output;
            });

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
    angularMod.factory(id, function($http, $q) {
        return new PublicationsService(repository, $http, $q);
    });

    return id;
};
