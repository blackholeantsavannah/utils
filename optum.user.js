// ==UserScript==
// @name        OptumRx Helper
// @namespace   Violentmonkey Scripts
// @include
// @grant       none
// @include     *optumrx.com/secure/*
// @require     https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js
// @version     1.0
// @author      -
// @description Get names for claims. Avoid idle logout.
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

// https://stackoverflow.com/a/61511955
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}


function formatCleanString(arr) {
  function shortenNames(s) {
    s = s.replace(/[ _]pharmacy/ig, '');
    return s;
  }
  function cleanAbbrs(s) {
    return s;
  }
  function cleanChars(s) {
    s = s.trim();
    s = s.replaceAll('#', '');
    s = s.replace(/[/ ]/g, '_');
    return s;
  }

  for (var i = 0; i < arr.length; i++) {
    arr[i] = shortenNames(arr[i]);
    arr[i] = cleanAbbrs(arr[i]);
    arr[i] = cleanChars(arr[i]);
  }

  arr = [...new Set(arr)].sort();
  return arr.join('_');
}

function formatDateString(s) {
  return new Date(s).toISOString().replace(/T.*/, '')
}

function formatServiceDatesString(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = formatDateString(arr[i]);
  }
  arr = [...new Set(arr)].sort();
  if (arr.length == 1)
    return arr[0];
  else
    return `${arr[0]}_${arr[arr.length - 1]}`;
}

new MutationObserver(function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      continue_session_elem = $('#gnav-modal-footer-close');
      countdown_elem = $('.countdown');
      alt_continue_session_elem = $('button[data-testid="modal-primary-button"]')

      if (
        (continue_session_elem.length > 0 && countdown_elem.length > 0)
        || alt_continue_session_elem.length > 0
      ) {
        console.log('Logout timer found');
        setTimeout(
          function() {
            $(alt_continue_session_elem).click();
            $(continue_session_elem).click();
            console.log('Clicked to avoid logout');
            console.log($(continue_session_elem));
            console.log($(countdown_elem));
          },
          5000,
        );
      }
      else if (alt_continue_session_elem.length > 0) {
        console.log('Found continue session button but no countdown, skipping click');
        console.log($(alt_continue_session_elem));
      }
    }
  }
}).observe(document.body, { childList: true, subtree: true });

window.addEventListener('load', function() {
  function main() {
    var field_id = 'blackberryantsavannah_filename';

    if ($(`#${field_id}`).length != 0) {
      return
    }

    var date = $('span').filter(function(){return $(this).text().includes('Fill date')}).find('strong').text();

    if (date == '') {
      return
    }

    var pharmacy_name = $('.card-label').filter(function() {return $(this).text().includes('Pharmacy')}).parent().find('p[data-ng-show="true"]').text().trim().split('\n')[0];
    // var drug_name = $('a[link-id="cta_middle_panel_Drug name : "]').text();
    var drug_name = $('span').filter(function() {return $(this).text().includes('Drug name');}).find('strong').text();

    var full_filename = [
      formatDateString(date),
      formatCleanString([pharmacy_name]),
      formatCleanString([drug_name]),
    ].join('--') + '.pdf';
    console.log(full_filename);

    var filename_field = $('<div>').attr('id', field_id);
    $(filename_field).html(full_filename);
    $(filename_field).css({'cursor': 'pointer', 'text-align': 'right'});
    $(filename_field).click(
      function () {
        navigator.clipboard.writeText($(this).text());
        $(this).css({'display': 'none'});
      }
    )
    $(filename_field).insertBefore($('section.card'));
  }

  waitForElm("div[data-ng-if=\"claimsType=='claims'\"]").then(this.setInterval(main, 2000));

}, false);
