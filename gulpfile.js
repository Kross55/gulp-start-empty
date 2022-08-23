//1. шаг  - npm install --global gulp-cli
//2. шаг  - npm init 
//3. шаг  - npm install --save-dev gulp
//4. шаг  - npm install --save-dev sass
//5. шаг  - npm install --save-dev gulp-concat //для конкатинации
//6. шаг  - npm i --save-dev browser-sync//для обновления html, css and js
//7. шаг  - npm install --save-dev gulp-uglify-es
//8. шаг  - npm i --save-dev jquery 
//9. шаг  - npm install --save-dev gulp-autoprefixer
//10. шаг - npm i gulp-imagemin@7.1.0 --save-dev для сжатия картинок
//11. шаг - npm i del@6.1.1 --save-dev 

//watch для автоматическо слежения за проектом(обновления изменений)
//parallel чтобы ф-ции могли работать параллельно
//series запускает функции в нужной нам последовательности
const { src, dest, watch, parallel, series } = require('gulp')

const scss         = require('gulp-sass')(require('sass'))
const concat       = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const imagemin     = require('gulp-imagemin')
const browserSync  = require('browser-sync').create()
const uglify       = require('gulp-uglify-es').default
const del          = require('del')

function cleanDist() {
    return del('dist')
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/", 
        }
    }) 
}

function styles() {
    return src('app/scss/style.scss')
        //очерёдность имеет значение!
        //compressed - сжимает созданный файл style.css
        //expanded - отображает в обычном виде
        .pipe(scss({outputStyle: 'compressed'}))
        //для переименования style.css в style.min.css
        .pipe(concat('style.min.css'))
        //автоматически добавляет префиксы в css для старых версий браузера
        .pipe(autoprefixer({
			overrideBrowserslist: ['last 10 version'],
            grid: true
		}))
        //создаём папку css в парке app с файлом style.css
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())       
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function images() {
    return src('app/images/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/images'))
}
//собираем наш проект в папке dist
function build() {
    return src([
        'app/css/style.min.css',
        // /**-все папки, /*-все файлы
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html',
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching() {
    //следить за изменениями всех файлов расширения scss и запуска ф-цию styles
    watch(['app/scss/**/*.scss'], styles)
    //следим за всеми файлами расширения js кроме main.min.js
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
    watch(['app/*.html']).on('change', browserSync.reload)
}

exports.styles = styles
exports.scripts = scripts
exports.watching = watching
exports.browsersync = browsersync

exports.cleanDist = cleanDist
exports.images = images

//запускаем сразу все ф-ции одновременно
exports.default = parallel(styles, scripts, watching, browsersync)

//очищаем dist, сжимаем картинки и добавляем в dist, собираем весь проект в dist заново(обновлёный)//запускается в конце проекта, когда всё всем нравится и готово для продакшена
exports.build = series(cleanDist, images, build)


