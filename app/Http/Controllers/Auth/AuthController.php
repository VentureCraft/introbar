<?php namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateAccountRequest;
use App\Site;
use App\User;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\Registrar;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class AuthController extends Controller
{

    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    use AuthenticatesAndRegistersUsers;

    /**
     * Create a new authentication controller instance.
     *
     * @param  \Illuminate\Contracts\Auth\Guard $auth
     * @param  \Illuminate\Contracts\Auth\Registrar $registrar
     * @return void
     */
    public function __construct(Guard $auth, Registrar $registrar)
    {
        $this->auth = $auth;
        $this->registrar = $registrar;

        $this->middleware('guest', ['except' => 'getLogout']);
    }


    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function postRegister(Request $request)
    {

        $rules = [
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'url' => 'required',
            'password' => 'required',
            'password_confirmation' => 'required|same:password'
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails())
        {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors($validator->errors());
        }


        $user = User::create([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'password' => Hash::make($request->get('password'))
        ]);
        $site = Site::create([
            'url' => $request->get('url'),
            'user_id' => $user->id,
            'uid' => uniqid()
        ]);

        $this->auth->loginUsingId($user->id);

        return redirect($this->redirectPath());
    }

}
