// ==UserScript==
// @name        BSCScan Utils
// @version     1.0.0
// @author      blackholeantsavannah
// @namespace   blackholeantsavannah
// @description Adds unburnt holder percentage. Includes user labels for contract creator.
// @updateURL   https://github.com/blackholeantsavannah/utils/raw/main/bscscan.user.js
// @downloadURL https://github.com/blackholeantsavannah/utils/raw/main/bscscan.user.js
// @match       https://bscscan.com/token/*
// @match       https://bscscan.com/address/*
// @require     https://code.jquery.com/jquery-3.6.0.min.js
// @grant       none
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);


var mainDocument = document.querySelector('#body');
var total_supply = $('.hash-tag').text();

// (new MutationObserver(check)).observe(document, {childList: true, subtree: true});

// function check(changes, observer) {
//     console.log('main', mainDocument);
//     if(document.querySelector('.page-item')) {
//       console.log('main', mainDocument);
//         observer.disconnect();
//       console.log('main', mainDocument);
//         main();
//     }
// }

function parseAmt(amtStr) {
  return parseFloat(amtStr.replaceAll(",", ""));
}

$(document).ready(function(){
  console.log($(document));
  mainDocument = document.cloneNode(true);
  console.log('ready', mainDocument);
  mainDocument.total_supply = 5
  new_ts = $('.hash-tag').text();
  console.log('tot', new_ts)
  if (new_ts != '') {
    console.log('storing new_ts', new_ts)
    mainDocument.total_supply = new_ts;
    localStorage.setItem('total_supply', new_ts);
  }
  else {
    main();
  }
  console.log('hi')
  var creator = $('a[data-original-title="Creator Address"]');
  var creation_tx_creator = $('span').filter(function(){return $(this).text() == 'Contract Creation'}).parent().prev().prev().text();
  if (creation_tx_creator != '')
    creator.text(creation_tx_creator);
}
)

// function waitForElm(selector) {
//     return new Promise(resolve => {
//         if (document.querySelector(selector)) {
//             return resolve(document.querySelector(selector));
//         }

//         const observer = new MutationObserver(mutations => {
//             if (document.querySelector(selector)) {
//                 resolve(document.querySelector(selector));
//                 observer.disconnect();
//             }
//         });

//         observer.observe(document.body, {
//             childList: true,
//             subtree: true
//         });
//     });
// }

// // waitForElm('.card-body').then((elm) =>
// // {
//     waitForElm('.page-item').then((elm2) =>
//     {
//       console.log('Element is ready');
//       setTimeout(main, 100);
//     });
// });


function main() {
  console.log('CALLED MAIN');
  var pct_col = $('th').filter(function(){return $(this).text().includes('Percentage')});
  var burn_elem = $('a').filter(function(){return $(this).text().includes("Burn Address")}).parent().parent().next();
  var burn_amt = parseAmt(burn_elem.text());
  // var total_supply = parseAmt($($('span[data-original-title="Total Supply"]').parent().next().children()[0]).text());
  // var total_supply = $('.hash-tag');
  // console.log('main', mainDocument);
  // var tot2 = $(mainDocument.getElementsByClassName('hash-tag')[0]);
  // yes it really is this stupid, the actual element is not available for some ungodly reason
  // var tot2 = burn_elem.parent().parent().parent().parent().parent().parent().parent().parent().parent();
  // var tot2 = $('.media-body');
  // console.log(window);
  // console.log($('html'));
  // console.log(tot2);

  console.log('burn', burn_amt, 'tot supply', localStorage.getItem('total_supply'));
  $('tbody').children('tr').each(function(){
    var addr = $(':nth-child(2)', this);
    var amt = $(':nth-child(3)', this).text();
    var percentage = $(':nth-child(4)', this);
    var total_supply = parseAmt(localStorage.getItem('total_supply'));

    var burnt_pct = parseAmt(amt)/(total_supply-burn_amt);
    console.log('amt ts ba', parseAmt(amt), total_supply, burn_amt);

    // burn addr, skip
    if (burnt_pct < 1) {

      var $burn_pct_elem = $("<td>").text(100*burnt_pct.toFixed(5) + '%');
      percentage.append($burn_pct_elem);
    }
      console.log(addr.text(), amt);
  })
}
