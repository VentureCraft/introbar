@if($sticky)
<div id="ib-pusher"></div>
@endif
<div id="ib-content">
    <div id="ib-close"></div>
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
            padding: 30px 60px 30px 60px;
            text-align: center;
            font-family: Helvetica Neue, Helvetica, Arial;
            font-weight: normal;
            font-size: 24px;
            color: #FFF;
        }
        #the-intro-bar #ib-content #ib-header{
            font-weight: bold;
            font-size: 30px;
            line-height: 38px;
        }
        #the-intro-bar #ib-content #ib-message{
            font-size: 20px;
        }
        #the-intro-bar p {
            margin: 5px 0;
            color: #FFF;
        }
        #ib-close {
            width: 20px;
            height: 20px;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkQ1NUFGMTRFQzA0MTFFNDk2QjRERDU5MzY0QTBENUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkQ1NUFGMTVFQzA0MTFFNDk2QjRERDU5MzY0QTBENUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCRDU1QUYxMkVDMDQxMUU0OTZCNERENTkzNjRBMEQ1RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCRDU1QUYxM0VDMDQxMUU0OTZCNERENTkzNjRBMEQ1RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pl590fkAAAINSURBVHja1Jm/S8NAFMfT2pZKETeFzgGdXQXJILh1Fdyc+o/0P8gq3do/QKEguFRwddbB7kppodAqWDnfyTtJbZLeu/eS2gdfAvlx9yGXe79SUEp5DlYGHYNOQUegA9A+qIbXp6BX0DPoEXQHegB9kmfSgAT5oBA0VHQb4rM+ZU7bG+ugDmiu+DbHsepSgE3QRMnbBMd2BqyCuip76+JcJMBdUF/lZ32cc4mlELOLq6Bb0ImXr92DzkAf0ZPFmBvba4DzcM72KjfTTFiC9wyWdZZwvpn0DdYTdquGq6FrkLJrHHOcsLvrcYBpAPpaRQhSw21bzLcA6Fs4YQlIGzjjzP0oYGg5AQfSFs5YaADLxNjqAkmFM7G7rAEDh7dBgXSBMxZowJbj92QDyYHT1tKAPcZHnwbJhdPW04AvTLcRBykBp21QwkyYYxd4vMTjDugcdBW55mp7nmB0MG9S4s39WlEw2Os3twX6kswgSljg1Jjj3ESWNbrc3CWeSmySuA0hFbsHXDeTtlslIHscR22blVS4jjrICE4CMnBJFlycsAvkb7JASbc4EYIKGVITVonwZQu5lLCuSvmlYqstZIdSNM0yKJoM5IhSNKWVneMMys4Rtew0yqMfk9an2fzWh76hgQ/kCdf4C7eqw/qv228b0cDcmBbwWpvoBaHfEIc/Bc7ib4g30BP3N8S3AAMAUwhUOfsxKtcAAAAASUVORK5CYII=');
            background-size: 100%;
            position: absolute;
            top: 20px;
            right: 20px;
            cursor: pointer;
        }
    </style>
    @yield('style')
</div>