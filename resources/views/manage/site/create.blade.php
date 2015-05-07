@extends('frontend')

@section('title', 'Add site')

@section('content')
    <div class="row">
        <div class="columns">
            <h1>Add site</h1>
            <div>
                {!! Form::open() !!}

                <div>
                    <label for="url" class="{{ $errors->has('url')?'error':'' }}">Name
                        {!! Form::text('url') !!}
                    </label>
                    @if($errors->has('url'))
                        <small class="error">{{ $errors->first('url') }}</small>
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