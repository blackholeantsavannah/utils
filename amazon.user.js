// ==UserScript==
// @name        amazon
// @version     1.0.0
// @namespace   blackholeantsavannah
// @author      blackholeantsavannah
// @description Adds full offer links
// @updateURL   https://github.com/blackholeantsavannah/utils/raw/main/amazon.user.js
// @downloadURL https://github.com/blackholeantsavannah/utils/raw/main/amazon.user.js
// @include     *.amazon.com/*
// @require     https://code.jquery.com/jquery-2.2.4.min.js
// @grant       none
// ==/UserScript==

//fixed properties
var offer_listing_prefix = "https://www.amazon.com/gp/offer-listing/";
var ccc_prefix = "https://www.camelcamelcamel.com/product/";
var fakespot_prefix = "https://www.fakespot.com/product/";

var item_pat = /dp\/(.*?)\/?$/;
var item_pat2 = /gp\/product\/(.*?)[\/\?]/;
var name_process_pat = /[^\w\d]+/;


// style properties
var parent_node = $('#desktop_unifiedPrice');
var parent_node2 = $('#price > :nth-child(1)');

// main
var url = $(document).attr('URL');
var item_num = url.match(item_pat);
var item_num2 = url.match(item_pat2);

console.log(url);
console.log(item_num);
console.log(item_num2);

if (item_num != null) {
    item_num = item_num[1];
}
else if (item_num2 != null) {
    item_num = item_num2[1];
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
var this_product_links = $('[data-hook=product-link-linked]').filter(
    $('[href*='+item_num+']')
);
if (this_product_links.length > 0) {
    product_name = this_product_links[0].innerText;
}
else {
    // standard use product title
    product_name = $('#productTitle')[0].innerText;
}

// replace nonalphanumeric with dashes
product_name = product_name.replace(/[^\w\d]+/gi, '-');
// trim trailing dashes
product_name = product_name.replace(/^-+|-+$/gm, '');
product_name = product_name.toLowerCase();


var offer_listing_url = offer_listing_prefix + item_num;
var ccc_url = ccc_prefix + item_num;
var fakespot_url = fakespot_prefix + product_name;

var listing_link_node = $(
    '<a/>',
    {
        id: 'offer-listing-link',
        class: 'a-link-normal',
        href: offer_listing_url,
        html: 'Show complete offer listing'
    }
)

var ccc_link_node = $(
    '<a/>',
    {
        id: 'ccc-link',
        class: 'a-link-normal',
        href: ccc_url,
        html: 'Show camelcamelcamel page'
    }
)

var fakespot_link_node = $(
    '<a/>',
    {
        id: 'fakespot-link',
        class: 'a-link-normal',
        href: fakespot_url,
        html: 'Show fakespot page'
    }
)

function append(item, parent) {
    $(parent).after($(item))
    return item
}

function append_with_break(item, parent) {
    $(parent).after($(item))
    $(parent).after($('<br>'))
    return item
}

let next = append(listing_link_node, parent_node);
next = append_with_break(ccc_link_node, next);
next = append_with_break(fakespot_link_node, next);
