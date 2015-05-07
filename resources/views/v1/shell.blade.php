@if($sticky)
<div id="ib-pusher"></div>
@endif
<div id="ib-content">
@if(!$whitelabel)
    <a href="http://introbar.com" id="powered-by"></a>
    @endif
    <div id="ib-close"></div>
    @yield('content')

    <p id="ib-header">{{ $referrer->header }}</p>
    @if($referrer->message)
        <p id="ib-message">{{ $referrer->message }}</p>
    @endif

    <style>
        #the-intro-bar {
            position: relative;
            /*overflow: hidden;*/
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


        #the-intro-bar #ib-content #powered-by {
            width: 80px;
            height: 28px;
            display: block;
            position: absolute;
            top: 20px;
            left: 20px;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHoAAAAqCAYAAAB8108TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzZFOTVBMEZFQzIyMTFFNDk2QjRERDU5MzY0QTBENUYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzZFOTVBMTBFQzIyMTFFNDk2QjRERDU5MzY0QTBENUYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCRDU1QUYxNkVDMDQxMUU0OTZCNERENTkzNjRBMEQ1RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozNkU5NUEwRUVDMjIxMUU0OTZCNERENTkzNjRBMEQ1RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnsvK3cAAAa1SURBVHja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');
            background-size: cover;
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