<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateReferrersTable extends Migration
{

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('referrers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('domain');
            $table->timestamps();
        });


        Schema::create('referrers_sites', function(Blueprint $table){
            $table->increments('id');

            $table->integer('referrer_id')->unsigned();
            $table->integer('site_id')->unsigned();

            $table->text('header')->nullable();
            $table->text('message')->nullable();

            $table->timestamps();

            $table->foreign('referrer_id')
                ->references('id')->on('referrers')
                ->onDelete('cascade');

            $table->foreign('site_id')
                ->references('id')->on('sites')
                ->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('referrers_sites');
        Schema::drop('referrers');
    }

}
