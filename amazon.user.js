// ==UserScript==
// @name        amazon
// @version     1.0.0
// @namespace   blackholeantsavannah
// @author      blackholeantsavannah
// @description Adds full offer links
// @updateURL   https://github.com/blackholeantsavannah/utils/raw/main/amazon.user.js
// @downloadURL https://github.com/blackholeantsavannah/utils/raw/main/amazon.user.js
// @include     *.amazon.com/*
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @grant       none
// ==/UserScript==

var jq = jQuery.noConflict();

//fixed properties
var offer_listing_prefix = "https://www.amazon.com/gp/offer-listing/";
var ccc_prefix = "https://www.camelcamelcamel.com/product/";
var fakespot_prefix = "https://www.fakespot.com/product/";

var item_pat = /dp\/(.*?)(\/.*)?$/;
var item_pat2 = /gp\/product\/(.*?)[\/\?]/;
var item_pat3 = /dp\/(.*?)\/?/;
var name_process_pat = /[^\w\d]+/;


// style properties
var parent_node = jq('#desktop_unifiedPrice');
var parent_node2 = jq('#price > :nth-child(1)');

// main
function main() {
  var url = jq(document).attr('URL');
  var item_num = url.match(item_pat);
  var item_num2 = url.match(item_pat2);
  var item_num3 = url.match(item_pat3);

  console.log(url);
  console.log(item_num);
  console.log(item_num2);

  if (item_num != null) {
      item_num = item_num[1];
  }
  else if (item_num2 != null) {
      item_num = item_num2[1];
  }
  else if (item_num3 != null) {
    item_num = item_num3[1];
  }
  else {
      console.log('No item number found in URL ' + url);
  }

  if (parent_node == null) {
    parent_node = parent_node2;
  }

  if (parent_node == null) {
    console.log('no parent node found')
  }

  var product_name = '';
  // look for a self link for weird products....
  // var this_product_links = jq('[data-hook=product-link-linked]').filter(
  //     jq('"[href*='+item_num+']"')
  // );
  // if (this_product_links.length > 0) {
  //     product_name = this_product_links[0].innerText;
  // }
  // else
  {
      // standard use product title

    try {
      product_name = jq('#productTitle')[0].innerText;
    }
    catch {
      console.log('cannot find', jq('#productTitle'));
    }
  }

  // replace nonalphanumeric with dashes
  product_name = product_name.replace(/[^\w\d]+/gi, '-');
  // trim trailing dashes
  product_name = product_name.replace(/^-+|-+jq/gm, '');
  product_name = product_name.toLowerCase();


  var offer_listing_url = offer_listing_prefix + item_num;
  var ccc_url = ccc_prefix + item_num;
  var keepa_url = keepa_prefix + item_num;
  var fakespot_url = fakespot_prefix + item_num;

  var listing_link_node = jq(
      '<a/>',
      {
          id: 'offer-listing-link',
          class: 'a-link-normal',
          href: offer_listing_url,
          html: 'Show complete offer listing'
      }
  )

  var ccc_link_node = jq(
      '<a/>',
      {
          id: 'ccc-link',
          class: 'a-link-normal',
          href: ccc_url,
          html: 'Show camelcamelcamel page'
      }
  )

  var fakespot_link_node = jq(
      '<a/>',
      {
          id: 'fakespot-link',
          class: 'a-link-normal',
          href: fakespot_url,
          html: 'Show fakespot page'
      }
  )

  function append(item, parent) {
      jq(parent).after(jq(item))
      return item
  }

  function append_with_break(item, parent) {
      jq(parent).after(jq(item))
      jq(parent).after(jq('<br>'))
      return item
  }

  let next = append(listing_link_node, parent_node);
  next = append_with_break(ccc_link_node, next);
  next = append_with_break(fakespot_link_node, next);

  jq('.image-swatch-button').each(
    function() {
      var price = jq(this).find('.twisterSwatchPrice').text();
      var price_div = jq(
        '<div/>',
        {
          html: price
        }
      );
      append(price_div, jq(this).find('.a-button-text'));
    }
  );
};

setTimeout(main, 2000);
