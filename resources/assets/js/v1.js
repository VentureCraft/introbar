var IntroBar = IntroBar || {};

IntroBar.Embed = function() {
    IntroBar.base_url = window._intro_bar.base_url || 'http://cdn.introbar.com';
    IntroBar.account_id = window._intro_bar.account_id || null;

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
                    setTimeout(function(){
                        var thebar = document.getElementById("the-intro-bar");
                        thebar.style.visibility = "visible";
                        thebar.style.position = "relative";
                        var closebtn = document.getElementById("ib-close");
                        if (closebtn === null) {
                            return;
                        }
                        addEventListener(closebtn, 'click', function(){
                            thebar.style.maxHeight = getComputedStyle(thebar).height;
                            thebar.offsetHeight;
                            thebar.style.maxHeight = '0px';
                        });
                    }, 10);
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
        var html = document.createElement("div");
        html.id = "the-intro-bar";
        html.style.visibility = "hidden";
        html.style.overflow = "hidden";
        html.style.position = "fixed";

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
        if (referrer === false || referrer === '' || referrer === null) {
            return;
        }
        var domain = getDomain();
        if (domain === referrer) {
            return;
        }
        loadIntroBar(domain, referrer);
    };


    return {
        init: init
    };
}();

IntroBar.Embed.init();