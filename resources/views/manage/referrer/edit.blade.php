@extends('frontend')

@section('head')
    <link href="{{ asset('css/vendor/spectrum.css') }}" rel="stylesheet">
@stop

@section('content')
    <div class="row">
        <div class="columns">

            <h1>Edit {{ $referrer->custom?'custom':config('referrers.' . $referrer->type . '.name') }} intro bar</h1>
            <div>
                {!! Form::model($referrer) !!}

                @if($referrer->custom)
                    <div>
                        <label for="name" class="{{ $errors->has('name')?'error':'' }}">Name
                            {!! Form::text('name') !!}
                        </label>
                        @if($errors->has('name'))
                            <small class="error">{{ $errors->first('name') }}</small>
                        @endif
                    </div>
                    <div>
                        <label for="domain" class="{{ $errors->has('domain')?'error':'' }}">Domain
                            {!! Form::text('domain', null, ['placeholder' => 'Just the domain, e.g., techcrunch.com']) !!}
                        </label>
                        @if($errors->has('domain'))
                            <small class="error">{{ $errors->first('domain') }}</small>
                        @endif
                    </div>
                    <div>
                        <div class="row">
                            <div class="columns small-6 medium-3">
                                <label for="background_color" class="{{ $errors->has('background_color')?'error':'' }}">Background Color</label>
                            </div>
                            <div class="columns small-6 medium-9">
                                {!! Form::input('color', 'background_color') !!}
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="row">
                            <div class="columns small-6 medium-3">
                                <label for="background_color" class="{{ $errors->has('text_color')?'error':'' }}">Text Color</label>
                            </div>
                            <div class="columns small-6 medium-9">
                                {!! Form::input('color', 'text_color') !!}
                            </div>
                        </div>
                    </div>
                @endif
                <div>
                    <label for="header" class="{{ $errors->has('header')?'error':'' }}">Header
                        {!! Form::textarea('header', null, ['placeholder' => 'e.g., Welcome from xyw.com!']) !!}
                    </label>
                    @if($errors->has('header'))
                        <small class="error">{{ $errors->first('header') }}</small>
                    @endif
                </div>
                <div>
                    <label for="message" class="{{ $errors->has('message')?'error':'' }}">Header
                        {!! Form::textarea('message', null, ['placeholder' => 'e.g., Use coupon code 1234 for mega discounts :)']) !!}
                    </label>
                    @if($errors->has('message'))
                        <small class="error">{{ $errors->first('message') }}</small>
                    @endif
                </div>

                <div>
                    {!! Form::submit('Save', ['class' => 'small radius success button']) !!}
                </div>
                {!! Form::close() !!}


            </div>
        </div>
    </div>
@stop
