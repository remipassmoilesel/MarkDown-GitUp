# A quoi ça sert ?

A publier simplement en Markdown, directement en ligne de commande. Le code de présentation est
distribué sur un serveur, les publications sont hébergées dans un dépôt GitHub.

# Comment ça marche ?

1. Clonez ce projet sur un serveur: '$ git clone https://github.com/remipassmoilesel/MarkDown-GitUp.git'
1. Renseignez la première ligne du fichier 'src/scripts/main.js' avec le nom du dépôt que vous souhaitez utiliser.
1. Créez un dossier 'publications'
1. Ecrivez vos articles avec MarkDown !
1. Et publiez:

```
  $ git add -A && git commit -m 'Publication !' && git push origin
```



Tout ce qui est publié dans ce dossier sera mis en forme et publié !
