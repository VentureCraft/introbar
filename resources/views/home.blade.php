@extends('app')

@section('content')

@foreach($site->referrers as $referrer)
    <div>
        <h3>{{ $referrer->name }}</h3>
        <a href="{{ route('referrer.edit', $referrer->id) }}">Edit</a>
        {!! Form::open(['route' => ['referrer.destroy', $referrer->id], 'method' => 'DELETE', 'onsubmit' => 'return confirm(\'Are you sure? This cannot be undone.\')']) !!}
        {!! Form::submit('Delete', ['class' => 'alert radius button']) !!}
        {!! Form::close() !!}
    </div>
@endforeach

<div>
    <h1>Add a new intro bar for...</h1>
    <h3><a href="{{ route('referrer.create', [$site->uid, 'custom']) }}">Custom</a></h3>
@foreach(config('referrers') as $referrer_type => $referrer_info)
    <div>
        <h3><a href="{{ route('referrer.create', [$site->uid, $referrer_type]) }}">{{ $referrer_info['name'] }}</a></h3>
    </div>
@endforeach
</div>

@endsection
