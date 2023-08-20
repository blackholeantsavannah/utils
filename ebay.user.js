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
  price_elem = $(elem).find('.s-item__price');
  shipping_elem = $(elem).find('.s-item__logisticsCost');

  if ($(shipping_elem).length == 0) {
    shipping_elem = $(elem).find('span.s-item__freeXDays').find('span');
  }

  price_elem_text = $(price_elem).text();
  shipping_elem_text = $(shipping_elem).text();

  shipping_cost = shipping_elem_text.replace('+', '').replace(' shipping', '');

  if (shipping_cost.includes(handled_suffix)) {
    return
  }
  else if (shipping_cost.includes('Free')) {
    $(shipping_elem).text(`${shipping_elem_text}${handled_suffix}`);
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
    $(shipping_elem).text(`${parseFloatToPrice(shipping_cost)} shipping${handled_suffix}`);
  }
}

function modPriceIncludeShippingDetail(idx, elem) {
  multibuy_item_class = 'bhas-added';

  price_elem = $(elem).find('span.ux-textspans')[0];
  shipping_elem = $('div.ux-labels-values--shipping').find('span.ux-textspans--BOLD');

  price_elem_text = $(price_elem).text();
  shipping_elem_text = $(shipping_elem).text();

  shipping_cost = shipping_elem_text.replace('+', '').replace(' shipping', '');

  if (shipping_cost.includes(handled_suffix) && !price_elem_text.includes('ea')) {
    return
  }
  else if (shipping_cost.includes('Free')) {
    $(shipping_elem).text(`${shipping_elem_text}${handled_suffix}`);
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
    else if (price_elem_text.includes('ea')) {
      if ($(`.${multibuy_item_class}`).length > 0) {
        return
      }
      item_cost_each = parsePriceToFloat(price_elem_text.replace('/ea', ''));
      quantity = parseFloat($('#qtyTextBox').attr('value'));

      total_cost = `${parseFloatToPrice(shipping_cost + item_cost_each * quantity)}/${quantity}`;

      old_price_elem = price_elem;
      price_elem = $(old_price_elem).clone();
      $(price_elem).addClass(multibuy_item_class);
      $(price_elem).insertAfter(old_price_elem);
      $('<br>').insertAfter(old_price_elem);
    }
    else {
      item_cost = parsePriceToFloat(price_elem_text);
      total_cost = parseFloatToPrice(shipping_cost + item_cost);
    }
    $(price_elem).text(total_cost);
    $(shipping_elem).text(`${parseFloatToPrice(shipping_cost)} shipping${handled_suffix}`);
  }
}


window.addEventListener('load', function() {
  function handleSearch() {
    $(search_page_selector).each(modPriceIncludeShippingSearch);
  }

  function handleDetail() {
    $(detail_page_selector).each(modPriceIncludeShippingDetail);
  }

  waitForElm(search_page_selector).then(this.setInterval(handleSearch, 2000));
  waitForElm(detail_page_selector).then(this.setInterval(handleDetail, 2000));
}, false);
