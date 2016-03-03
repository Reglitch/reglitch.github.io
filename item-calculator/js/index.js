"use strict";

// Get DOM elements

var itemFormElement = {
  startItemLevel: $('#itemlevel'),
  startPrimaryStat: $('#primary'),
  startSecondaryStat: $('#secondary'),
  endItemLevel: $('#itemlevelEnd'),
  endPrimaryStat: $('#primaryEnd'),
  endSecondaryStat: $('#secondaryEnd'),
  primaryChange: $('#primaryChange'),
  secondaryChange: $('#secondaryChange')
};

var scalingData = undefined;

// Get scaling data
var dataPromise = new Promise(function (resolve, reject) {
  $.get("https://www.googledrive.com/host/0B9NyITetfDW6MnJJRkJMRDg1dmc", function (data) {
    resolve(data);
  });
});

dataPromise.then(function (data) {
  scalingData = data;
  init(data);
});

// Initialize item level values
var init = function init(data) {
  itemFormElement.startItemLevel.find('option').remove();
  itemFormElement.endItemLevel.find('option').remove();
  Object.keys(data).forEach(function (key) {
    // Load in item levels
    itemFormElement.startItemLevel.append('<option value="' + key + '">' + key + '</option>');
    itemFormElement.endItemLevel.append('<option value="' + key + '">' + key + '</option>');
  });
};

// Detect changes in items
Object.keys(itemFormElement).forEach(function (key) {
  itemFormElement[key].change(function () {
    calculate();
  });
});

$('.calculate').on('click', function (e) {
  calculate();
});

// Calculation function
var calculate = function calculate() {
  var figures = {};
  Object.keys(itemFormElement).forEach(function (key) {
    if (Array.isArray(itemFormElement[key].val())) {
      figures[key] = itemFormElement[key].val()[0];
    } else {
      figures[key] = itemFormElement[key].val();
    }
  });

  // Check if both item levels have been selected
  if (figures.startItemLevel && figures.endItemLevel) {
    var primary = calculatePrimary(figures.startItemLevel, figures.endItemLevel, figures.startPrimaryStat);
    var secondary = calculateSecondary(figures.startItemLevel, figures.endItemLevel, figures.startSecondaryStat);
    itemFormElement.endPrimaryStat.val(Math.round(primary));
    itemFormElement.endSecondaryStat.val(Math.round(secondary));

    itemFormElement.primaryChange.val(((primary / figures.startPrimaryStat - 1) * 100).toFixed(2) + '%');
    itemFormElement.secondaryChange.val(((secondary / figures.startSecondaryStat - 1) * 100).toFixed(2) + '%');
  };
};

// Regular calculation for primary
var calculatePrimary = function calculatePrimary(initial, target, primary) {
  if (target > initial) {
    var difference = target - initial;
    return primary * Math.pow(1.01, difference);
  } else {
    var difference = initial - target;
    return primary / Math.pow(1.01, difference);
  }
};

// Recursive calculation for secondary
var calculateSecondary = function calculateSecondary(current, target, secondary) {
  if (target == current) {
    return secondary;
  }

  // Recurse until we arrive at our value
  if (current / 1 <= target / 1) {
    current++;
    if (current <= target) {
      var scalar = scalingData[current] ? scalingData[current] : scalingData[current - 1];
      secondary = secondary * (1 + scalingData[current] / 100);
      if (current !== target) {
        return calculateSecondary(current, target, secondary);
      }
    }
  } else if (current / 1 >= target / 1) {
    current--;
    if (current >= target) {
      var scalar = scalingData[current + 1] ? scalingData[current + 1] : scalingData[current];
      secondary = secondary / (1 + scalar / 100);
      if (current !== target) {
        return calculateSecondary(current, target, secondary);
      }
    }
  };
};