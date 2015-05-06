<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Referrer extends Model
{

    public $fillable = [
        'site_id',
        'name',
        'domain',
        'type',
        'background_color',
        'text_color',
        'header',
        'message'
    ];


    public function site()
    {
        return $this->belongsTo('App\Site');
    }

    public function getCustomAttribute()
    {
        return $this->type === 'custom';
    }
}
