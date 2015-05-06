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

        if (!$site->referrers->count()) {
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