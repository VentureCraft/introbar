@extends('frontend')

@section('title', 'Dashboard')

@section('content')
    <div class="row">
        <div class="columns">

            {!! Notification::showAll() !!}

            @if($site->onGracePeriod())
                <div class="alert-box warning radius">
                    <p>Your billing has been cancelled, however your account will remain active
                        until {{ $site->subscription_ends_at->formatLocalized('%A %b %e, %Y') }}</p>
                </div>
            @endif

            <div class="">
                <a class="tiny radius success button" href="#" data-reveal-id="installation-modal">Installation Instructions</a>
            </div>

        </div>
    </div>
    <div class="row">
        <div class="columns">

            @if($site->referrers->count() > 0)
                <h2>Your intro bars</h2>
            @endif
            @foreach($site->referrers as $referrer)
                <div class="referrer">
                    {!! Form::open(['route' => ['referrer.destroy', $referrer->id], 'method' => 'DELETE', 'class' => 'right', 'onsubmit' => 'return confirm(\'Are you sure? This cannot be undone.\')']) !!}
                    {!! Form::submit('Delete', ['class' => 'tiny alert radius button']) !!}
                    {!! Form::close() !!}
                    <a class="right tiny radius info button" href="{{ route('referrer.edit', $referrer->id) }}">Edit</a>
                    <h3>{{ $referrer->name }}</h3>
                </div>
            @endforeach

            <hr/>

            <div>
                <h3>Add a new intro bar for...</h3>

                <div class="text-center">
                    @if(!$site->subscribed())
                        <a class="small radius button info" href="#" data-reveal-id="upgrade-modal">Custom</a>
                    @else
                        <a class="small radius button info" href="{{ route('referrer.create', [$site->uid, 'custom']) }}">Custom</a>
                    @endif
                    @foreach(config('referrers') as $referrer_type => $referrer_info)
                        @if($site->at_limit)
                            <a class="small radius button" href="#" data-reveal-id="upgrade-modal">{{ $referrer_info['name'] }}</a>
                        @else
                            <a class="small radius button" href="{{ route('referrer.create', [$site->uid, $referrer_type]) }}">{{ $referrer_info['name'] }}</a>
                        @endif
                    @endforeach
                </div>
            </div>

            @if($site->subscribed() && !$site->onGracePeriod())
                {!! Form::open(['route' => ['site.cancel_billing', $site->uid], 'method' => 'DELETE', 'onsubmit' => 'return confirm(\'Are you sure? This cannot be undone.\')']) !!}
                {!! Form::submit('Cancel Billing', ['class' => 'alert radius button']) !!}
                {!! Form::close() !!}
            @endif

        </div>
    </div>


    <div id="installation-modal" class="reveal-modal" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">
        <h2 id="modalTitle">Installation instructions.</h2>
        <p class="lead">Add the following to directly before your &lt;/body&gt; tag.</p>
        <pre>
&lt;script&gt;
    var _intro_bar = window._intro_bar || {};(function() {var i,e;i=document.createElement("script"), i.type='text/javascript';i.async=1, i.src="http://cdn.introbar.com/js/v1.js", e=document.getElementsByTagName("script")[0], e.parentNode.insertBefore(i,e);})();
    _intro_bar.account_id = '{{ $site->uid }}';
&lt;/script&gt;
</pre>
        <a class="close-reveal-modal" aria-label="Close">&#215;</a>
    </div>

    @if(!$site->subscribed())
    <div id="upgrade-modal" class="reveal-modal" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">
        <h2 id="modalTitle">Billing not setup.</h2>
        <p class="lead">To add more than one referral source, or create a custom source, you'll need to move to the paid plan.</p>
        <p>(it's only $5 a month)</p>
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
        <a class="close-reveal-modal" aria-label="Close">&#215;</a>
    </div>
    @endif


@endsection
