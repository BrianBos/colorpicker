'use strict';

const gulp = require('gulp'),
    path = require('path'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    rename = require("gulp-rename"),
    webpack = require('webpack'),
    webpackStream = require('webpack-stream'),
    argv = require('yargs').argv,
    server = require('browser-sync').create(),
    gulpif = require('gulp-if')
;
const paths = {
    dist: 'dist',
    styles: {
        src: ['src/scss/themes/**/*.scss', '!src/scss/themes/**/_*.scss'],
        watch: 'src/scss/**/*.scss',
        dest: 'dist/css/'
    },
    scripts: {
        src: 'src/ts/**/*.ts',
        dest: 'dist/js/'
    },
    html: {
        src: 'src/*.html',
        dest: 'dist'
    },
    images: {
        src: 'src/img/**/*.*',
        dest: 'dist/img/'
    }
};

function clean() {
    return del(['dist']);
}

function html() {
    return gulp.src(paths.html.src)
        .pipe(gulp.dest(paths.html.dest))
    ;
}

function images() {
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest))
    ;
}

function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(paths.styles.dest))
    ;
}

function stylesSource() {
    return gulp.src(paths.styles.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.styles.dest))
    ;
}

function scripts(picker, name) {
    return gulp.src('./src/ts/' + picker + '.ts')
        .pipe(webpackStream({
            mode: argv.mode,
            output: {
                filename: picker + '.min.js',
                libraryTarget: "umd",
                library: ['ColorPicker', name]
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: 'ts-loader',
                        exclude: /node_modules/
                    }
                ]
            },
            resolve: {
                extensions: ['.ts', '.js'],
                alias: {
                    deepmerge$: path.resolve(__dirname, 'node_modules/deepmerge/dist/umd.js'),
                }
            }
        }, webpack))
        .pipe(gulp.dest(paths.scripts.dest))
    ;
}

function scriptsSource(picker, name) {
    return gulp.src('./src/ts/' + picker + '.ts')
        .pipe(webpackStream({
            mode: 'development',
            output: {
                filename: picker + '.js',
                libraryTarget: "umd",
                library: ['ColorPicker', name]
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        use: 'ts-loader',
                        exclude: /node_modules/
                    }
                ]
            },
            resolve: {
                extensions: ['.ts', '.js'],
                alias: {
                    deepmerge$: path.resolve(__dirname, 'node_modules/deepmerge/dist/umd.js'),
                }
            }
        }, webpack))
        .pipe(gulp.dest(paths.scripts.dest))
    ;
}

function defaultColorPicker() {
    return scripts('default-picker', 'Default');
}

function defaultColorPickerSource() {
    return scriptsSource('default-picker', 'Default');
}

function multiSpectralColorPicker() {
    return scripts('multi-spectral-picker', 'MultiSpectral');
}

function multiSpectralColorPickerSource() {
    return scriptsSource('multi-spectral-picker', 'MultiSpectral');
}

function paletteColorPicker() {
    return scripts('palette-picker', 'Palette');
}

function paletteColorPickerSource() {
    return scriptsSource('palette-picker', 'Palette');
}

function tabPaletteColorPicker() {
    return scripts('tab-palette-picker', 'TabPalette');
}

function tabPaletteColorPickerSource() {
    return scriptsSource('tab-palette-picker', 'TabPalette');
}

function materialColorPicker() {
    return scripts('material-picker', 'Material');
}

function materialColorPickerSource() {
    return scriptsSource('material-picker', 'Material');
}

function reload(done) {
    server.reload();
    done();
}

function serve(done) {
    server.init({
        server: {
            baseDir: paths.dist
        }
    });
    done();
}

let build = gulp.series(
    clean, html, styles, stylesSource, images,
    defaultColorPicker,
    defaultColorPickerSource,
    multiSpectralColorPicker,
    multiSpectralColorPickerSource,
    paletteColorPicker,
    paletteColorPickerSource,
    tabPaletteColorPicker,
    tabPaletteColorPickerSource,
    materialColorPicker,
    materialColorPickerSource
);

if (argv.mode === 'development') {
    let pickerTask;

    if (argv.picker === 'default') {
        pickerTask = defaultColorPicker;
    } else if (argv.picker === 'multi-spectral') {
        pickerTask = multiSpectralColorPicker;
    } else if (argv.picker === 'palette') {
        pickerTask = paletteColorPicker;
    } else if (argv.picker === 'tab-palette') {
        pickerTask = tabPaletteColorPicker;
    } else if (argv.picker === 'material') {
        pickerTask = materialColorPicker;
    }

    gulp.task('default', gulp.series(build, serve));
    gulp.watch(paths.scripts.src, gulp.series(pickerTask, reload));
    gulp.watch(paths.html.src, gulp.series(html, reload));
    gulp.watch(paths.styles.watch, gulp.series(styles, reload));
} else if (argv.mode === 'production') {
    gulp.task('default', build);
}
