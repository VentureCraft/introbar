var IntroBar = IntroBar || {};

IntroBar.Embed = function() {
    IntroBar.base_url = window._intro_bar.base_url || '//cdn.introbar.com';
    IntroBar.account_id = window._intro_bar.account_id || null;

    var getMyDomain = function(){
        var url = document.location.href;
        domain = url.match(/:\/\/(.[^/]+)/)[1];
        return getDomain(domain);
    };

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var getReferrer = function(){
        var ref = getParameterByName('ref');
        if (ref !== null && ref !== "") {
            return ref;
        }
        else if (document.referrer) {
            var url = document.referrer;
            ref = url.match(/:\/\/(.[^/]+)/)[1];
            return getDomain(ref);
        }
        return false;
    };

    var getDomain = function(url)
    {
        var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c", "xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd", "xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c", "xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba", "xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv", "xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h", "xn--mgbayh7gpa", "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar", "xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c", "xn--wgbh1c", "xn--wgbl6a", "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h", "xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm", "zw"].join()

        var parts = url.split('.');
        if (parts[0] === 'www' && parts[1] !== 'com'){
            parts.shift()
        }
        var ln = parts.length
            , i = ln
            , minLength = parts[parts.length-1].length
            , part

        // iterate backwards
        while(part = parts[--i]){
            // stop when we find a non-TLD part
            if (i === 0                    // 'asia.com' (last remaining must be the SLD)
                || i < ln-2                // TLDs only span 2 levels
                || part.length < minLength // 'www.cn.com' (valid TLD as second-level domain)
                || TLDs.indexOf(part) < 0  // officialy not a TLD
            ){
                return part
            }
        }
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
                        //thebar.style.visibility = "visible";
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
        html.style.width = "100%";

        document.body.children[0].parentNode.insertBefore(html, document.body.children[0]);
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
        var domain = getMyDomain();
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
