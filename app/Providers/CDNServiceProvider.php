<?php namespace App\Providers;

use App\Services\CDN\KeyCDN;
use Illuminate\Support\ServiceProvider;

class CDNServiceProvider extends ServiceProvider {

    public function register()
    {
        $this->app->bind('CDN', function()
        {
            return new KeyCDN();
        });

        $this->app->booting(function () {
            $loader = \Illuminate\Foundation\AliasLoader::getInstance();
            $loader->alias('CDN', 'App\Services\CDN\KeyCDN');
        });

    }

}