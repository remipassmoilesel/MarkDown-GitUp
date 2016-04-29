/**
 * Enregistrement des routes de l'application
 */

module.exports = function(angularMod) {

    var routes = {
        welcomeRoute: require("../views/welcome/welcome-view.js"),
    };

    // creer un nom de controlleur dynamique
    var controllerNameOf = function(elmt) {
        var jsName = elmt.urlPatterns[0].replace(/[^\w\s]/gi, '')
        if (jsName.match(/^[a-z]+$/i) === null) {
            throw "Illegal name of controller: '" + jsName + "' generated with '" + elmt.urlPatterns[0] + "'";
        }

        var name = "ViewControllerOf_" + jsName;
        return name;
    }

    // déclarer dynamiquement les controlleurs
    for (var elmtK in routes) {
        var elmt = routes[elmtK];

        // declarer le controlleur, au nom de l'url simple
        if (typeof elmt.controller !== "undefined") {

            console.log(elmt.controller);

            angularMod.controller(controllerNameOf(elmt),
                elmt.controller);
        }
    }

    angularMod.config(['$routeProvider', function($routeProvider) {

        // enlever les # des URLS
        // $locationProvider.html5Mode(true);

        // fabrique de template a partir d'un element, avec titre et contenu
        var makeViewTemplate = function(elmt) {
            return "<h1>" + elmt.label + "</h1>" + elmt.template;
        };

        // iterer les vues diponibles pour établir les routes possibles
        for (var elmtK in routes) {
            var elmt = routes[elmtK];

            // verifier les patterns de routes
            if (elmt.urlPatterns instanceof Array !== true) {
                throw constants.INVALID_ARGUMENT;
            }

            // iterer les differentes routes possibe pour les déclarer
            for (var r in elmt.urlPatterns) {

                var route = elmt.urlPatterns[r];

                // parametres de la route
                var params = {};
                params.template = makeViewTemplate(elmt);

                if (typeof elmt.controller !== "undefined") {
                    params.controllerAs = "$ctrl";
                    params.controller = controllerNameOf(elmt);
                }

                // creation de la route
                $routeProvider.when(route, params);

            }

        }

        // route par défaut sur le premier element de la liste
        $routeProvider
            .otherwise({
                redirectTo: routes[Object.keys(routes)[0]].urlPatterns[0],
            });
    }]);

}
