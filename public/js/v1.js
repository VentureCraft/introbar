var IntroBar=IntroBar||{};IntroBar.Embed=function(){function e(e){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var t=new RegExp("[\\?&]"+e+"=([^&#]*)"),n=t.exec(location.search);return null===n?"":decodeURIComponent(n[1].replace(/\+/g," "))}function t(e){var t;t=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t.onreadystatechange=function(){t.readyState==XMLHttpRequest.DONE&&200==t.status&&(document.getElementById("the-intro-bar").innerHTML=t.responseText,setTimeout(function(){var e=document.getElementById("the-intro-bar");e.style.position="relative";var t=document.getElementById("ib-close");null!==t&&o(t,"click",function(){e.style.maxHeight=getComputedStyle(e).height,e.offsetHeight,e.style.maxHeight="0px"})},10))},t.open("GET",e,!0),t.send()}IntroBar.base_url=window._intro_bar.base_url||"http://cdn.introbar.com",IntroBar.account_id=window._intro_bar.account_id||null;var n=function(){var e=document.location.href;return domain=e.match(/:\/\/(.[^/]+)/)[1],domain},r=function(){var t=e("ref");if("undefined"!=typeof t)return t;if(document.referrer){var n=document.referrer;return t=n.match(/:\/\/(.[^/]+)/)[1]}return!1},o=function(e,t,n,r){r="undefined"!=typeof r?r:!1,e.addEventListener?e.addEventListener(t,n,r):("click"==t&&(t="onclick"),"mouseup"==t&&(t="onmouseup"),e.attachEvent(t,n))},i=function(e,n){var r=document.createElement("div");r.id="the-intro-bar",r.style.visibility="hidden",r.style.overflow="hidden",r.style.width="100%",document.body.children[0].parentNode.insertBefore(r,document.body.children[0]),t(IntroBar.base_url+"/v1/bar/"+IntroBar.account_id+"/"+n+".html")},a=function(){if("undefined"!=typeof IntroBar.account_id){var e=r();if(e!==!1&&""!==e&&null!==e){var t=n();t!==e&&i(t,e)}}};return{init:a}}(),IntroBar.Embed.init();