// ==UserScript==
// @name        slickdeals
// @namespace   blackholeantsavannah
// @include     https://slickdeals.net/*
// @version     1
// @require     https://code.jquery.com/jquery-2.2.4.min.js
// @grant       none
// ==/UserScript==

var url_pat_u2 = /https?.*u2=(.*)/
//var urls_u2 = $('a').filter(function() { return this.href.match(url_pat) } )

$('a').each(function() {
    if (url_pat_u2.test(this.href)) {
        console.log('old: ' + this.href);
        this.href = decodeURIComponent(this.href.replace(url_pat_u2, "$1"));
        console.log('new: ' + this.href);
    }
})
