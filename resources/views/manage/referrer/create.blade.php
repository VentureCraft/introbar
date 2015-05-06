@extends('app')

@section('content')
    <h1>Add intro bar</h1>
    <div>
        {!! Form::open() !!}

        @if($custom)
            <div>
                <label for="name">Name</label>
                {!! Form::text('name') !!}
                @if($errors->has('name'))
                    <div>{{ $errors->first('name') }}</div>
                @endif
            </div>
            <div>
                <label for="domain">Domain</label>
                {!! Form::text('domain', null, ['placeholder' => 'Just the domain, e.g., techcrunch.com']) !!}
                @if($errors->has('domain'))
                    <div>{{ $errors->first('domain') }}</div>
                @endif
            </div>
            <div>
                <label for="background_color">Background Color</label>
                {!! Form::input('color', 'background_color') !!}
                @if($errors->has('background_color'))
                    <div>{{ $errors->first('background_color') }}</div>
                @endif
            </div>
            <div>
                <label for="text_color">Text Color</label>
                {!! Form::input('color', 'text_color') !!}
                @if($errors->has('text_color'))
                    <div>{{ $errors->first('text_color') }}</div>
                @endif
            </div>
        @else
            <div>
                <label for="name">Name</label>
                <div>{{ $defaults['name'] }}</div>
                @if($errors->has('name'))
                    <div>{{ $errors->first('name') }}</div>
                @endif
            </div>
        @endif
        <div>
            <label for="header">Header</label>
            {!! Form::textarea('header', null, ['placeholder' => 'e.g., Welcome from xyw.com!']) !!}
            @if($errors->has('header'))
                <div>{{ $errors->first('header') }}</div>
            @endif
        </div>
        <div>
            <label for="message">Header</label>
            {!! Form::textarea('message', null, ['placeholder' => 'e.g., Use coupon code 1234 for mega discounts :)']) !!}
            @if($errors->has('message'))
                <div>{{ $errors->first('message') }}</div>
            @endif
        </div>

        <div>
            {!! Form::submit('Save', ['class' => 'success button']) !!}
        </div>
        {!! Form::close() !!}

    </div>
@stop