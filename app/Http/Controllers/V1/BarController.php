<?php namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Response;

class BarController extends Controller {

    public function showBar($domain, $referrer)
    {

        $referrer = 'techcrunch';

        if (false) {
            return $this->returnNothing();
        }

        try {
            $html = view('v1.' . $referrer)
                ->withSticky(true);
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