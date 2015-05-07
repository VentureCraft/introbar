@extends('v1.shell')

@section('pusher')
    <div id="ib-pusher"></div>
@stop

@section('style')
    <style>
        #the-intro-bar #ib-content {
            background-color: {{ $referrer->background_color }};
            color: {{ $referrer->text_color }};
        }
    </style>
@stop