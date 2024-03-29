﻿// ==UserScript==
// @name        slickdeals
// @namespace   blackholeantsavannah
// @include     https://slickdeals.net/*
// @version     1.2.0
// @require     https://code.jquery.com/jquery-2.2.4.min.js
// @grant       none
// ==/UserScript==

var url_pat_u2 = /https?.*u2=(.*)/

$(document).ready(function(){
    $('a').each(function() {
        if (url_pat_u2.test(this.href)) {
            console.log('old: ' + this.href);
            this.href = decodeURIComponent(this.href.replace(url_pat_u2, "$1"));
            console.log('new: ' + this.href);
        }
    })

    if ($('#originalPostText').length > 0) {
      $('#detailsDescription').css({'display': 'none'});
      $('#originalPost').insertAfter($('#detailsDescription'));
      $('#originalPostText').attr('id', 'originalPostText--visible');
    }

    setInterval(
        function() {
            $('img[class="loading"]').each(
                function() {
                    $(this).attr('src', $(this).attr('data-original'));
                    $(this).attr('class', 'loaded');
                }
            )
        },
        2000
    );
})
