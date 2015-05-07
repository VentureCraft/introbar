@extends('frontend')

@section('content')

<section id="form">

    <div class="row">

        <div class="column medium-6 medium-centered">

            <p class="text-center">
                <a class="small round button" href="{{ route('twitter.login') }}">Login with twitter</a>
            </p>

            <p class="text-center">-or-</p>

            <h3>Login</h3>

            @if (count($errors) > 0)
            <div class="alert-box radius alert">
                <strong>Whoops!</strong> There were some problems with your input.<br><br>
                <ul>
                    @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
            @endif

            <form class="form-horizontal" role="form" method="POST" action="{{ url('/auth/login') }}">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">

                <div class="row">
                    <div class="large-12 columns">
                        <label>Email Address
                            <input type="email" class="form-control" name="email" value="{{ old('email') }}">
                        </label>
                    </div>
                </div>

                <div class="row">
                    <div class="large-12 columns">
                        <label>Password
                            <input type="password" class="form-control" name="password">
                        </label>
                    </div>
                </div>

                <div class="row">
                    <div class="large-12 columns">
                        <input type="checkbox" name="remember"> Remember Me
                    </div>
                </div>

                <div class="row">
                    <div class="large-12 columns">
                        <button type="submit" class="button radius small">Login</button>
                        <a href="{{ url('/password/email') }}">Forgot Your Password?</a>
                    </div>
                </div>


            </form>

        </div>

    </div>

</section>

@endsection
