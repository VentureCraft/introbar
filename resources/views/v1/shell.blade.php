@if($sticky)
<div id="ib-pusher"></div>
@endif
<div id="ib-content">
    <div id="ib-close">x</div>
    @yield('content')

    <p id="ib-header">{{ $referrer->header }}</p>
    @if($referrer->message)
        <p id="ib-message">{{ $referrer->message }}</p>
    @endif

    <style>
        #the-intro-bar {
            overflow: hidden;
            -webkit-transition: height .5s ease-in-out; /* Safari */
            transition: height .5s ease-in-out;
            transition-timing-function: cubic-bezier(.55,0,.1,1);
            -webkit-transition-timing-function: cubic-bezier(.55,0,.1,1);
        }
        #the-intro-bar #ib-content {
            z-index: 1000;
            overflow: visible;
            padding: 20px;
            text-align: center;
            font-family: Helvetica Neue, Helvetica, Arial;
            font-weight: normal;
            font-size: 24px;
            color: #FFF;
        }
        #the-intro-bar #ib-content p#ib-header{
            font-weight: bold;
            font-size: 30px;
        }
        #the-intro-bar #ib-content p#ib-message{
            font-size: 20px;
        }
        #the-intro-bar p {
            margin: 5px 0;
            color: #FFF;
        }
        #ib-close {
            font-size: 12px;
            font-family: "Consolas", "Menlo", "Courier", monospace;
            position: absolute;
            top: 10px;
            right: 20px;
            cursor: pointer;
        }
    </style>
    @yield('style')
</div>