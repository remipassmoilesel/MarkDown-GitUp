/**
Service d'obtention de publications disponibles en lignes.

Le service va rechercher à la base du depot spécifié ci-dessous un dossier 'publications'
et lister tous les fichiers '.md'.

Le service organisera les publications en catégories si
elles sont placées dans des dossiers

*/

var constants = require("../constants.js");

var PublicationsService = function(source, $http, $q) {
    this.$http = $http;
    this.constants = constants;
    this.source = source;
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
    } else {
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

    // demander un arbre récursif de tous les fichiers du rep
    return this.$http.get(constants.githubApiRepos + this.source + "/git/trees/master?recursive=1")
        .then(function(response) {

            if (response.truncated == true) {
                console.err("Attention: not all files were received !");
            }

            // récupérer le contenu d'une entrée de fichier et l'ajouter à la variable
            var getFileContent = function(fe) {
                vm.$http.get(fe.download_url)
                    .then(function(response) {
                        fe.content = response.data;
                    })
                    .catch(function(resp) {
                        fe.content = "Contenu indisponible";
                    });
            }

            var output = [];

            // l'ensemble des promesses à tenir avant de retourner les valeurs
            var promises = [];

            var fileRegex = new RegExp(constants.publicationDirectory + "/(?:([^/]+)/)?([^/]+)\.md", "i");

            // itérer les reponses
            for (var i = 0; i < response.data.tree.length; i++) {
                var file = response.data.tree[i];

                // ignorer les non fichiers
                if(file.type === "tree"){
                    continue;
                }

                // vérifier le fichier
                var regTest = fileRegex.exec(file.path);

                // le fichier se termine par md
                if (regTest !== null) {

                    // enregistrer le fichier
                    var nf = {
                        category: regTest[1] || '',
                        name: regTest[2],
                        type: file.type,
                        download_url: constants.githubRawContent + vm.source + "/master/" + file.path,
                        path: file.path
                    };
                    output.push(nf);

                    // récuperer le contenu des descriptions
                    if (nf.name === "description") {
                        // recuperer le contenu
                        var p = getFileContent(nf);

                        // stocker la promesse pour attente
                        promises.push(p);
                    }


                }
            }

            // retourner le tout lorsque c'est bong ...
            return vm.$q.all(promises).then(function() {
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
module.exports = function(angularMod, source) {

    if (typeof source === undefined) {
        throw "You must specify a source !";
    }

    var id = constants.servicePublications;

    // fabrication du service
    angularMod.factory(id, function($http, $q) {
        return new PublicationsService(source, $http, $q);
    });

    return id;
};
