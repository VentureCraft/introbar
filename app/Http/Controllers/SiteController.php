<?php namespace App\Http\Controllers;

use App\Commands\ClearCDN;
use CDN;
use App\Http\Requests;
use App\Http\Controllers\Controller;

use App\Referrer;
use App\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Queue;
use Krucas\Notification\Facades\Notification;

class SiteController extends Controller
{

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create()
    {
        return view('manage.site.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(Requests\CreateReferrerRequest $request, $site_uid, $referrer_type = 'custom')
    {
        $input = $request->all();
        if ($referrer_type === 'custom') {
            $input['type'] = 'custom';
        } else {
            $input['type'] = $referrer_type;
            $input = array_merge($input, config('referrers.' . $referrer_type));
        }
        $site = Site::whereUid($site_uid)->first();
        $input['site_id'] = $site->id;

        Referrer::create($input);
        Notification::success('New intro bar added, nice work :)');

        Queue::push(new ClearCDN($site_uid, $input['domain']));

        return redirect()->route('dashboard');
    }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     * @return Response
     */
    public function edit($referrer_id)
    {

        $referrer = Referrer::find($referrer_id);
        if (!$referrer) {
            return redirect()->route('dashboard');
        }

        return view('manage.referrer.edit')
            ->withReferrer($referrer);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int $id
     * @return Response
     */
    public function update(Requests\EditReferrerRequest $request, $referrer_id)
    {
        $referrer = Referrer::find($referrer_id);
        Referrer::find($referrer_id)->update($request->all());

        Queue::push(new ClearCDN($referrer->site->uid, $referrer->domain));

        Notification::success('Intro bar updated, it may take some time for the cache to clear');
        return redirect()->route('dashboard');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return Response
     */
    public function destroy(Requests\DeleteReferrerRequest $request, $referrer_id)
    {
        Referrer::find($referrer_id)->delete();

        Notification::success('Intro bar deleted, it may take some time for the cache to clear');
        return redirect()->route('dashboard');
    }

}
