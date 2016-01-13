# Gulp-workflow
##Notre Workflow avec Gulp.

Voici les 3 fichiers de base pour notre workflow avec gulp.

ftp-conf.js -> qui stocke vos données ftp pour la publication automatique.
package.json -> qui liste les plugins à charger dans le futur dossier node_modules.
gulpfile.js  -> le fichier de bases, il est complètement commenté et facile à comprendre.

---
## l'idée de base.

Nous utilisons principalement ce fichier pour compiler nos fichiers .sass en .css. Puis, pour automatiquement publier toutes les modifications directement sur le FTP. du site.

Ce fichier nous a permis de nous affranchir de certains programmes qui n'étaient, au final, utiles que pour transformer des scss en css.

---
## le gulpfile et les plugins.

Nous utilisons un plugin de gulp (gulp-load-plugins) qui installe à lui tout seul les dépendances ( à l'exception de vinyl-ftp) dans le dossier node_modules.
Simplement en utilisant la commande "npm install" dans le terminal, il va regarder la liste de vos plugins dans le fichier "package.json" et automatiquement installer ces derrniers dans le fichier node_modules. ! Seulement les module qui commencent par "gulp-". Pour les autres, il faut le faire à la main. Dans notre cas pour "vinyl-ftp" il faut faire : --save-dev vinyl-ftp.
Tout est expliquer dans le fichier "gulpfile.js"

Le plugin gulp-load-plugins demande une adaptation par rapport à un fichier "gulp" standard. Pour appeler un "pipe" il faut mettre cette syntaxe : .pipe(plugins.uglify()) ce qui change c'est le "plugins." dans l'appel. voici un appel normal: .pipe(uglify()).
