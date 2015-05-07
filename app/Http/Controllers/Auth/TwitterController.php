<?php  namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Site;
use App\User;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\Registrar;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;

class TwitterController extends Controller
{

    use AuthenticatesAndRegistersUsers;

    public function __construct(Guard $auth, Registrar $registrar)
    {
        $this->auth = $auth;
        $this->registrar = $registrar;

        $this->middleware('guest', ['except' => 'getLogout']);
    }

    public function getLogin()
    {
        return \Socialize::with('twitter')->redirect();
    }

    public function oauthReturn(){

        $user = \Socialize::with('twitter')->user();

        $new_user = User::whereTwitterId($user->getId())->first();
        $is_new_user = false;
        if (!$new_user) {
            $is_new_user = true;
            // if not already registered, create a user account for them and log them in
            $new_user = new User();
            $new_user->twitter_id = $user->getId();
        }
        $new_user->twitter_token = $user->token;
        $new_user->twitter_secret = $user->tokenSecret;
        $new_user->name = $user->getName();
        $new_user->save();

        $new_user = User::whereTwitterId($new_user->twitter_id)->first();

        if ($is_new_user) {
            $site = Site::create([
                'url' => '',
                'user_id' => $new_user->id,
                'uid' => uniqid()
            ]);
        }

        $this->auth->loginUsingId($new_user->id, true);

        return redirect()->route('dashboard');
    }
}