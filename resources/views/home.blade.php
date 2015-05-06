@extends('frontend')

@section('content')

    @if(!$site->subscribed())
        <div class="alert-box alert">
            <h2>Billing not setup</h2>

            <p>Your intro bar will not appear on your site until your billing has been setup.</p>
            {!! Form::open(['route' => ['site.setup_billing', $site->uid]]) !!}
            <script
                    src="https://checkout.stripe.com/checkout.js" class="stripe-button"
                    data-key="{{ env('STRIPE_API_PUBLIC') }}"
                    data-email="{{ Auth::user()->email }}"
                    data-amount="500"
                    data-name="IntroBar"
                    data-description="Monthly Plan"
                    data-image="{{ asset('img/ib-logo.png') }}">
            </script>
            {!! Form::close() !!}
        </div>
    @elseif($site->onGracePeriod())
        <div class="alert-box alert">
            <p>Your billing has been cancelled, however your account will remain active until {{ $site->subscription_ends_at->formatLocalized('%A %b %e, %Y') }}</p>
        </div>
    @endif

    @foreach($site->referrers as $referrer)
        <div>
            <h3>{{ $referrer->name }}</h3>
            <a href="{{ route('referrer.edit', $referrer->id) }}">Edit</a>
            {!! Form::open(['route' => ['referrer.destroy', $referrer->id], 'method' => 'DELETE', 'onsubmit' => 'return
            confirm(\'Are you sure? This cannot be undone.\')']) !!}
            {!! Form::submit('Delete', ['class' => 'alert radius button']) !!}
            {!! Form::close() !!}
        </div>
    @endforeach

    <div>
        <h1>Add a new intro bar for...</h1>

        <h3><a href="{{ route('referrer.create', [$site->uid, 'custom']) }}">Custom</a></h3>
        @foreach(config('referrers') as $referrer_type => $referrer_info)
            <div>
                <h3>
                    <a href="{{ route('referrer.create', [$site->uid, $referrer_type]) }}">{{ $referrer_info['name'] }}</a>
                </h3>
            </div>
        @endforeach
    </div>

    @if($site->subscribed() && !$site->onGracePeriod())
        {!! Form::open(['route' => ['site.cancel_billing', $site->uid], 'method' => 'DELETE', 'onsubmit' => 'return confirm(\'Are you sure? This cannot be undone.\')']) !!}
        {!! Form::submit('Cancel Billing', ['class' => 'alert radius button']) !!}
        {!! Form::close() !!}
    @endif

@endsection
