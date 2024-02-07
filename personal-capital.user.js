// ==UserScript==
// @name        Personal Capital helper
// @namespace   Violentmonkey Scripts
// @match       https://home.personalcapital.com/page/login/app#/portfolio/holdings
// @match       https://home.personalcapital.com/page/login/app#/bills
// @grant       none
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

holdings = {
  'Cash': '',
  'MPHQX': '',
  'VBTIX': '',
  'VIEIX': '',
  'VINIX': '',
  'VITSX': '',
  'VPMAX': '',
  'VTSNX': '',
  'AGG': '',
  'AVDV': '',
  'AVUV': '',
  'BB': '',
  'BND': '',
  'BNDX': '',
  'BSV': '',
  'HYD': '',
  'IEMG': '',
  'MUB': '',
  'NOK': '',
  'SCHB': '',
  'SCHD': '',
  'SCHF': '',
  'SFY': '',
  'SFYX': '',
  'TFI': '',
  'TFLO': '',
  'TMF': '',
  'UPRO': '',
  'USFR': '',
  'VB': '',
  'VDE': '',
  'VEA': '',
  'VIG': '',
  'VSS': '',
  'VTEB': '',
  'VTI': '',
  'VTIP': '',
  'VWO': '',
  'VXUS': '',
  '$USD1': '',
}

mappings = {
  'SFYWQ': 'SFY',
}

function month_from_date(date) {
  return date.substring(0, date.indexOf('/'));
}

function currency_str_to_float(cstr) {
  return parseFloat(cstr.replace('$', ''));
}


window.addEventListener('load', function() {
  var holdings_text_field_id = 'bbas_holdings';
  var bills_field_id = 'bbas_bills';

  function add_holdings_box() {
    if ($('.qa-ticker').length == 0) {
      return
    }
    for (var k in holdings) {
      holdings[k] = '';
    }
    $('.table__row.qa-datagrid-row').each(
      function() {
        ticker = $(this).find('.qa-ticker').text();
        if (ticker.length == 0)
          ticker = $(this).find('.qa-ticker').attr('title');

        if (ticker in mappings)
          ticker = mappings[ticker];

        if (!(ticker in holdings))
          console.log(`${ticker} not found in predefined holdings`);

        shares = $(this).find('.qa-holding-shares').text();
        // holdings.push(`${ticker}\t${shares}`);
        holdings[ticker] = shares;
        // console.log(`${ticker} ${shares}`);
      }
    )
    var text_field = $(`#${holdings_text_field_id}`);
    if ($(text_field).length == 0) {
      $('<textarea>').attr('id', holdings_text_field_id).insertBefore('.gridFrame');
    }

    console.log(holdings);
    $(text_field).text(Object.values(holdings).join('\n'));

  }

  function add_bills_sum() {
    if ($('#bills').length == 0 || $(`#${bills_field_id}`).length != 0) {
      return
    }
    var bill_sum = 0;
    var month_num = '';

    $('.pc-datagrid__row').each(
      function() {
        date = $($(this).find('td')[0]).text()
        balance = currency_str_to_float($($(this).find('td')[3]).text());

        if (month_num.length == 0) {
          month_num = month_from_date(date);
        }

        if (month_from_date(date) == month_num) {
          bill_sum += balance;
        }
      }
    )

    function get_td(content = null) {
      var elem = $('<td>').attr('class', 'pc-datagrid__cell pc-datagrid__cell--top');
      if (content !== null) {
        elem.append($('<div>').text(content));
      }
      return elem
    }

    // var text_field = $(`#${bills_field_id}`);
    // $('<div>').attr('id', bills_field_id).insertBefore('#billsTable');
    var new_row = $('<tr>').attr('id', bills_field_id).insertBefore($($('#billsTable').find('tbody').find('tr')[0]));
    $(new_row).append(get_td(`End M ${month_num}`));
    $(new_row).append(get_td('TOTAL'));
    $(new_row).append(get_td());
    $(new_row).append(get_td(`\$${bill_sum}`));
    // $(text_field).text(`\$${bill_sum} by end of month ${month_num}`);
  }

  waitForElm('.qa-ticker').then(this.setInterval(add_holdings_box, 5000));
  waitForElm('#bills').then(this.setInterval(add_bills_sum, 2000));
}, false);
