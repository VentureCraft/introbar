@extends('v1.template')

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
    <div id="ib-cta"><a href="">introbar</a></div>
    <p>Welcome from TechCrunch!</p>
@stop