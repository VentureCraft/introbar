@extends('frontend')

@section('content')

    <section id="form">

           <div class="row">

               <div class="column medium-6 medium-centered">

               <h3>Register</h3>

              @if (count($errors) > 0)
                                          <div class="alert-box radius alert">
                                              <strong>Whoops!</strong> There were some problems with your input.<br><br>
                                              <ul>
                                                  @foreach ($errors->all() as $error)
                                                      <li>{{ $error }}</li>
                                                  @endforeach
                                              </ul>
                                          </div>
                                      @endif


               <form class="form-horizontal" role="form" method="POST" action="{{ url('/auth/register') }}">
                                           <input type="hidden" name="_token" value="{{ csrf_token() }}">

               <div class="row">
                   <div class="large-12 columns">
                     <label>Your Name
                       <input type="text" class="form-control" name="name" value="{{ old('name') }}">
                     </label>
                   </div>
                 </div>


                 <div class="row">
                                    <div class="large-12 columns">
                                      <label>Email Address
                                        <input type="email" class="form-control" placeholder="you@example.com" name="email" value="{{ old('email') }}">
                                      </label>
                                    </div>
                                  </div>



                                  <div class="row">
                                                     <div class="large-12 columns">
                                                       <label>Your Website
                                                        <input type="text" class="form-control" placeholder="example.com" name="url" value="{{ old('url') }}">
                                                       </label>
                                                     </div>
                                                   </div>

                                                   <div class="row">
                                                                      <div class="large-12 columns">
                                                                        <label>Password
                                                                          <input type="password" class="form-control" name="password">
                                                                        </label>
                                                                      </div>
                                                                    </div>

                                                                     <div class="row">
                                                                        <div class="large-12 columns">
                                                                        <label>Confirm Password
                                                                        <input type="password" class="form-control" name="password_confirmation">
                                                                        </label>
                                                                        </div>
                                                                        </div>


 <div class="row">
                                    <div class="large-12 columns">
                                      <button type="submit" class="button radius small">Register</button>
                                    </div>
                                  </div>

               </form>

               </div>

           </div>

       </section>

@endsection
