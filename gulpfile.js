// *****************************************************************************
//chargement des plugins
//************
var gulp = require('gulp'), // la base on charge gulp.
    plugins = require('gulp-load-plugins')(); // charge automatiquement les dépendances -> npm install
        // load plugin va automatiquement installer les plugins listés dans le fichier package.json dans le dossier node_modules!
var ftp = require('vinyl-ftp');  // attention étant donné que ce n'est pas un  plugin qui commence par "gulp-truc",
      //il faut l'ajouter au dossier à la main grâce à "npm install --save-dev vinyl-ftp"

// *****************************************************************************
//chargement des fichier externes
//************
var gulpftp = require('./ftp-conf.js'); // le fichier de configuration du FTP à ne pas oublier..

// *****************************************************************************
// on commence par créer les fonctions que l'on veut utiliser et que l'on les appelera plus tard
//************

// *****************************************************************************
// notifications en cas d'erreur.
function errorAlert(error){  // avec le plugin notify on créée des alertes en cas d'erreur
	plugins.notify.onError({title: "SCSS Error", message: "Check your terminal", sound: "Sosumi"})(error); //quand il y a une erreur = fait un bruit!
	console.log(error.toString());//Ecrit dans la console l'erreur.
	this.emit("end"); //fin de la fonction
}

// *****************************************************************************
// compilation des fichiers SASS avec validation par "plumber".
gulp.task('styles', function() { // on donne un nom à la tâche "styles" ici.

 gulp.src('./scss/**/*.scss') // on cible le dossier scss et tout les fichiers avec le .scss
        .pipe(plugins.plumber({errorHandler: errorAlert})) // initialisation de "plumber" en cas d'erreur.
        .pipe(plugins.sass()) //initialisation du plugin "gulp-sass"
        .pipe(gulp.dest('./')) // fichier de destination du future style.css.
        .pipe(plugins.notify("Youuuu c'est compiler! :-)) ")); // nous envoie une notification dans le centre des notifications du mac

   });

// *****************************************************************************
// Tâche "js" = uglify + concat : minimise et met tous les js dans un seul fichier.
gulp.task('js', function() {  // on donne un nom à la tâche "js" ici.
   gulp.src('./library/js/*.js') // on cible le dossier js et les fichiers .js
    .pipe(plugins.uglify()) // on lance le plugin "gulp-uglify"
    .pipe(plugins.rename( 'script.min.js')) // on renomme le .js qui sort de la moulinette, ici c'est "script.min.js"
    .pipe(gulp.dest('./library/js/min')) // on choisit un dossier de destination.
    .pipe(plugins.notify("Minifier le JS ! :-)) ")); // une petit notification pour le ok!
});

// *****************************************************************************
// Optimisation des images
gulp.task('images', function() {  // on donne un nom à la tâche "images" ici.
  return gulp.src('./images/**/*') // on cible le dossier des images et on séléctionne tout.
	.pipe(plugins.imagemin({ optimizationLevel: 7, progressive: true, interlaced: true })) // lance le plugin "gulp-imagemin"
	.pipe(gulp.dest('./images')) // on choisit un dossier de destination.
	.pipe(plugins.notify({ message: 'Images task complete' })); // une petite notification.
});

// *****************************************************************************
// Publication automatique des fichiers modifiés. !Il faut avoir lancer la connection ftp.
gulp.task('ftp-deploy-watch', function() {  // on donne un nom à la tâche "ftp-deploy-watch" ici.

  var conn = ftp.create( { // création de la variable "conn" utilisée pour la connection.
      host:     gulpftp.config.host, // récupération de la variable "host" du fichier ftp-config.json
      port:     gulpftp.config.port, // récupération de la variable "port" du fichier ftp-config.json
      user:     gulpftp.config.user, // récupération de la variable "user" du fichier ftp-config.json
      password: gulpftp.config.pass, // récupération de la variable "pass" du fichier ftp-config.json
      parallel: 3                    // nombre de connections en parallèle acceptées.
 });
  // création de la variable "globs" qui liste les fichiers à regarder et à uploader.
  var globs = [
      '**/*',
      '*',
      '!node_modules/**', // pour exclure des dossiers on les note avec un "!" au début. ici node_modules qui est trés volumineux
      '!ftp-conf.js'      // ici notre fichier de configuration ftp. pour ne pas avoir nos infos visibles sur le serveur.
  ];

    gulp.watch(globs) // on lance le .watch pour garder à l'oeil les fichiers qui sont dans la variable "globs"
    .on('change', function(event) { // s'il y a un changement on lance la fonction.
      console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type); // une notification dans la console pour avertir.

      return gulp.src( [event.path], { base: '.', buffer: false } )
        .pipe( conn.newer( gulpftp.config.dirdest )  ) // les nouveaux fichiers contenus dans le dossier "dirdest" configuré dans le ficher ftp-config.json.
        .pipe( conn.dest( gulpftp.config.dirdest) )
        .pipe(plugins.notify({ message: 'Upload Done!' })); // une petite notification.
      ;
    });
});

// *****************************************************************************
// définition des fichiers à garder à l'oeil.
gulp.task ('watch', function(){  // on donne un nom à la tâche "watch" ici.

	gulp.watch('./scss/**/*.scss',['styles']); // ciblage des dossiers à garder à l'oeil et des fonctions associées ici "styles"
	gulp.watch('./js/*.js',['js']); // ciblage des dossiers à garder à l'oeil et des fonctions associées ici "js"

});

// *****************************************************************************
// création des tâches! default est lancée avec un simple "gulp" dans le terminal, pour les autres on utilise "gulp-"
gulp.task('default', ['styles', 'ftp-deploy-watch' ,'watch',]); // "gulp" va lancer "styles" "ftp-deploy-watch" et "watch"
gulp.task('optimise',['styles','js','images']); // gulp-optimise va lancer "styles" -> "js" et -> "images"
