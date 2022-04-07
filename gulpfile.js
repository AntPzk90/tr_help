//Подключаем галп
const gulp = require("gulp");
//Объединение файлов
const concat = require("gulp-concat");
//Добапвление префиксов
const autoprefixer = require("gulp-autoprefixer");
//Оптисизация стилей
const cleanCSS = require("gulp-clean-css");
//Удаление файлов
const del = require("del");
//Синхронизация с браузером
const browserSync = require("browser-sync").create();
//Для препроцессоров стилей
const sourcemaps = require("gulp-sourcemaps");
// обработчик ошибок
var plumber = require("gulp-plumber");
// Минификация HTML
const htmlmin = require("gulp-htmlmin");
//Less препроцессор
const less = require("gulp-less");
// Оптим. графики
const imageMin = require("gulp-imagemin");
//Порядок подключения файлов со стилями
const styleFiles = ["./src/less/main.less"];
//Порядок подключения js файлов
const scriptFiles = ["./src/js/script.js"];

//Таск для обработки стилей
gulp.task("styles", () => {
  //Шаблон для поиска файлов CSS
  //Всей файлы по шаблону './src/css/**/*.css'
  return (
    gulp
    .src(styleFiles)
    .pipe(sourcemaps.init())
    // обработчик ошибок
    .pipe(plumber())
    //Указать stylus() , sass() или less()
    .pipe(less())
    //Объединение файлов в один
    .pipe(concat("style.css"))
    //Добавить префиксы
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 2 versions"],
        cascade: false,
      })
    )
    // генерацю не миниф стилей в папку source
    .pipe(gulp.dest("./src/css"))
    //Минификация CSS
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(sourcemaps.write("./"))
    //Выходная папка для стилей
    .pipe(gulp.dest("./build/css"))
    .pipe(browserSync.stream())
  );
});

// Таск для обработки скриптов
gulp.task("scripts", () => {
  //Шаблон для поиска файлов JS
  return gulp
    .src(scriptFiles)
    .pipe(gulp.dest("./build/js"))
    .pipe(browserSync.stream());
});

//Таск для очистки папки build
gulp.task("del", () => {
  return del(["build/*"], {
    dryRun: true,
  });
});

gulp.task("minifyHTML", () => {
  return gulp
    .src("src/*.html")
    .pipe(
      htmlmin({
        collapseWhitespace: false,
      })
    )
    .pipe(gulp.dest("./build"));
});



gulp.task("minifyImg", () => {
  return gulp.src('src/img/*')
    .pipe(imageMin())
    .pipe(gulp.dest('build/img'))
})

gulp.task("copy", function () {
  return gulp
    .src(["src/fonts/**/*", "src/js/**/*"], {
      base: "src",
    })
    .pipe(gulp.dest("build"));
});

gulp.task("watch", () => {
  browserSync.init({
    server: {
      baseDir: "./build",
    },
  });

  //Следить за файлами (измененями)
  gulp.watch("./src/img/**/*", gulp.series("minifyImg"));
  gulp.watch("./src/less/**/*.less", gulp.series("styles"));
  gulp.watch("./src/js/**/*.js", gulp.series("scripts"));
  gulp.watch("./src/*.html", gulp.series("minifyHTML"));
  gulp.watch("./build/*.html").on("change", browserSync.reload);
});

//Таск по умолчанию, Запускает del, styles, scripts и watch
gulp.task(
  "start",
  gulp.series("del", "copy", gulp.parallel("styles", "minifyImg", "scripts", "minifyHTML"), "watch")
);
