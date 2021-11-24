// ==UserScript==
// @name        taxslayer
// @namespace   blackholeantsavannah
// @match       https://www.taxslayer.com/\d+/avalon/Income/CapGains*
// @grant       none
// @version     1.0
// @author      -
// @description 5/1/2021, 8:12:23 AM
// ==/UserScript==

localStorage_key = "taxslayer_csv_helper_input"

// based on https://stackoverflow.com/a/45728850
const reverseIDMapping = (obj) => {
  const reversed = {};
  Object.keys(obj).forEach(
    (key) => {
      try {
        var val_id = obj[key].get(0).id;
      }
      catch {
        var val_id = "null";
      }
      reversed[val_id] = reversed[val_id] || [];
      reversed[val_id].push(key);
    }
  )
  return reversed;
};

// written in order xls
var datatype_to_id_mappings = {
  "Description of Property": $("#Descrip"),
  "Date Acquired": $('#AltDtAcquiredOpt'),
  "Date Acquired Month": $('#DtAcquired_M'),
  "Date Acquired Day": $('#DtAcquired_D'),
  "Date Acquired Year": $('#DtAcquired_Y'),
  "Date Sold": null,
  "Date Sold Month": $('#DtSold_M'),
  "Date Sold Day": $('#DtSold_D'),
  "Date Sold Year": $('#DtSold_Y'),
  "Sales price": $('#Price'),
  "Amount of Adjustment": $('#AdjustmentGainLoss'),
  "Cost": $('#Cost'),
  "Holding Period": null,
  "Holding Period Exact": $('#AltDtAcquired'),
  "Noncovered Security": $('#DType'),
  "Basis Reported": $('#DType'),
}

var input_to_datatype_index_mappings = {
  "Description of Property": 0,
  "Date Acquired": 1,
  "Date Acquired Month": 9,
  "Date Acquired Day": 10,
  "Date Acquired Year": 11,
  "Date Sold": 2,
  "Date Sold Month": 12,
  "Date Sold Day": 13,
  "Date Sold Year": 14,
  "Sales price": 3,
  "Amount of Adjustment": 6,
  "Cost": 4,
  "Holding Period": 8,
  "Holding Period Exact": 15,
  "Noncovered Security": 16,
  "Basis Reported": 17,
}


var shared_fields = reverseIDMapping(datatype_to_id_mappings);
console.log(shared_fields);


var parse_input = function(input, dict){
  dict.input = input;
}

var invalid_data_div = $('<div></div>')
.attr(
  'style', 'color: red'
)

var validate_data = function(entry) {
  for (var field in shared_fields) {
    var field_has_data = false;

    if (field == "null") {
      continue;
    }
    for (var i in shared_fields[field]) {
      var datatype = shared_fields[field][i];
      if (entry[input_to_datatype_index_mappings[datatype]] != null) {
        if (field_has_data) {
          $(invalid_data_div).text(
            "Data conflict among " + shared_fields[field] + ". Only one entry may be non-empty."
          );
          $('#content-header').prepend(invalid_data_div);
          return false;
        }
        else {
          field_has_data = true;
        }
      }
    }
  }
  $(invalid_data_div).remove()
  return true;
}


function fill_one(arr) {
  if (!validate_data(arr)) {
    return false;
  }

  for (const [datatype, page_id] of Object.entries(datatype_to_id_mappings)) {
    if (page_id != null) {
      var res = arr[input_to_datatype_index_mappings[datatype]]

      try {
        res = res.replace(/ +/g, " ");
      }
      catch(err){
        ;
      }

      if (page_id.attr("maxlength") != null) {
        res = res.substring(0, page_id.attr("maxlength"));
      }

      var date_acquired_box_id = datatype_to_id_mappings["Holding Period Exact"];

      if (res == "Various") {
        var box_label = "Holding Period Exact";

        if (date_acquired_box_id.parent().attr("style") != "display: block;") {
          page_id.click();
        }

        var set_acquired_special_function = function(){
          date_acquired_box_id.find(sel).prop('selected', true);
        };
        var sel = "option:contains(" + arr[input_to_datatype_index_mappings[box_label]] + ")";
        date_acquired_box_id.find(sel).ready(set_acquired_special_function);
      }
      else if (page_id.get(0).tagName == "SELECT") {
        console.log(page_id, arr[input_to_datatype_index_mappings[datatype]])

        var sel = "option:contains(" + arr[input_to_datatype_index_mappings[datatype]] + ")";
        page_id.find(sel).prop('selected', true);
      }
      else if (res != null) {
        page_id.val(res);
      }
    }
  }

  // $('#DType').find('option:contains(1099-B, Box 12 Cost Basis Reported to the IRS)').prop('selected', true);
}

function fill_all(arrs) {
  console.log(arrs);
  function fill_with_delay(i, delay) {
    if (i < arrs.length) {
      console.log(i);
      setTimeout(
        function() {
          console.log(arrs[i].split("\t"));
          fill_one(arrs[i].split("\t"));
          console.log(arrs.slice(i+1, ));
          localStorage.setItem(localStorage_key, JSON.stringify(arrs.slice(i+1, arrs.length)));

          setTimeout(
            function(){
              if (i < arrs.length - 1) {
                $('#SaveAndAddAnother').click();
              }
              else {
                $('#btnSubmit').click();
              }
              fill_with_delay(i + 1, delay);
            },
            1000
          )
        },
        delay
      );
    }
    else {
      localStorage.removeItem(localStorage_key);
    }
  }
  fill_with_delay(0, 500);
}

$(document).ready(function(){
  var input_node = $('<textarea>').attr('style', 'width: 100%; min-height: 50px').attr('id', 'cgt_input');
  var fill_one_button = $('<button>Fill One</button>');
  var fill_all_button = $('<button>Fill All</button>');

  $('#content-header').prepend(fill_all_button);
  $('#content-header').prepend(fill_one_button);
  $('#content-header').prepend(input_node);

  var arr = localStorage.getItem(localStorage_key);
  if (arr !== null) {
    console.log(arr);
    fill_all(JSON.parse(arr));
  }

  $(fill_one_button).bind("click", function(){fill_one($(input_node).val().trim().split("\t"));});
  $(fill_all_button).bind("click", function(){fill_all($(input_node).val().trim().split("\n"));});

});
