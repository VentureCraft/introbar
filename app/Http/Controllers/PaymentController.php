<?php namespace App\Http\Controllers;

use App\Http\Requests\CancelBillingRequest;
use App\Site;
use Illuminate\Http\Request;
use Krucas\Notification\Facades\Notification;

class PaymentController extends Controller
{

    public function setupPayment(Request $request, $site_uid)
    {
        $site = Site::whereUid($site_uid)->first();
        $site->subscription('INTROBAR5')->create($request->get('stripeToken'));

        Notification::success('Billing setup... you rock!');

        return redirect()->route('dashboard');
    }


    public function cancelBilling(CancelBillingRequest $request, $site_uid)
    {
        $site = Site::whereUid($site_uid)->first();
        $site->subscription()->cancel();

        Notification::success('Billing cancelled, sorry to see you go :(');

        return redirect()->route('dashboard');

    }

}