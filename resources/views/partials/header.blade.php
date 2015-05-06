<section id="header">

    <div class="row">

        <div class="columns medium-8">

            <a class="logo" href="{{ route('site.index') }}"><img src="{{ asset('img/logo.png') }}"></a>

        </div>

        <div class="columns medium-4 text-right">

            @if(!Auth::check())
            <div class="row">
                <div class="columns medium-6">
                    <a class="button tiny expand radius" href="/auth/register">Get Started</a>
                </div>

                <div class="columns medium-6">
                                    <a class="button expand tiny secondary radius" href="/auth/login">Login</a>
                                </div>
            </div>
            @else
            <div class="row">

                            <div class="columns medium-offset-6 medium-6">
                                                <a class="button expand tiny secondary radius" href="{{ route('dashboard') }}">Your Dashboard</a>
                                            </div>
                        </div>
            @endif

        </div>

    </div>

</section>
