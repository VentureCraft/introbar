<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();

        $referrers = [
            [
                'name' => 'TechCrunch',
                'domain' => 'techcrunch.com'
            ],
            [
                'name' => 'Mashable',
                'domain' => 'mashable.com'
            ],
            [
                'name' => 'ProductHunt',
                'domain' => 'producthunt.com'
            ],
            [
                'name' => 'The Verge',
                'domain' => 'verge.com'
            ],
            [
                'name' => 'The Next Web',
                'domain' => 'thenextweb.com'
            ],
            [
                'name' => 'GigaOM',
                'domain' => 'gigaom.com'
            ]
        ];

        foreach ($referrers as $referrer) {
            \App\Referrer::create($referrer);
        }
    }

}
