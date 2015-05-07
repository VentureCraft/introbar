<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>

    <title>@yield('title', 'Welcome new users from a range of referrers with Intro Bars') - IntroBar.com</title>

    <link href="{!! asset('css/frontend.css') !!}" rel="stylesheet">

    @yield('head')

</head>
<body>

@yield('content')

<script src="{{ asset('js/introbar.js') }}"></script>

</body>
</html>
