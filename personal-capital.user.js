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


function currency_str_to_float(cstr) {
  return parseFloat(cstr.replace('$', ''));
}


window.addEventListener('load', function() {
  var holdings_text_field_id = 'bbas_holdings';
  var bills_field_class = 'bbas_bills';

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
    if ($('#bills').length == 0 || $(`.${bills_field_class}`).length != 0) {
      return
    }
    var today = new Date();

    var bill_sums = {};
    var bill_sums_total = 0;

    $('.pc-datagrid__row').each(
      function() {
        date = new Date($($(this).find('td')[0]).text());
        balance = currency_str_to_float($($(this).find('td')[3]).text());

        month = date.getMonth();
        month_last_day = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        if (!(month_last_day in bill_sums)) {
          bill_sums[month_last_day] = 0;
        }

        if (date >= today || date <= month_last_day) {
          if (date >= today && date <= month_last_day) {
            bill_sums[month_last_day] += balance;
          }
          bill_sums_total += balance;
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

    function make_bill_row(date_val, bill_sum) {
          // var text_field = $(`#${bills_field_id}`);
          // $('<div>').attr('id', bills_field_id).insertBefore('#billsTable');
          var new_row = $('<tr>').attr('class', bills_field_class).insertBefore($($('#billsTable').find('tbody').find('tr')[0]));
          $(new_row).append(get_td(`${date_val.toLocaleDateString()}`));
          $(new_row).append(get_td('TOTAL'));
          $(new_row).append(get_td());
          $(new_row).append(get_td(`\$${bill_sum.toFixed(2)}`));
          // $(text_field).text(`\$${bill_sum} by end of month ${month_num}`);
    }
    var bill_sum_keys = Object.keys(bill_sums).sort()

    for (var i in bill_sum_keys) {
      month_end = bill_sum_keys[i]
      make_bill_row(new Date(month_end), bill_sums[month_end])
    }
  }

  waitForElm('.qa-ticker').then(this.setInterval(add_holdings_box, 5000));
  waitForElm('#bills').then(this.setInterval(add_bills_sum, 2000));
}, false);
