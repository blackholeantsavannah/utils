// ==UserScript==
// @name        Aetna EOB helper
// @namespace   Violentmonkey Scripts
// @include
// @grant       none
// @match       https://health.aetna.com/*
// @require     https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js
// @version     1.0
// @author      -
// @description
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

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

function itemTextToArray(selector) {
  return $(selector).map(function () { return $(this).text(); }).get();
}

function formatProviderNamesString(arr) {
  function shortenNames(s) {
    // make text replacements here
    return s;
  }
  function cleanAbbrs(s) {
    s = s.replaceAll(' At ', ' - ');
    s = s.replaceAll('L.L.C.', 'LLC');
    s = s.replaceAll('LLC', '');
    return s;
  }
  function cleanChars(s) {
    s = s.replaceAll(' - ', ' ');
    s = s.replace(/[,\. ]/g, '');
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

var eob_row_selector = 'tr[data-test="eob-list-info-table-item"]';
var eob_subrow_item_selector = 'div[data-test="eob-list-info-table"]';
var eob_header_selector = 'tr[data-test="info-table-header"]';

window.addEventListener('load', function() {
  function main() {
    $(eob_header_selector).find('div[data-test="info-table-header-heading-4"]').html('(Filename Copied on Download)');

    $(eob_row_selector).each(
      function(i, eob_elem) {
        var statement_date = $(eob_elem).find('div[data-test="eob-list-item-statement-link"]').text();
        var providers = itemTextToArray($(eob_elem).find('div[data-test="eob-list-item-description"]').find('div'));
        var service_dates = itemTextToArray($(eob_elem).find('span[data-test="eob-list-item-service-date"]').find('div'));
        var download_button = $(eob_elem).find('button');

        console.log(statement_date);
        console.log(providers);
        console.log(formatProviderNamesString(providers));
        console.log(service_dates);
        console.log(formatServiceDatesString(service_dates));

        var full_filename = [
          formatDateString(statement_date),
          formatServiceDatesString(service_dates),
          formatProviderNamesString(providers)
        ].join('--') + '.pdf';
        console.log(full_filename);

        var last_elem = $(eob_elem).find('td');
        last_elem = last_elem[$(last_elem).length - 1];

        var filename_field = $('<td>').attr('colspan', 5).append(filename_field);
        $(filename_field).html(full_filename);

        filename_field = $('<tr>').attr('id', `blackberryantsavannah_filename_${i}`).append(filename_field);
        $(filename_field).css({'cursor': 'pointer', 'text-align': 'right'});
        $(filename_field).click(function () {navigator.clipboard.writeText($(this).text());})
        $(filename_field).insertBefore(eob_elem);
        $(download_button).click(function(){navigator.clipboard.writeText(full_filename);});
      }
    )

    // var filename = $('<textarea>').attr('style', 'width: 100%; min-height: 50px').attr('id', 'cgt_input');
  }
  waitForElm(eob_row_selector).then(main);
}, false);


