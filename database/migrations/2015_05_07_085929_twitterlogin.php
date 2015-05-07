<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Twitterlogin extends Migration
{

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function(Blueprint $table){
            $table->integer('twitter_id')->nullable();
            $table->string('twitter_secret')->nullable();
            $table->string('twitter_token')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function(Blueprint $table){
            $table->dropColumn('twitter_token');
            $table->dropColumn('twitter_secret');
            $table->dropColumn('twitter_id');
        });

    }

}
