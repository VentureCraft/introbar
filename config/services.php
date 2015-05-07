<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Stripe, Mailgun, Mandrill, and others. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */

    'mailgun' => [
        'domain' => '',
        'secret' => '',
    ],

    'mandrill' => [
        'secret' => '',
    ],

    'ses' => [
        'key' => '',
        'secret' => '',
        'region' => 'us-east-1',
    ],

    'keycdn' => array(
        'username' => env('KEYCDN_USERNAME'),
        'password' => env('KEYCDN_PASSWORD'),
        'zone_id' => env('KEYCDN_ZONEID'),
        'zone_url' => 'introbar-b16.kxcdn.com/'
    ),

    'stripe' => [
        'model' => 'App\Site',
        'secret' => env('STRIPE_API_SECRET'),
    ],

    'rollbar' => [
        'access_token' => env('ROLLBAR_ACCESS_TOKEN'),
    ],

    'twitter' => [
        'client_id' => 'V4McVVYmCZixLCb6xfS9MLktq',
        'client_secret' => 'gOIO47kbilqFxxs6TZCXjVOfmrf4GqUakeLQ0rs04Uuz0nFkRw',
        'redirect' => env('BASE_URL', 'http://introbar.com') . '/twitter/auth/return',
    ],
];
