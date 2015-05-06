@extends('frontend')

@section('content')


<section id="intro">

    <div class="row">

        <div class="columns medium-8 medium-centered text-center">

            <h1>Welcome and entice visitors from specific sources with IntroBar.</h1>

        </div>

    </div>

    <div class="row">

            <div class="columns medium-4 medium-centered text-center">

               <div class="row">


                <div class="columns medium-12">
                                <a class="button radius expand" href="auth/register">Get started for $5 / m</a>
                                </div>

               </div>



            </div>

        </div>


</section>

<section id="example">

    <div class="row">

        <div class="columns medium-8">

<img class="example-image" src="{{ asset('img/example.png') }}">

        </div>

        <div class="columns medium-4">


           <h4>Make the most of your traffic by giving your visitors custom intros and offers based on the referrer.</h4>
            <p><a class="button tiny secondary radius" href="{{ route('site.index') }}?ref=producthunt">See a demo</a></p>


        </div>

    </div>

</section>

<section id="how-it-works">

    <div class="row">

        <div class="columns medium-12 text-center">


            <h3>IntroBar supports major online publications + custom referrers</h3>

            <p>Choose which sites you want to intro on your site. You can also create custom referrers.</p>


        </div>

    </div>

    <div class="sites">

    <div class="row">

        <div class="columns medium-12">

           <ul class="small-block-grid-2 medium-block-grid-5 large-block-grid-5">
             <li><a href="?ref=producthunt"><img src="{{ asset('img/sites/producthunt.png') }}"></a></li>
             <li><a href="?ref=techcrunch"><img src="{{ asset('img/sites/techcrunch.png') }}"></a></li>
             <li><a href="?ref=thenextweb"><img src="{{ asset('img/sites/thenextweb.png') }}"></a></li>
             <li><a href="?ref=mashable"><img src="{{ asset('img/sites/mashable.png') }}"></a></li>
             <li><a href="?ref=theverge"><img src="{{ asset('img/sites/theverge.png') }}"></a></li>
             <li><a href="?ref=engadget"><img src="{{ asset('img/sites/engadget.png') }}"></a></li>
             <li><a href="?ref=nytimes"><img src="{{ asset('img/sites/nytimes.png') }}"></a></li>
             <li><a href="?ref=huffingtonpost"><img src="{{ asset('img/sites/huffingtonpost.png') }}"></a></li>
             <li><a href="?ref=betalist"><img src="{{ asset('img/sites/betalist.png') }}"></a></li>
             <li><a href="?ref=reddit"><img src="{{ asset('img/sites/reddit.png') }}"></a></li>
           </ul>

        </div>

    </div>

    </div>

</section>

<section id="pricing">

    <div class="row">

        <div class="columns medium-6">

            <div class="price">

                <div class="amount">$5</div>
                <div class="extra">per month</div>

            </div>

        </div>

        <div class="columns medium-6">

            <h3>Simple Pricing</h3>

            <ul>
                <li>Month-by-month</li>
                <li>No Contracts</li>
                <li>Super Simple Installation</li>
            </ul>

            <a class="button radius small" href="/auth/register">Get Started</a>

        </div>

    </div>

</section>


@stop