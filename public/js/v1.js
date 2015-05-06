<<<<<<< HEAD
var IntroBar=IntroBar||{};IntroBar.Embed=function(){function e(e){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var t=new RegExp("[\\?&]"+e+"=([^&#]*)"),n=t.exec(location.search);return null===n?"":decodeURIComponent(n[1].replace(/\+/g," "))}function t(e){var t;t=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t.onreadystatechange=function(){if(t.readyState==XMLHttpRequest.DONE&&200==t.status){document.getElementById("the-intro-bar").innerHTML=t.responseText;var e=document.getElementById("the-intro-bar"),n=document.getElementById("ib-close");if(null===n)return;o(n,"click",function(){n.style.display="none",e.style.height=getComputedStyle(e).height,e.offsetHeight,e.style.height="0px"})}},t.open("GET",e,!0),t.send()}IntroBar.base_url=window._intro_bar.base_url||"http://introbar.com",IntroBar.account_id=window._intro_bar.account_id||null;var n=function(){var e=document.location.href;return domain=e.match(/:\/\/(.[^/]+)/)[1],domain},r=function(){var t=e("ref");if("undefined"!=typeof t)return t;if(document.referrer){var n=document.referrer;return t=n.match(/:\/\/(.[^/]+)/)[1]}return!1},o=function(e,t,n,r){r="undefined"!=typeof r?r:!1,e.addEventListener?e.addEventListener(t,n,r):("click"==t&&(t="onclick"),"mouseup"==t&&(t="onmouseup"),e.attachEvent(t,n))},i=function(e,n){var r=document.createElement("div");r.id="the-intro-bar",document.body.children[0].parentNode.insertBefore(r,document.body.children[0]),t(IntroBar.base_url+"/v1/bar/"+IntroBar.account_id+"/"+n+".html")},a=function(){if("undefined"!=typeof IntroBar.account_id){var e=r();if(e!==!1){var t=n();i(t,e)}}};return{init:a}}(),IntroBar.Embed.init();
=======
var IntroBar = IntroBar || {};

IntroBar.Embed = function() {
    IntroBar.base_url = window._intro_bar.base_url || 'http://introbar.com';
    IntroBar.account_id = window._intro_bar.account_id || null;
    //IntroBar.base_url = 'http://introbar.dev:8000';

    var getDomain = function(){
        var url = document.location.href;
        domain = url.match(/:\/\/(.[^/]+)/)[1];
        return domain;
    };

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var getReferrer = function(){
        var ref = getParameterByName('ref');
        if (typeof ref != 'undefined') {
            return ref;
        }
        else if (document.referrer) {
            var url = document.referrer;
            ref = url.match(/:\/\/(.[^/]+)/)[1];
            return ref;
        }
        return false;
    };


    function injectBar(url) {
        var xmlhttp;

        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        };

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if(xmlhttp.status == 200){
                    document.getElementById("the-intro-bar").innerHTML = xmlhttp.responseText;
                    var thebar = document.getElementById("the-intro-bar");
                    var closebtn = document.getElementById("ib-close");

                    addEventListener(closebtn, 'click', function(){
                        closebtn.style.display = 'none';
                        thebar.style.height = getComputedStyle(thebar).height;
                        thebar.offsetHeight;
                        thebar.style.height = '0px';
                    });
                }
            }
        };

        xmlhttp.open("GET", url , true);
        xmlhttp.send();
    }

    var addEventListener = function (element, event, callback, useCapture) {
        useCapture = typeof useCapture !== 'undefined' ? useCapture : false;
        if (element.addEventListener) {
            element.addEventListener(event, callback, useCapture);
        }
        else {
            if (event == "click") event = "onclick";
            if (event == "mouseup") event = "onmouseup";
            element.attachEvent(event, callback);
        }
    };

    var loadIntroBar = function(domain, referrer){
        //loadStyle(IntroBar.base_url + 'css/v1.css');
        var html = document.createElement("div");
        html.id = "the-intro-bar";
        //var e = document.body;
        document.body.children[0].parentNode.insertBefore(html, document.body.children[0]);
        //e.prependChild(html);
        injectBar(IntroBar.base_url + '/v1/bar/' + IntroBar.account_id + '/' + referrer + '.html');
    };

    var init = function(){
        if (typeof IntroBar.account_id === 'undefined') {
            return;
        }
        var referrer = getReferrer();
        if (referrer === false) {
            return;
        }
        var domain = getDomain();
        if (domain === referrer) {

        }
        loadIntroBar(domain, referrer);
    };


    return {
        init: init
    };
}();

IntroBar.Embed.init();
>>>>>>> 20d757bd82ae3e7e7aaeb6c0f01dd9df89b2a7ad
