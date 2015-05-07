<?php namespace App\Exceptions;

use App;
use Auth;
use Config;
use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Html;
use Rollbar;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{

    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        'Symfony\Component\HttpKernel\Exception\HttpException'
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception $e
     * @return void
     */
    public function report(Exception $e)
    {
        if (!Config::get('app.debug') && $e->getStatusCode() != '404') {

            $conf = [
                'access_token' => config('services.rollbar.access_token'),
                'environment' => App::environment(),
                'root' => app_path(),
                'code_version' => HtmlBuilder::gitVersion()
            ];

            if (Auth::check()) {
                $conf['person'] = [
                    'id' => Auth::user()->id,
                    'email' => Auth::user()->email
                ];
            }

            Rollbar::init($conf);

            Rollbar::report_exception($e);

        }

        return parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Exception $e
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $e)
    {
        return parent::render($request, $e);
    }

}
