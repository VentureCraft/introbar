var IntroBar=IntroBar||{};IntroBar.Embed=function(){function e(e){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var t=new RegExp("[\\?&]"+e+"=([^&#]*)"),n=t.exec(location.search);return null===n?"":decodeURIComponent(n[1].replace(/\+/g," "))}function t(e){var t;t=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t.onreadystatechange=function(){if(t.readyState==XMLHttpRequest.DONE&&200==t.status){document.getElementById("the-intro-bar").innerHTML=t.responseText;var e=document.getElementById("the-intro-bar"),n=getComputedStyle(e).height;e.style.visibility="visible",e.style.maxHeight="0px";var r=document.getElementById("ib-close");if(null===r)return;i(r,"click",function(){e.style.maxHeight=getComputedStyle(e).height,e.offsetHeight,e.style.maxHeight="0px"}),setTimeout(function(){e.style.maxHeight=n},1)}},t.open("GET",e,!0),t.send()}IntroBar.base_url=window._intro_bar.base_url||"http://cdn.introbar.com",IntroBar.account_id=window._intro_bar.account_id||null;var n=function(){var e=document.location.href;return domain=e.match(/:\/\/(.[^/]+)/)[1],domain},r=function(){var t=e("ref");if("undefined"!=typeof t)return t;if(document.referrer){var n=document.referrer;return t=n.match(/:\/\/(.[^/]+)/)[1]}return!1},i=function(e,t,n,r){r="undefined"!=typeof r?r:!1,e.addEventListener?e.addEventListener(t,n,r):("click"==t&&(t="onclick"),"mouseup"==t&&(t="onmouseup"),e.attachEvent(t,n))},o=function(e,n){var r=document.createElement("div");r.id="the-intro-bar",r.style.visibility="hidden",r.style.overflow="hidden",r.style.setProperty("transition","height 0.8s linear, max-height 0.8s linear"),r.style.setProperty("-webkit-transition","height 0.8s linear, max-height 0.8s linear"),r.style.setProperty("transition-timing-function","cubic-bezier(.55,0,.1,1)"),r.style.setProperty("-webkit-transition-timing-function","cubic-bezier(.55,0,.1,1)"),document.body.children[0].parentNode.insertBefore(r,document.body.children[0]),t(IntroBar.base_url+"/v1/bar/"+IntroBar.account_id+"/"+n+".html")},a=function(){if("undefined"!=typeof IntroBar.account_id){var e=r();if(e!==!1&&""!==e&&null!==e){var t=n();t!==e&&o(t,e)}}};return{init:a}}(),IntroBar.Embed.init();