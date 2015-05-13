@extends('v1.shell')

@section('style')
    <style>
        #the-intro-bar #ib-content {
            background-color: #089E00;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASUAAADWCAYAAACXFpR0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkZEQ0NEMENFQ0IwMTFFNEE5MzVFODI1Mjc2NzRCMDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkZEQ0NEMERFQ0IwMTFFNEE5MzVFODI1Mjc2NzRCMDQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2RkRDQ0QwQUVDQjAxMUU0QTkzNUU4MjUyNzY3NEIwNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2RkRDQ0QwQkVDQjAxMUU0QTkzNUU4MjUyNzY3NEIwNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqvwY7AAAAKTSURBVHja7NcxCsJAEEBRIynEylIQayuP4mm9iCC2NsHGK0gct7CXgJJZ8x5MvZuJfkgTETOALBpRAkQJQJQAUQIQJUCUAEQJECUAUQJECUCUAEQJECUAUQJECUCUAFECECVAlABECRAlAFECECVAlABECRAlAFECRAlAlABRAhAlQJQARAlAlABRAhAlQJQARAkQJQBRAkQJQJQAUQIQJQBRAkQJQJQAUQKoOEoHr+BvXMtckt7N72y441gHz+0eyESUAFECECVAlABECRAlAFECRAlAlABRAhAlAFECRAlAlABRAhAlQJQARAkQJQBRAkQJQJQARAkQJQBRAkQJQJQAUQIQJUCUAEQJECUAUQIQJUCUAEQJqEsTEWOev026l/V7MjqX6RPea1FmlXRn9zJPf/dBurEObqf64B8sE0fpVuaR8F67xDs7Jd0ZPt8AUQIQJUCUAEQJECUAUQJECUCUAFECECUAUQJECUCUAFECECVAlABECRAlAFECECVAlABECRAlAFECRAlAlABRAhAlQJQARAlAlABRAhAlQJQARAmoXmsFTMCmTG8Ng3SiBL+zt4J6ouTzDUhFlABRAhAlQJQARAkQJQBRAkQJQJQAUQIQJQBRAkQJQJQAUQIQJUCUAEQJECUAUQJECUCUAEQJECUAUQJECUCUAFECECVAlABECRAlAFECECVAlABECahLExG2AIgSgCgBogQgSoAoAYgSIEoAogSIEoAoAaIkSoAoAYgSIEoAogSIEoAoAaIEIEqAKAGIEoAoAaIEIEqAKAGIEiBKAKIEiBKAKAGiBCBKAKIEiBKAKAGiBCBKgCgBiBIgSgCiBIgSgCgBiBIgSgCiBIgSgCgBogTwbS8BBgChLz8ohQv8ywAAAABJRU5ErkJggg==');
            background-position: center left;
            background-repeat: no-repeat;
            background-size: 15%;
        }
    </style>
@stop
