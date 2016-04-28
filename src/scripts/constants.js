module.exports = {
    /**
     * Le nom du service de publications
     * [servicePublications description]
     * @type {String}
     */
    servicePublications: "servicePublications",
   /**
    * Le répertoire ou sont recherchées les publications
    * @type {String}
    */
    publicationDirectory: "publications",
    /**
     * Le nom du fichier de description par défaut
     * @type {String}
     */
    descriptionFileName: "description.md",
    /**
     * Adresse de base de l'API
     * @type {String}
     */
    githubApiBase: "https://api.github.com/",
    /**
     * Adresse de base pour les depots
     * @type {String}
     */
    githubApiRepos: "https://api.github.com/repos/",
    /**
     * [githubApiRepos description]
     * @type {String}
     */
    githubRawContent: "https://raw.githubusercontent.com/",
    /**
     * Adresse de base pour les utilisateurs
     * @type {RegExp}
     */
    githubApiUsers: "https://api.github.com/users/",
    /**
     * Message d'erreur passe partout
     * @type {String}
     */
    defaultErrorMessage: "Erreur lors du traitement des données."
};
