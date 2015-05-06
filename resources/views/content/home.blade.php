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

            <img src="{{ asset('img/example.png') }}">

        </div>

        <div class="columns medium-4">






        </div>

    </div>

</section>

<section id="how-it-works">

    <div class="row">

        <div class="columns medium-6">

            <h3>Make the most of your products spread by giving your visitors custom intros and offers based on the referrer. </h3>

        </div>

        <div class="columns medium-6">



                </div>

    </div>

</section>

<section id="supported-sites">

    <div class="row">

        <div class="columns medium-12">



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