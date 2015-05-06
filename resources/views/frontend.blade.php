<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>

    <title>@yield('title', 'Welcome new users from a range of referrers with Intro Bars') - IntroBar.com</title>
    <meta name="description" content="@yield('description', '')">

    <meta property="og:url" content="{!! Request::url() !!}"/>

    <meta property="og:image" content=""/>
    <meta property="og:type" content="website"/>
    <meta property="og:site_name" content="introbar.com"/>

    <link rel="home" href="{!! route('site.index') !!}"/>

    <link href="{!! asset('css/frontend.css') !!}" rel="stylesheet">


    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    @yield('head')

    <script type="text/javascript">
      WebFontConfig = {
        google: { families: [ 'Roboto:400,300,700:latin' ] }
      };
      (function() {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
          '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
      })(); </script>

</head>
<body>

@include('partials.header')

@yield('content')

@include('partials.footer')

<!-- Scripts -->
<script src="{!! elixir('js/frontend.js') !!}"></script>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-45780115-5', 'auto');
  ga('send', 'pageview');

</script>

<script>
var _elev = window._elev || {};(function() {var i,e;i=document.createElement("script"),i.type='text/javascript';i.async=1,i.src="https://static.elev.io/js/v3.js",e=document.getElementsByTagName("script")[0],e.parentNode.insertBefore(i,e);})();
_elev.account_id = '5549f860cc906';
</script>

<script>
    @if(App::environment('local'))
    var _intro_bar = window._intro_bar || {};(
        function() {
            var i,e;
            i=document.createElement("script"),
                    i.type='text/javascript';
            i.async=1,
                    i.src="http://introbar.dev:8000/js/v1.js",
                    e=document.getElementsByTagName("script")[0],
                    e.parentNode.insertBefore(i,e);
        })();
    _intro_bar.base_url = 'http://introbar.dev:8000';
    @else
        var _intro_bar = window._intro_bar || {};(
        function() {var i,e;i=document.createElement("script"), i.type='text/javascript';i.async=1, i.src="http://cdn.introbar.com/js/v1.js", e=document.getElementsByTagName("script")[0], e.parentNode.insertBefore(i,e);})();
    @endif
    _intro_bar.account_id = '5549f860cc906';
</script>

</body>
</html>
