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
 * Retourne le contenu d'une publication associé à un objet article, si il contient un
 * champs "url_raw_download"
 * @param  {[type]} pub [description]
 * @return {[type]}     [description]
 */
PublicationsService.prototype.getContentByObject = function(pub) {

    var vm = this;

    // la ressource n'a jamais été demandée, faire un appel et
    // conserver le résultat en cache
    if (typeof this.publications[pub.url_raw_download] === "undefined") {
        return this.$http.get(pub.url_raw_download)
            .then(function(response) {

                console.log("PublicationsService.prototype.getContentByObject = function(pub) {")

                vm.publications[pub.url_raw_download] = response.data;
                return response.data;
            });
    } else {
        return this.$q(function(resolve, reject) {
            resolve(vm.publications[pub.url_raw_download]);
        });
    }
};

/**
 * Recherche le contenu d'une publication. Retourne le contenu de la première publication trouvée.
 * @param  {[type]} pub [description]
 * @return {[type]}     [description]
 */
PublicationsService.prototype.searchContentByObject = function(wanted) {

    var vm = this;

    // rechercher l'url de telechargement
    return this.searchPublication(wanted)
        .then(function(response) {
            return vm.getContentByObject(response[0]);
        });
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

PublicationsService.prototype.searchPublication = function(wanted) {

    // préparer les termes de recherche
    var testsPartA = [];
    testsPartA.push((wanted.name || '').toLocaleLowerCase().trim());
    testsPartA.push((wanted.category || '').toLocaleLowerCase().trim());

    //category, name, keywords

    return this.getPublicationList()
        .then(function(list) {

            var output = [];
            list.forEach(function(elmt) {

                var testsPartB = [];
                testsPartB.push((elmt.name || '').toLocaleLowerCase().trim());
                testsPartB.push((elmt.category || '').toLocaleLowerCase().trim());

                var passed = 0;
                var success = 0;

                // iterer les tests
                for (var j = 0; j < testsPartA.length; j++) {
                    var a = testsPartA[j];
                    var b = testsPartB[j];

                    // verifier que les parties ne soient pas vides
                    if (a.length > 0 && b.length > 0) {
                        passed++;

                        // test
                        if (a === b) {
                            success++;
                        }
                    }

                }

                if (passed > 0 && success === passed) {
                    output.push(elmt);
                }

            });

            return output;

        });

};

/**
 * Mettre à jour la liste des publications disponibles. Liste tous les fichiers correspondant
 * et télécharge les description de catégories.
 * @return {[type]} [description]
 */
PublicationsService.prototype.loadPublicationList = function() {

    console.log("PublicationsService.prototype.loadPublicationList = function() {");

    var vm = this;

    // demander un arbre récursif de tous les fichiers du rep
    return this.$http.get(constants.githubApiRepos + this.source + "/git/trees/master?recursive=1")
        .then(function(response) {

            if (response.truncated == true) {
                console.err("Attention: not all files were received !");
            }

            // récupérer le contenu d'une entrée de fichier et l'ajouter à la variable
            var getFileContent = function(fe) {
                vm.$http.get(fe.url_raw_download)
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
                if (file.type === "tree") {
                    continue;
                }

                // vérifier le fichier
                var regTest = fileRegex.exec(file.path);


                // le fichier se termine par md
                if (regTest !== null) {

                    // enregistrer le fichier
                    var nf = {
                        /**
                         * Catégorie
                         * @type {[type]}
                         */
                        category: regTest[1] || constants.mainCategoryName,
                        /**
                         * Nom de l'article (du fichier sans extension)
                         * @type {[type]}
                         */
                        name: regTest[2],
                        /**
                         * Type: article ou categorie
                         * @type {[type]}
                         */
                        type: regTest[2] === constants.descriptionName ? 'category' : 'article',
                        /**
                         * URL absolu permettant d'accéder au contenu brut
                         * @type {RegExp}
                         */
                        url_raw_download: constants.githubRawContent + vm.source + "/master/" + file.path,
                        /**
                         * Url relatif d'affichage de la catégorie
                         * @type {RegExp}
                         */
                        url_category: "#/category/" + regTest[1],

                        /**
                         * Url relatif d'affichage de l'article
                         * @type {String}
                         */
                        url_article: "#/article/" + (regTest[1] || constants.mainCategoryName) + "/" + regTest[2],
                        /**
                         * Chemin relatif à la racine du depot
                         * @type {[type]}
                         */
                        path: file.path
                    };
                    output.push(nf);

                    // récuperer le contenu des descriptions
                    if (nf.name === constants.descriptionName) {
                        // recuperer le contenu
                        var p = getFileContent(nf);

                        // stocker la promesse pour attente
                        promises.push(p);
                    }


                }
            }

            // retourner le tout lorsque toutes les promesses sont tenues
            return vm.$q.all(promises).then(function() {

                // verifier que toutes les categories ai une entrée, même celles
                // ne possédant pas de descripteur
                var categories = [];

                // lister les categories
                output.forEach(function(elmt){
                    if(categories.indexOf(elmt.category) === -1){
                        categories.push(elmt.category);
                    }
                });

                console.log("PublicationsService.prototype.loadPublicationList = function() {");
                console.log(categories);

                // effacer les categories possédant déjà un descripteur
                output.forEach(function(elmt){
                    if(elmt.type === "category"){
                        categories[categories.indexOf(elmt.category)] = "";
                    }
                });

                console.log("222 - PublicationsService.prototype.loadPublicationList = function() {");
                console.log(categories);

                // créer les descripteurs
                for (var i = 0; i < categories.length; i++) {
                    var elmt = categories[i];

                    if(elmt === ""){
                        continue;
                    }

                    // enregistrer le fichier
                    var nf = {
                        /**
                         * Catégorie
                         * @type {[type]}
                         */
                        category: elmt,
                        /**
                         * Nom de l'article (du fichier sans extension)
                         * @type {[type]}
                         */
                        name: constants.descriptionName,
                        /**
                         * Type: article ou categorie
                         * @type {[type]}
                         */
                        type: 'category',
                        /**
                         * URL absolu permettant d'accéder au contenu brut
                         * @type {RegExp}
                         */
                        url_raw_download: constants.githubRawContent + vm.source + "/master/" + elmt,
                        /**
                         * Url relatif d'affichage de la catégorie
                         * @type {RegExp}
                         */
                        url_category: "#/category/" + elmt,

                        /**
                         * Url relatif d'affichage de l'article
                         * @type {String}
                         */
                        url_article: "",
                        /**
                         * Chemin relatif à la racine du depot
                         * @type {[type]}
                         */
                        path: constants.publicationDirectory + "/" + elmt
                    };

                    output.push(nf);

                }

                console.log(output);


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

    // fabrication du service de mise à dispo des publications
    var id = constants.servicePublications;
    angularMod.factory(id, function($http, $q) {
        return new PublicationsService(source, $http, $q);
    });

    return id;
};
