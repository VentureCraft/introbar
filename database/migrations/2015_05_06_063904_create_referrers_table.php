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
            $table->integer('site_id')->unsigned();

            $table->string('name');
            $table->string('domain');
            $table->string('type');

            $table->text('header')->nullable();
            $table->text('message')->nullable();
            $table->string('background_color')->default('#000000');
            $table->string('text_color')->default('#FFFFFF');

            $table->timestamps();

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
        Schema::drop('referrers');
    }

}
