/**
 * Recherche de patients et d'infirmier
 */

module.exports = {
    urlPatterns: [
        "/welcome"
    ],
    template: require("./welcome-template.html"),

    controller: [
        "$routeParams",

        function($routeParams) {

            // récuperer les arguments de l'url pour les transmettre à la recherche
            // this.personName = $routeParams['name'] || '';
            // this.personFirstname = $routeParams['firstname'] || '';
            // this.personId = $routeParams['id'] || '';

        }
    ]
};
