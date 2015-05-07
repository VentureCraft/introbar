@extends('frontend')

@section('content')

<section id="form">

    <div class="row">

        <div class="column medium-6 medium-centered">

            <h3>Reset Password</h3>


            @if (session('status'))
            <div class="alert-box success radius">
                {{ session('status') }}
            </div>
            @endif

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


            <form class="form-horizontal" role="form" method="POST" action="{{ url('/password/email') }}">
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
                        <button type="submit" class="button radius small">
                            Send Password Reset Link
                        </button>
                    </div>
                </div>


            </form>

        </div>

    </div>

</section>

@endsection
