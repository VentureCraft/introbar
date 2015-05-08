<?php namespace App\Http\Controllers;

use App\Commands\ClearCDN;
use CDN;
use App\Http\Requests;
use App\Http\Controllers\Controller;

use App;
use App\Referrer;
use App\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Queue;
use Krucas\Notification\Facades\Notification;

class ReferrerController extends Controller
{

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function create($site_uid, $referrer_type = 'custom')
    {
        $is_custom = $referrer_type === 'custom';
        $site = Site::whereUid($site_uid)->first();
        if (!$is_custom) {
            $referrer = Referrer::whereSiteId($site->id)
                ->whereType($referrer_type)
                ->first();
            if ($referrer) {
                return redirect()->route('referrer.edit', $referrer->id);
            }
        }

        $referrer_defaults = config('referrers.' . $referrer_type);

        if (!$is_custom && !$referrer_defaults) {
            Notification::warning('Sorry, that referrer type is not available yet');
            return redirect()->route('dashboard');
        }

        return view('manage.referrer.create')
            ->withCustom($is_custom)
            ->withType($referrer_type)
            ->withDefaults($referrer_defaults);
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

        if (!App::environment('local')) {
            Queue::push(new ClearCDN($site_uid, $input['domain']));
        }

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
    public function destroy(Requests\DeleteReferrerRequest $request)
    {
        Referrer::find($request->input('referrer_id'))->delete();

        Notification::success('Intro bar deleted, it may take some time for the cache to clear');
        return redirect()->route('dashboard');
    }

}
