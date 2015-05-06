<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>

    <title>@yield('title', '') - IntroBar.com</title>
    <meta name="description" content="@yield('description', '')">

    <meta property="og:url" content="{!! Request::url() !!}"/>

    <meta property="og:image" content=""/>
    <meta property="og:type" content="website"/>
    <meta property="og:site_name" content="introbar.com"/>

    <link rel="home" href="{!! route('site.index') !!}"/>

    <link href="{!! elixir('css/frontend.css') !!}" rel="stylesheet">


    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    @yield('head')

</head>
<body>

<section id="introbar">

    <div class="row">

        <div class="columns medium-12 text-center">

            <p>This is your intro bar</p>

        </div>

    </div>

</section>

@include('partials.header')

@yield('content')

@include('partials.footer')

<!-- Scripts -->
<script src="{!! elixir('js/frontend.js') !!}"></script>

</body>
</html>
