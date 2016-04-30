/**
 * Recherche de patients et d'infirmier
 */

var constants = require("../../constants.js");

module.exports = {
    urlPatterns: [
        "/article/:category/:name"
    ],
    template: require("./showArticle-template.html"),

    controller: [
        "$routeParams", constants.servicePublications,

        function($routeParams, publications) {

            // nom et categorie de l'article
            this.articleCategory = $routeParams["category"];
            this.articleName = $routeParams["name"];

            var vm = this;

            // conversion markdown / html
            this.markdown = require("markdown").markdown;

            // récuperer le contenu de la publication
            publications.searchContentByObject({
                    category: this.articleCategory,
                    name: this.articleName
                })
                .then(function(response) {
                    vm.publicationContent = vm.markdown.toHTML(response);
                });

            // emplacement de la publication
            var categ = this.articleCategory === constants.mainCategoryName ? "Publications" : this.articleCategory;

            this.articleLocation = categ + " / " + this.articleName;

        }
    ]
};
