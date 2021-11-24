// ==UserScript==
// @name        gap
// @namespace   blackholeantsavannah
// @include     https://secure-*.gap.com/profile/order_status_detail.do*
// @require     https://code.jquery.com/jquery-2.2.4.min.js
// @version     1
// @grant       none
// ==/UserScript==

var values = '';
$('[id^=lineItemSummary]').each(function() {
    var name = $(this).find('.productName > a').text().replace(/^[\s]*[\s]*$/g, '');
    var color = $(this).find('[id^=productColor]').text().replace(/^[\s]*[\s]*$/g, '');
    var size = $(this).find('[id^=productSize]').text().replace(/[\s]/g, '');
    var orig_price = $($(this).find('.productDetailValue')[2]).find('strike').text().replace(/[\s$]/g, '');
    if (orig_price.length == 0) {
        orig_price = $($(this).find('.productDetailValue')[2]).text().replace(/[\s$]/g, '');
        // orig_price = $(this).find('.salePrice').text().replace(/[\s$]/g, '');
    }
    var price = $(this).find('.subTotal').text().replace(/[\s$]/g, '');
    var number = $(this).find('.sku').text().replace(/[#\s]/g, '');
    s = name + '\t' + color + '\t' + size + '\t' + orig_price + '\t' + price + '\t' + number + '\n';
    //console.log(s);
    values += s;
})

$('.shipmentHeader1').append(
    $('<textarea>').val(values).attr('style', 'width: 100%;')
)
