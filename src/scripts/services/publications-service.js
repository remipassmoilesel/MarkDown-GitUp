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
    this.publicationContainer = [];

    // cache des publications
    this.publicationContents = {};

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
    if (typeof this.publicationContents[pub.url_raw_download] === "undefined") {
        return this.$http.get(pub.url_raw_download)
            .then(function(response) {

                console.log("PublicationsService.prototype.getContentByObject = function(pub) {")

                vm.publicationContents[pub.url_raw_download] = response.data;
                return response.data;
            });
    } else {
        return this.$q(function(resolve, reject) {
            resolve(vm.publicationContents[pub.url_raw_download]);
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

            if (response.length < 1) {
                console.error("No results: ", wanted, response);
            }

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
    if (this.publicationContainer.length < 1) {
        return this.loadPublicationList()
            .then(function(list) {
                vm.publicationContainer = list;
                return list;
            });
    }

    // la liste est en cache
    else {
        return this.$q(function(resolve, reject) {
            resolve(vm.publicationContainer);
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
        .then(function(publicationContainer) {

            var list = publicationContainer.allArticles;

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
                console.error("Attention: not all files were received !");
            }

            // récupérer le contenu d'une entrée de fichier et l'ajouter à la variable
            var getDescriptionContent = function(fe) {
                vm.$http.get(fe.url_raw_description)
                    .then(function(response) {
                        fe.descriptionContent = response.data;
                    })
                    .catch(function(resp) {
                        fe.descriptionContent = "Contenu indisponible";
                    });
            }

            /**
             * Constructeurs nommés pour marquage
             * @return {[type]} [description]
             */
            var PublicationContainer = function() {};
            var Category = function() {};
            var Article = function() {};

            // sortie avec categorie principale
            var output = new PublicationContainer();

            /**
             * Champs de stockage de tous les articles pour recherche
             * @type {Array}
             */
            output.allArticles = [];

            /**
             * Champs de stockage des articles par catégories
             * @type {Object}
             */
            output.categories = {};

            // l'ensemble des promesses à tenir avant de retourner les valeurs
            var promises = [];

            // pattern de recuperation du nom de la categorie dans une chaine au format
            // publications/categorie/article.md
            var fileRegex = new RegExp(constants.publicationDirectory + "/(?:([^/]+)/)?([^/]+)\.md", "i");

            // itérer les reponses
            for (var i = 0; i < response.data.tree.length; i++) {
                var file = response.data.tree[i];

                // ignorer les non fichiers
                if (file.type === "tree") {
                    continue;
                }

                // vérifier le chemin du fichier
                var regTest = fileRegex.exec(file.path);

                // le chemin est au bon format
                if (regTest !== null) {

                    var catName = regTest[1] || "main";

                    if (typeof output.categories[catName] === "undefined") {

                        output.categories[catName] = new Category();
                        /**
                         * Les articles
                         * @type {Object}
                         */
                        output.categories[catName].articles = [];
                        /**
                         * Url relatif d'affichage de la catégorie
                         * @type {RegExp}
                         */
                        output.categories[catName].url_display = "#/category/" + catName;
                        /**
                         * Contenu de la description
                         * @type {String}
                         */
                        output.categories[catName].descriptionContent = "";
                    }

                    // fichier de description
                    if (regTest[2] === constants.descriptionName) {

                        /**
                         * TUrl de téléchargement de la description
                         * @type {[type]}
                         */
                        output.categories[catName].url_raw_description = constants.githubRawContent + vm.source + "/master/" + file.path;
                        /**
                         * Contenu de la description, demandé ci dessous
                         * @type {RegExp}
                         */
                        output.categories[catName].descriptionContent = "";

                        // attacher le contenu à l'objet
                        var p = getDescriptionContent(output.categories[catName]);

                        // stocker la promesse pour attendre
                        promises.push(p);
                    }

                    // enregistrer un article
                    else {

                        // enregistrer le fichier
                        var na = new Article();
                        /**
                         * Catégorie
                         * @type {[type]}
                         */
                        na.category = catName;

                        /**
                         * Nom de l'article (du fichier sans extension)
                         * @type {[type]}
                         */
                        na.name = regTest[2];
                        /**
                         * URL absolu permettant d'accéder au contenu brut
                         * @type {RegExp}
                         */
                        na.url_raw_download = constants.githubRawContent + vm.source + "/master/" + file.path;
                        /**
                         * Url relatif d'affichage de l'article
                         * @type {String}
                         */
                        na.url_display = "#/article/" + (regTest[1] || constants.mainCategoryName) + "/" + regTest[2];
                        /**
                         * Chemin relatif à la racine du depot
                         * @type {[type]}
                         */
                        na.path = file.path;

                        output.allArticles.push(na);
                        output.categories[catName].articles.push(na);
                    }

                }
            }

            // retourner le tout lorsque toutes les promesses sont tenues
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

    // fabrication du service de mise à dispo des publications
    var id = constants.servicePublications;
    angularMod.factory(id, function($http, $q) {
        return new PublicationsService(source, $http, $q);
    });

    return id;
};
