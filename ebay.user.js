// ==UserScript==
// @name        New script - ebay.com
// @namespace   Violentmonkey Scripts
// @match       https://www.ebay.com/sch/*
// @match       https://www.ebay.com/itm/*
// @grant       none
// @require     https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js
// @version     1.0
// @author      -
// @description 8/19/2023, 11:42:36 PM
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


handled_suffix = ' included'
handled_item_attr = 'bhas-handled'
currency_char = '$'
currency_char_regex = '\\$'
multi_item_cost_text = ' to '

search_page_selector = 'li[id^="item"]'
detail_page_selector = 'div.x-price-primary'

var price_regex = new RegExp(`.*${currency_char_regex}`)


function parsePriceToFloat(text) {
  return parseFloat(text.replace(price_regex, ''));
}


function parseFloatToPrice(num) {
  return `${currency_char}${num.toFixed(2)}`
}


function modPriceIncludeShippingSearch(idx, elem) {
  shipping_elem = $(elem).find('.s-item__logisticsCost');

  if ($(shipping_elem).length == 0) {
    shipping_elem = $(elem).find('span.s-item__freeXDays').find('span');
  }

  price_elems = $(elem).find('.s-item__price');

  $(price_elems).each(
    function(j, price_elem) {
      price_elem_text = $(price_elem).text();
      shipping_elem_text = $(shipping_elem).text();

      shipping_cost = shipping_elem_text.replace('+', '').replace(' shipping', '');

      if ($(price_elem).attr(handled_item_attr) != undefined) {
        return
      }
      else if (shipping_cost.includes('Free')) {
        if ($(shipping_elem).attr(handled_item_attr) == undefined) {
          $(shipping_elem).text(`${shipping_elem_text}${handled_suffix}`);
          $(shipping_elem).attr(handled_item_attr, 1);
        }
      }
      else {
        shipping_cost = parsePriceToFloat(shipping_cost);
        if (price_elem_text.includes(multi_item_cost_text)) {
          [low_cost, high_cost] = price_elem_text.split(multi_item_cost_text);
          low_cost = parsePriceToFloat(low_cost);
          high_cost = parsePriceToFloat(high_cost);

          new_low_cost = parseFloatToPrice(shipping_cost + low_cost);
          new_high_cost = parseFloatToPrice(shipping_cost + high_cost);

          total_cost = `${new_low_cost}${multi_item_cost_text}${new_high_cost}`;
        }
        else {
          item_cost = parsePriceToFloat(price_elem_text);
          total_cost = parseFloatToPrice(shipping_cost + item_cost);
        }
        $(price_elem).text(total_cost);
        $(price_elem).attr(handled_item_attr, 1);
      }
      if ($(shipping_elem).attr(handled_item_attr) == undefined) {
        $(shipping_elem).text(`${parseFloatToPrice(shipping_cost)} shipping${handled_suffix}`);
        $(shipping_elem).attr(handled_item_attr, 1);
      }
    }
  )
}

function modPriceIncludeShippingDetail() {
  multibuy_item_class_bid = 'bhas-added-bid';
  multibuy_item_class_bin = 'bhas-added-bin';

  shipping_elem = $('div.ux-labels-values--shipping').find('span.ux-textspans--BOLD')[0];

  // price_elem = $(elem).find('span.ux-textspans')[0];

  function doPrice(price_elem) {
    if ($(price_elem).length == 0) {
      return
    }

    if ($(price_elem).find('span.ux-textspans[bhas-handled]').length > 0) {
      return
    }

    price_elem = $(price_elem).find('span.ux-textspans')[0];
    price_elem_text = $(price_elem).text();
    shipping_elem_text = $(shipping_elem).text();

    if (price_elem_text.includes('ea')) {
      item_cost_each = parsePriceToFloat(price_elem_text.replace('/ea', ''));
      quantity = parseFloat($('#qtyTextBox').attr('value'));

      if (shipping_elem_text.includes('Free')) {
        shipping_cost = 0;
      }
      else {
        shipping_cost = shipping_elem_text.replace('+', '').replace(' shipping', '');
        shipping_cost = parsePriceToFloat(shipping_cost);
      }
      total_cost = `${parseFloatToPrice(shipping_cost + item_cost_each * quantity)}/${quantity}`;

      old_price_elem = price_elem;
      price_elem = $(old_price_elem).clone();
      $(price_elem).attr(handled_item_attr, 1);
      $(price_elem).insertAfter(old_price_elem);
      $('<br>').insertAfter(old_price_elem);
    }
    else {
      // if ($(`.${handled_item_attr}`).length > 0) {
      //   return
      // }
      if (shipping_elem_text.includes('Free')) {
        $(shipping_elem).text(`${shipping_elem_text}${handled_suffix}`);
        total_cost = price_elem_text;
      }
      else {
        shipping_cost = shipping_elem_text.replace('+', '').replace(' shipping', '');
        shipping_cost = parsePriceToFloat(shipping_cost);
        if (price_elem_text.includes(multi_item_cost_text)) {
          [low_cost, high_cost] = price_elem_text.split(multi_item_cost_text);
          low_cost = parsePriceToFloat(low_cost);
          high_cost = parsePriceToFloat(high_cost);

          new_low_cost = parseFloatToPrice(shipping_cost + low_cost);
          new_high_cost = parseFloatToPrice(shipping_cost + high_cost);

          total_cost = `${new_low_cost}${multi_item_cost_text}${new_high_cost}`;
        }
        else {
          item_cost = parsePriceToFloat(price_elem_text);
          total_cost = parseFloatToPrice(shipping_cost + item_cost);
        }
      }
    }
    $(price_elem).text(total_cost);
    $(price_elem).attr(handled_item_attr, 1);
    if ($(shipping_elem).attr(handled_item_attr) == undefined) {
      shipping_str = `${shipping_elem_text}${handled_suffix}`
      $(shipping_elem).attr(handled_item_attr, 1);
      $(shipping_elem).text(shipping_str);
    }
  }

  doPrice($('.x-bid-price__content'));
  doPrice($('.x-bin-price__content'));
}


window.addEventListener('load', function() {
  function handleSearch() {
    $(search_page_selector).each(modPriceIncludeShippingSearch);
  }

  function handleDetail() {
    modPriceIncludeShippingDetail();
  }

  waitForElm(search_page_selector).then(handleSearch);
  // waitForElm(search_page_selector).then(this.setInterval(handleSearch, 5000));
  waitForElm(detail_page_selector).then(
    function() {
      this.setTimeout(handleDetail, 1000);
      this.setInterval(handleDetail, 3000);
    }
  );
}, false);
