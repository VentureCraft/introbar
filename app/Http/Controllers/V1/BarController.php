<?php namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Site;
use Illuminate\Support\Facades\Response;

class BarController extends Controller {

    public function showBar($uid, $referrer)
    {

        $site = Site::with(['referrers'])->whereUid($uid)->first();

        // if (!$site->subscribed() && $site->referrers->count() !== 1) {
            // check they don't have more referrers than they should
            // return $this->returnNothing();
        // }

        $referrer = $site->referrers->filter(function($ref) use ($referrer){
            if ($ref->domain === $domain) {
                return true;
            } else if ($domain === substr($ref->domain, 0, strpos($ref->domain, '.'))) {
                return true;
            }
            return false;
        })->first();

        if (!$referrer) {
            // no referrer... :(
            return $this->returnNothing();
        }


        // if (!$site->subscribed() && !array_key_exists($referrer, config('referrers'))) {
            // check they don't have custom if they aren't paying
            // return $this->returnNothing();
        // }

        $template = $referrer->custom?'custom':$referrer->type;

        try {
            $html = view('v1.templates.' . $template)
                ->withWhitelabel(false)
                ->withReferrer($referrer)
                ->withSticky(false);
            $response = Response::make($html);
            $response = $this->allowOriginHeaders($response);
            $response->header('Content-Length', strlen($response->getContent()));
            return $response;
        } catch (\Exception $e) {
            return $this->returnNothing();
        }
    }

    public function options()
    {
        $response = Response::make('');
        $response = $this->allowOriginHeaders($response);
        $response->header('Content-Length', strlen($response->getContent()));
        return $response;
    }

    public function returnNothing()
    {
        $response = Response::make('');
        $response = $this->allowOriginHeaders($response);
        $response->header('Content-Length', strlen($response->getContent()));
        return $response;
    }

    public function allowOriginHeaders($response)
    {
        $response->header('P3P', 'CP="CAO DSP COR CURa ADMa DEVa OUR IND PHY ONL UNI COM NAV INT DEM PRE IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"');
        $response->header('Access-Control-Allow-Origin', '*');
        $response->header('Access-Control-Allow-Headers', 'P3P, Content-Type, Cache-Control, Origin, Accept-Encoding');
        return $response;
    }

}
