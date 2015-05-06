<?php namespace App\Http\Requests;

use App\Http\Requests\Request;
use App\Site;
use Illuminate\Support\Facades\Auth;

class CreateReferrerRequest extends Request
{

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $site = Site::whereUid($this->route('site_uid'))->first();
        $type = $this->route('referrer_type');
        if (!is_null($type) && !config('referrers.' . $type)) {
            return false;
        }
        if (!$site || $site->user_id != Auth::user()->id || $site->at_limit) {
            return false;
        }
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $rules = [];
        if (!$this->route('referrer_type')) {
            // is custom
            $rules['name'] = 'required';
            $rules['domain'] = 'required';
            $rules['background_color'] = 'required';
            $rules['text_color'] = 'required';
        }
        $rules['header'] = 'required';

        return $rules;
    }

}
