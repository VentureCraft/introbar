<?php namespace App;

use Laravel\Cashier\Billable;
use Laravel\Cashier\Contracts\Billable as BillableContract;
use Illuminate\Database\Eloquent\Model;

class Site extends Model implements BillableContract
{

    use Billable;

    protected $dates = ['trial_ends_at', 'subscription_ends_at'];

    public $fillable = [
        'user_id',
        'uid',
        'name',
        'url'
    ];

    public function referrers()
    {
        return $this->hasMany('App\Referrer');
    }

    public function getAtLimitAttribute()
    {
        return !$this->subscribed() && $this->referrers->count();
    }
}
