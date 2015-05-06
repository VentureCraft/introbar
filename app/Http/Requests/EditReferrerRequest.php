<?php namespace App\Http\Requests;

use App\Http\Requests\Request;
use App\Referrer;
use Illuminate\Support\Facades\Auth;

class EditReferrerRequest extends Request
{

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $referrer = Referrer::find($this->route('referrer_id'));
        if (!$referrer || $referrer->site->user_id != Auth::user()->id) {
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
        $referrer = Referrer::find($this->route('referrer_id'));
        if ($referrer->custom) {
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
