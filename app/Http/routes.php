<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::post('queue/receive', function()
{
    return Queue::marshal();
});


Route::get('/', ['uses' => 'WelcomeController@index', 'as' => 'site.index']);

Route::controllers([
    'auth' => 'Auth\AuthController',
    'password' => 'Auth\PasswordController',
]);

Route::group([
    'namespace' => 'V1',
    'prefix' => 'v1'
], function(){
    Route::get('bar/{domain?}/{referrer?}.html', ['uses' => 'BarController@showBar'])
        ->where('referrer', '(.*)');
    Route::options('bar/{domain?}/{referrer?}.html', ['uses' => 'BarController@options'])
        ->where('referrer', '(.*)');
});

Route::group([
    'prefix' => 'twitter'
], function(){
    Route::get('auth/login', ['uses' => 'Auth\TwitterController@getLogin', 'as' => 'twitter.login']);
    Route::get('auth/return', 'Auth\TwitterController@oauthReturn');
});

Route::group([
    'middleware' => 'auth'
], function(){
    Route::get('home', ['uses' => 'DashboardController@index', 'as' => 'dashboard']);
    Route::post('site/{site_uid}/setupPayment', ['uses' => 'PaymentController@setupPayment', 'as' => 'site.setup_billing']);
    Route::delete('site/{site_uid}/cancelBilling', ['uses' => 'PaymentController@cancelBilling', 'as' => 'site.cancel_billing']);

    Route::get('site/create', ['uses' => 'SiteController@create', 'as' => 'site.create']);
    Route::post('site/create', ['uses' => 'SiteController@store', 'as' => 'site.store']);

    Route::get('site/{site_uid}/add_referrer/custom', ['uses' => 'ReferrerController@create', 'as' => 'referrer.create']);
    Route::post('site/{site_uid}/add_referrer/custom', ['uses' => 'ReferrerController@store', 'as' => 'referrer.store']);
    Route::get('site/{site_uid}/add_referrer/{referrer_type}', ['uses' => 'ReferrerController@create', 'as' => 'referrer.create']);
    Route::post('site/{site_uid}/add_referrer/{referrer_type}', ['uses' => 'ReferrerController@store', 'as' => 'referrer.store']);
    Route::get('referrer/{referrer_id}/edit', ['uses' => 'ReferrerController@edit', 'as' => 'referrer.edit']);
    Route::post('referrer/{referrer_id}/edit', ['uses' => 'ReferrerController@update', 'as' => 'referrer.update']);
    Route::delete('referrer', ['uses' => 'ReferrerController@destroy', 'as' => 'referrer.destroy']);
});
