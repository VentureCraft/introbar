<?php namespace App\Http\Requests;

use App\Http\Requests\Request;
use App\Site;
use Illuminate\Support\Facades\Auth;

class CancelBillingRequest extends Request
{

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $site = Site::whereUid($this->route('site_uid'))->first();
        if (!$site || $site->user_id != Auth::user()->id) {
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
        return [
            //
        ];
    }

}
