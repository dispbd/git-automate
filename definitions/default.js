Array.prototype.unique = function(property) {
  var self = this;
  var result = [];
  var sublength = 0;

  for (var i = 0, length = self.length; i < length; i++) {
    var value = self[i];

    if (!property) {
      result.indexOf(value) === -1 && result.push(value);
      continue;
    }

    if (sublength === 0) {
      result.push(value);
      sublength++;
      continue;
    }

    var is = true;
    for (var j = 0; j < sublength; j++) {
      if (result[j][property] === value[property]) {
        is = false;
        break;
      }
    }

    if (is) {
      result.push(value);
      sublength++;
    }
  }

  return result;
};