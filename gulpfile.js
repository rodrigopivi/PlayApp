(function() {
    /* ***** LOAD DEPENDENCIES ***** */
    var babel = require('gulp-babel');
    var changedInPlace = require('gulp-changed-in-place');
    var del = require('del');
    var fs = require('fs');
    var gulp = require('gulp');
    var gulpSequence = require('gulp-sequence');
    var gutil = require('gulp-util');
    var nodemon = require('gulp-nodemon');
    var nodemonLibrary = require('nodemon');
    var notify = require('gulp-notify');
    var path = require('path');
    var pem = require('pem');
    var schema = require('gulp-graphql');
    var sourcemaps = require('gulp-sourcemaps');
    var settings = require('./config/settings');
    var ts = require('gulp-typescript');
    var tsd = require('gulp-tsd');
    var tslint = require('gulp-tslint');
    var webpack = require('webpack');
    var webpackProdConfig = require('./webpack.prod.config.js');
    var webpackDevConfig = require('./webpack.dev.config.js');
    var WebpackDevServer = require('webpack-dev-server');
    /* ***** CUSTOM CONFIGURATION PROPERTIES. ***** */
    var paths = {
        backendServerEntry: './dist/server/app.js',
        tmpSslCertsPath: 'tmp',
        frontendWatch: ['./dist/**/*.jsx'],
        clean: ['./dist', './public/bundle.js', './public/bundle.js.map'],
        dist: './dist',
        lint: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.d.ts'],
        mainDefinitionsFile: 'src/app.d.ts',
        nodemonWatch: ['./dist/'],
        nodemonWatchExtensions: 'html css json graphql',
        schema: 'dist/server/schema/mainSchema.js',
        schemaDist: './dist/data',
        sourceTs: ['src/server/app.ts', 'src/**/*.ts', 'src/**/*.tsx']
    };
    var babelIsRunning = false;
    var babelCache = {};
    var isWatching = false;
    var nodemonRestarting = false;
    var backendServerIsProxied = false;
    var lintCache = {};
    var tasks = {};
    var tsProject = ts.createProject('./tsconfig.json');
    var webpackDevServerPort = 4242;
    /* *********** CUSTOM METHODS *********** */
    var handleError = function(err, isJustAWarning) {
        if (isJustAWarning) {
            gutil.log(gutil.colors.bgYellow(' Task succeeded but raised some warnings '));
        } else {
            var errMsg = '{ ಠ_ಠ}! Build failed... check the logs.';
            if (!err.length) { err = [err]; }
            notify.onError({ message: errMsg, sound: true })(err[0]);
            err.forEach(function(e) { gutil.log(gutil.colors.bgYellow(' Error: '), gutil.colors.red(e)); });
        }
        tasks.jobFinisher()();
    };
    var debouncedBabel = function () {
        if (!babelIsRunning) {
            babelIsRunning = true;
            var timestamp = new Date().getTime();
            gutil.log('Starting \'' + gutil.colors.cyan('babel') + '\' ...');
            // wait because something may be writing multiple stuff
            setTimeout(function() {
                tasks.babel(function() {
                    var time = new Date().getTime() - timestamp;
                    gutil.log('Finished \'' + gutil.colors.cyan('babel') + '\' after', gutil.colors.magenta(time));
                    babelIsRunning = false;
                    tasks.nodemonRestart();
                });
            }, 500);
        }
    };
    /* *********** TASK METHODS *********** */
    tasks = {
        babel: function(cb) {
            process.env.BABEL_ENV = 'web';
            gulp.src(paths.frontendWatch, {base: '.'})
            .pipe(changedInPlace({firstPass: true, cache: babelCache}))
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(babel({})).on('error', function(err) { handleError(err); cb(err); })
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('.')).on('end', function() { if (cb) { cb(); } });
        },
        clean: function() { del(paths.clean); },
        fullWatch: function() {
            // Listen for 'src' changes. Compiles TS, lints and calls babel.
            isWatching = true;
            gulp.watch(paths.sourceTs, ['ts']).on('error', handleError);
            gulp.watch(paths.frontendWatch, debouncedBabel).on('error', handleError);
            gulp.watch([paths.schema], ['schema']).on('error', handleError);
        },
        jobFinisher: function(cb) {
            return function() {
                if (!isWatching) {
                    if (cb) { cb(); }
                    process.exit();
                }
            };
        },
        lightWatch: function() {
            // Don't do the TS compile. This just lints and calls babel on frontend code.
            isWatching = true;
            gulp.watch(paths.sourceTs, ['lint']).on('error', handleError);
            gulp.watch(paths.frontendWatch, debouncedBabel, ['babel']).on('error', handleError);
            gulp.watch([paths.schema], ['schema']).on('error', handleError);
        },
        lint: function () {
            return gulp.src(paths.lint)
            .pipe(changedInPlace({firstPass: true, cache: lintCache}))
            .pipe(tslint())
            .pipe(tslint.report('prose', { emitError: false }))
            .on('error', handleError);
        },
        nodemon: function (cb) {
            var started = false;
            return nodemon({
                script: paths.backendServerEntry,
                watch: paths.nodemonWatch,
                ext: paths.nodemonWatchExtensions,
                delay: 1000,
                env: { 'NODE_ENV': 'development' }
            }).on('start', function () {
                isWatching = true;
                if (!started) {
                    cb();
                    started = true;
                }
                if (backendServerIsProxied) {
                    gutil.log('===========================================================');
                    gutil.log(`PROXY FOR HMR AT http://${settings.hostname}:${settings.webpackDevServerPort}`);
                    gutil.log('===========================================================');
                }
            });
        },
        nodemonRestart: function() {
            if (isWatching && !nodemonRestarting) {
                nodemonRestarting = true;
                setTimeout(function() {
                    nodemonLibrary.emit('restart');
                    setTimeout(function() { nodemonRestarting = false; }, 500);
                }, 500);
            }
        },
        schemaGraphQl: function() {
            return gulp.src(paths.schema)
            .pipe(schema({ json: true, graphql: true, fileName: 'schema' }))
            .on('error', handleError)
            .pipe(gulp.dest(paths.schemaDist));
        },
        sslCerts: function(callback) {
            sslCertsPath = path.join(__dirname, paths.tmpSslCertsPath);
            try {
                fs.accessSync(sslCertsPath, fs.F_OK);
            } catch (e) {
                fs.mkdirSync(sslCertsPath);
            }
            pem.createCertificate({days: 7, selfSigned: true}, function(err, keys){
                fs.writeFileSync(path.join(sslCertsPath, 'key.pem'), keys.serviceKey);
                fs.writeFileSync(path.join(sslCertsPath, 'cert.pem'), keys.certificate);
                callback();
            });
        },
        tsd: function (callback) {
            tsd({command: 'reinstall', config: './tsd.json' }, callback);
        },
        typescripts: function() {
            var tsResult = gulp.src(paths.sourceTs)
                .pipe(sourcemaps.init({ loadMaps: true }))
                .pipe(ts(tsProject)).on('error', handleError);
            return tsResult.js.pipe(sourcemaps.write('.')).pipe(gulp.dest(paths.dist));
        },
        webpackProd: function(callback) {
            var prodCompiler = webpack(webpackProdConfig);
            prodCompiler.run(function(err, stats) {
                if (err) { return handleError(err); }
                var jsonStats = stats.toJson();
                if(jsonStats.errors.length > 0) { return handleError(jsonStats.errors); }
                if(jsonStats.warnings.length > 0) { handleError(jsonStats.warnings, true); }
                return callback();
            });
        },
        webpackDevServer: function(callback) {
            var myConfig = Object.create(webpackDevConfig);
            new WebpackDevServer(webpack(myConfig), {
                filename: 'bundle.js',
                publicPath: '/',
                hot: true,
                inline: true,
                quiet: true,
                proxy: { '*': { target: `http://${settings.hostname}:${settings.serverPort}`, secure: false }}
            }).listen(settings.webpackDevServerPort, settings.hostname, function(err) {
                if(err) { throw new gutil.PluginError('webpack-dev-server', err); }
                backendServerIsProxied = true;
                gutil.log(`[PROXY DEV SERVER] http://${settings.hostname}:${settings.webpackDevServerPort}`);
                callback();
            });
        }
    };

    /* *********** MIXIN TASKS *********** */
    gulp.task('babel', tasks.babel);
    gulp.task('clean', tasks.clean);
    gulp.task('full-watch', tasks.fullWatch);
    gulp.task('nodemon', tasks.nodemon);
    gulp.task('light-watch', tasks.lightWatch);
    gulp.task('lint', tasks.lint);
    gulp.task('restart-nodemon', tasks.restartNodemon);
    gulp.task('schema', tasks.schemaGraphQl);
    gulp.task('ssl-certs', tasks.sslCerts);
    gulp.task('tsd', tasks.tsd);
    gulp.task('typescripts', tasks.typescripts);
    gulp.task('webpack-prod', tasks.webpackProd);
    gulp.task('webpack-dev-server', tasks.webpackDevServer);
    /* *********** MAIN TASKS *********** */
    gulp.task('ts', function(cb) { gulpSequence('lint', 'typescripts', 'restart-nodemon', cb); });
    gulp.task('transpile', function(cb) { gulpSequence('ts', 'schema', 'babel', cb); });
    gulp.task('build-prod', function(cb) { gulpSequence('clean', 'tsd', 'transpile', 'webpack-prod', tasks.jobFinisher(cb)); });
    gulp.task('build-dev-server', function(cb) { gulpSequence('clean', 'tsd', 'transpile', 'webpack-dev-server', cb); });
    // Use full-dev to include the TS progressive build
    gulp.task('full-dev', function(cb) { gulpSequence('build-dev-server', 'full-watch', 'nodemon', cb); });
    // Use light-dev to let an IDE like Atom do the TS progressive build (update tsconfig `compileOnSave` for this)
    gulp.task('light-dev', function(cb) { gulpSequence('build-dev-server', 'light-watch', 'nodemon', cb); });

    gulp.task('default', ['full-dev']);
})();
