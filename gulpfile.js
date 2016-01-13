// *****************************************************************************
//chargement des plugins
//************
var gulp = require('gulp'), // la base on charge gulp.
    plugins = require('gulp-load-plugins')(); // charge automatiquement les dépendances -> npm install
        // load plugin vas automatiquement installé les plugin listé dans le fichier package.json dans le dossier node_module !
var ftp = require('vinyl-ftp');  // attention vu que c'est pas un  plugin qui commence par "gulp-truc"
      //il faut l'ajouter au dossier à la main "npm install --save-dev vinyl-ftp"

// *****************************************************************************
//chargement des fichier externe
//************
var gulpftp = require('./ftp-conf.js'); // le fichier de configuration du FTP a ne pas oublier..

// *****************************************************************************
// on commence par crée les fonction que le veux utilisé on les appeleras plus tard
//************

// *****************************************************************************
// notification en cas d'erreurs.
function errorAlert(error){  // avec le plugin notify on créée des alertes en ca d'erreurs
	plugins.notify.onError({title: "SCSS Error", message: "Check your terminal", sound: "Sosumi"})(error); //quand il y a une erreur fais un bruit!
	console.log(error.toString());//Ecrit dans la console l'erreur.
	this.emit("end"); //fin de la fonction
}

// *****************************************************************************
// compilation des fichier SASS avec validation par "plumber".
gulp.task('styles', function() { // on donne un nom à la tache "style" ici.

 gulp.src('./scss/**/*.scss') // on cible le dossier scss et tout les fichier avec le .scss
        .pipe(plugins.plumber({errorHandler: errorAlert})) // initialisaton de "plumber" en cas d'erreur.
        .pipe(plugins.sass()) //initialisation du plugin "gulp-sass"
        .pipe(gulp.dest('./')) // fichier de destination du future style.css.
        .pipe(plugins.notify("Youuuu c'est compiler! :-)) ")); // nous envoie un notification dans le centre des notification du mac

   });

// *****************************************************************************
// Tâche "js" = uglify + concat : minimise et met tous les js en un seul fichier.
gulp.task('js', function() {  // on donne un nom à la tache "js" ici.
   gulp.src('./library/js/*.js') // on cible le dossier js et les fichier .js
    .pipe(plugins.uglify()) // on lance le plugin "gulp-uglify"
    .pipe(plugins.rename( 'script.min.js')) // on renome le .js qui sort de la moulinette. ici "script.min.js"
    .pipe(gulp.dest('./library/js/min')) // on choisi un dossier de destination.
    .pipe(plugins.notify("Minifier le JS ! :-)) ")); // un petit notification pour le ok!
});

// *****************************************************************************
// Optimisation des images
gulp.task('images', function() {  // on donne un nom à la tache "images" ici.
  return gulp.src('./images/**/*') // on cible le dossier des images et on séléctionne tout.
	.pipe(plugins.imagemin({ optimizationLevel: 7, progressive: true, interlaced: true })) // lance le plugin "gulp-imagemin"
	.pipe(gulp.dest('./images')) // on choisi un dossier de déstination.
	.pipe(plugins.notify({ message: 'Images task complete' })); // une petite notification.
});

// *****************************************************************************
// Publication automatique des fichier modifier. !il faut avoir lancer la connection ftp.
gulp.task('ftp-deploy-watch', function() {  // on donne un nom à la tache "ftp-deploy-watch" ici.

  var conn = ftp.create( { // création de la variable conn utilisée pour la connection.
      host:     gulpftp.config.host, // récupération de la variable "host" du fichier ftp-config.json
      port:     gulpftp.config.port, // récupération de la variable "port" du fichier ftp-config.json
      user:     gulpftp.config.user, // récupération de la variable "user" du fichier ftp-config.json
      password: gulpftp.config.pass, // récupération de la variable "pass" du fichier ftp-config.json
      parallel: 3                    // nombre de connections en parallel acceptée.
 });
  // création de la variable "globs" qui liste les fichiers a regarder et uploader.
  var globs = [
      '**/*',
      '*',
      '!node_modules/**', // pour exclure des dossier on les note avec un "!" au début. ici node_modules qui est trés volumineux
      '!ftp-conf.js'      // ici notre fichier de configuration ftp. pour ne pas avoir nos infos visible sur le serveur.
  ];

    gulp.watch(globs) // on lance le .watch pour garder à l'oeil les fichier qui sont dans la variable "globs"
    .on('change', function(event) { // si il y a un changement on lance la fonction.
      console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type); // une notif dans la console pour avertir.

      return gulp.src( [event.path], { base: '.', buffer: false } )
        .pipe( conn.newer( gulpftp.config.dirdest )  ) // les nouveau fichier contenus dans le dossier "dirdest" configutré dans le ficher ftp-config.json.
        .pipe( conn.dest( gulpftp.config.dirdest) )
        .pipe(plugins.notify({ message: 'Upload Done!' })); // une petite notification.
      ;
    });
});

// *****************************************************************************
// définition des fichier à garder à l'oeil.
gulp.task ('watch', function(){  // on donne un nom à la tache "watch" ici.

	gulp.watch('./scss/**/*.scss',['styles']); // ciblager des dossier à garder à l'oeil et des fonction associée ici "styles"
	gulp.watch('./js/*.js',['js']); // ciblager des dossier à garder à l'oeil et des fonction associée ici "js"

});

// *****************************************************************************
// création des Taches! default est lancée avec un simple "gulp" dans le terminal les autres "gulp-matache"
gulp.task('default', ['styles', 'ftp-deploy-watch' ,'watch',]); // "gulp" vas lancer "styles" "ftp-deploy-watch" et "watch"
gulp.task('optimise',['styles','js','images']); // gulp-optimise vas lancer "styles" -> "js" et -> "images"
