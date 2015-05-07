@extends('frontend')

@section('title', 'Dashboard')

@section('content')
    <div class="row">
        <div class="columns">

            {!! Notification::showAll() !!}

            <div class="">
                <a class="tiny radius success button" href="#" data-reveal-id="installation-modal">Installation Instructions</a>
            </div>

        </div>
    </div>
    <div class="row">
        <div class="columns">

            @if($site->referrers->count() > 0)
                <h2>Your intro bars</h2>
            @else
                <div class="alert-box info radius">
                    <h2>Welcome :) What now?</h2>
                    <p>Adding your first IntroBar is super easy, just click on one of the options below to get started!</p>
                    <p>Seriously, it'll take you less than a minute.</p>
                    <p>Then just pop this code on your site and you're done! <a class="tiny radius success button" href="#" data-reveal-id="installation-modal">Installation Instructions</a></p>
                </div>
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
                        <a class="small radius button info" href="{{ route('referrer.create', [$site->uid, 'custom']) }}">Custom</a>
                    @foreach(config('referrers') as $referrer_type => $referrer_info)
                        <a class="small radius button" href="{{ route('referrer.create', [$site->uid, $referrer_type]) }}">{{ $referrer_info['name'] }}</a>
                    @endforeach
                </div>
            </div>
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

@endsection
