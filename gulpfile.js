var elixir = require('laravel-elixir');
elixir.config.sourcemaps = false;

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Less
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {

    mix.sass([
        'frontend.scss'
    ]);

    mix.scripts([
        'v1.js'
    ], 'public/js/v1.js');

    mix.scripts([
        '../../../bower_components/modernizr/modernizr.js',
        '../../../bower_components/jquery/dist/jquery.js',
        '../../../bower_components/spectrum/spectrum.js',
        '../../../bower_components/fastclick/lib/fastclick.js',
        '../../../bower_components/foundation/js/foundation/foundation.js',
        '../../../bower_components/foundation/js/foundation/foundation.reveal.js',
        'frontend.js'
    ], 'public/js/frontend.js');


    mix.version([
        'public/css/frontend.css',
        'public/js/frontend.js'
    ]);
});
