<?php namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Site;
use Illuminate\Support\Facades\Response;

class BarController extends Controller {

    public function showBar($uid, $referrer)
    {
        $site = Site::with(['referrers' => function($query) use($referrer){
            $query->where('domain', 'like', '%'.$referrer.'%');
        }])->whereUid($uid)->first();

        if (!$site->subscribed() && !$site->referrers->count() > 0) {
            // check they don't have more referrers than they should
            return $this->returnNothing();
        }

        if (!$site->subscribed() && !array_key_exists($referrer, config('referrers'))) {
            // check they don't have custom if they aren't paying
            return $this->returnNothing();
        }

        try {
            $html = view('v1.templates.' . $referrer)
                ->withReferrer($site->referrers[0])
                ->withSticky(false);
            $response = Response::make($html);
            $response->header('Access-Control-Allow-Origin', '*');
            return $response;
        } catch (\Exception $e) {
            return $this->returnNothing();
        }
    }

    public function returnNothing()
    {
        $response = Response::make('');
        $response->header('Access-Control-Allow-Origin', '*');
        return $response;
    }

}