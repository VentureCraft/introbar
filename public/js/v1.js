var IntroBar = IntroBar || {};

IntroBar.Embed = function() {
    //IntroBar.base_url = 'http://introbar.com/';
    IntroBar.base_url = 'http://introbar.dev:8000';

    var getDomain = function(){
        var url = document.location.href;
        domain = url.match(/:\/\/(.[^/]+)/)[1];
        return domain;
    };

    var getReferrerDomain = function(){
        if (document.referrer) {
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
                }
                else if(xmlhttp.status == 400) {
                    alert('There was an error 400')
                }
                else {
                    alert('something else other than 200 was returned')
                }
            }
        };

        xmlhttp.open("GET", url , true);
        xmlhttp.send();
    }


    var loadIntroBar = function(domain, referrer){
        //loadStyle(IntroBar.base_url + 'css/v1.css');
        var html = document.createElement("div");
        html.id = "the-intro-bar";
        //var e = document.body;
        document.body.children[0].parentNode.insertBefore(html, document.body.children[0]);
        //e.prependChild(html);
        injectBar(IntroBar.base_url + '/v1/bar/' + domain + '/' + referrer);
    };

    var init = function(){
        var referrer = getReferrerDomain();
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