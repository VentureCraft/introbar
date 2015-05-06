@if($sticky)
<div id="ib-pusher"></div>
@endif
<div id="ib-content">
    @yield('content')
    <style>
        #the-intro-bar #ib-pusher {
            height: 50px;
        }
        #the-intro-bar #ib-content {
        @if($sticky)
            width: 100%;
            position: fixed;
            top: 0;
        @endif
            z-index: 1000;
            height: 50px;
            overflow: visible;
            padding: 10px;
            text-align: center;
            font-family: Helvetica Neue, Helvetica, Arial;
            font-weight: normal;
            font-size: 24px;
            color: #FFF;
        }
        #the-intro-bar p {
            margin: 5px 0;
            color: #FFF;
        }
        #ib-cta {
            font-size: 11px;
            opacity: 0.7;
            color: #FFF;
            float: right;
        }
    </style>
    @yield('style')
</div>