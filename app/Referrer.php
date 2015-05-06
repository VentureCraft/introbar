<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Referrer extends Model
{

    public $fillable = [
        'name',
        'domain'
    ];

}
