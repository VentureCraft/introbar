@extends('frontend')

@section('title', 'Dashboard')

@section('content')

<section id="backend">

    <div class="row">
        <div class="columns medium-12">

            {!! Notification::showAll() !!}

            <div class="">
                <a class="small radius success button" href="#" data-reveal-id="installation-modal">Installation
                    Instructions</a>
            </div>

        </div>
    </div>

    <div class="row">

        <div class="columns medium-12">


            @if($site->referrers->count() == 0)
            <div class="alert-box info radius">
                <h2>Welcome :) What now?</h2>

                <p>Adding your first IntroBar is super easy, just click on one of the options below to get
                    started!</p>

                <p>Seriously, it'll take you less than a minute.</p>

                <p>Then just pop this code on your site and you're done! <a class="small radius success button"
                                                                            href="#"
                                                                            data-reveal-id="installation-modal">Installation
                        Instructions</a></p>
            </div>
            @endif

        </div>

    </div>

    <div class="row">

        <div class="columns medium-3">
            <div class="referrers">

                <h3>Add IntroBar.</h3>

                <ul class="small-block-grid-2 medium-block-grid-1">
                    <li><a class="small radius expand button info"
                           href="{{ route('referrer.create', [$site->uid, 'custom']) }}">Custom</a></li>
                    @foreach(config('referrers') as $referrer_type => $referrer_info)
                    <li><a class="small expand radius button" href="{{ route('referrer.create', [$site->uid, $referrer_type]) }}">{{
                            $referrer_info['name'] }}</a></li>
                    @endforeach
                </ul>

            </div>


        </div>

        <div class="columns medium-9">


            @if($site->referrers->count() > 0)
            <h3>Your intro bars</h3>
            @endif

            <div class="introbars">

                @foreach($site->referrers as $referrer)

                <div class="introbar clearfix">

                    <div class="introbar--site">
                        <p>{{ $referrer->name }}</p>
                    </div>

                    <div class="introbar--actions">
                        <ul class="button-group round">
                            @if($site->url)
                            <li><a class="right tiny info radius button" href="?ref={{ $referrer->domain}}&account_id={{ $site->uid }}">Preview</a></li>
                            @endif
                            <li><a class="right tiny info radius button" href="{{ route('referrer.edit', $referrer->id) }}">Edit</a></li>
                            <li><a class="right tiny alert radius button delete-action" href="#" data-id="{{ $referrer->id }}" data-popup="delete-modal">Delete</a></li>
                        </ul>
                    </div>


                </div>

                @endforeach


            </div>
        </div>
    </div>


</section>


<div id="installation-modal" class="reveal-modal" data-reveal aria-labelledby="modalTitle" aria-hidden="true"
     role="dialog">
    <h2 id="modalTitle">Installation instructions.</h2>

    <p class="lead">Add the following to directly before your &lt;/body&gt; tag.</p>
        <pre>
&lt;script&gt;
    var _intro_bar = window._intro_bar || {};(function() {var i,e;i=document.createElement("script"), i.type='text/javascript';i.async=1, i.src="//cdn.introbar.com/js/v1.js", e=document.getElementsByTagName("script")[0], e.parentNode.insertBefore(i,e);})();
    _intro_bar.account_id = '{{ $site->uid }}';
&lt;/script&gt;
</pre>
    <a class="close-reveal-modal" aria-label="Close">&#215;</a>
</div>

<div id="delete-modal" class="reveal-modal small" data-reveal aria-labelledby="modalTitle" aria-hidden="true"
     role="dialog">
    <h3 id="modalTitle">Are you sure?</h3>

    {!! Form::open(['route' => ['referrer.destroy'], 'method' => 'DELETE']) !!}
    {!! Form::hidden('referrer_id',null,['id' => 'delete-id']) !!}
    {!! Form::submit('Confirm Delete', ['class' => 'tiny alert radius button']) !!}
    {!! Form::close() !!}

    <a class="close-reveal-modal" aria-label="Close">&#215;</a>
</div>

@endsection
