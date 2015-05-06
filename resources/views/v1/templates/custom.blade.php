@extends('v1.shell')

@section('pusher')
    <div id="ib-pusher"></div>
@stop

@section('style')
    <style>
        #the-intro-bar #ib-content {
            background-color: green;
        }
    </style>
@stop

@section('content')
    <p>Welcome from custom!!!</p>
@stop