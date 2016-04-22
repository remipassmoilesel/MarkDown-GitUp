
module.exports = function(angularMod) {
    angularMod.component("availablesPublications", {
        template: template,
        controller: AvailablesPublicationsController,
        bindings: {
            repository: "@"
        }
    });
};
