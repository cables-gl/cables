const arrayIn = op.inArray('Array to sort');
const propIn = op.inString('Sort property');
const sortMode = op.inSwitch('Sorting mode', ['Sort ascending', 'Sort descending'], 'Sort ascending');
const arrayOut = op.outArray('Sorted array');

let arrOut = [];

arrayIn.onChange = sortMode.onChange = update;
update();

function update() {
  const path = propIn.get();

  if (!arrayIn.get() || !path) {
    arrayOut.set(null);
    return;
  }

  arrOut = arrayIn.get();

  if (sortMode.get() === 'Sort ascending') {
    arrOut.sort(function(a, b) {
      const properties = Array.isArray(path) ? path : path.split('.');
      const propA = properties.reduce((prev, curr) => prev && prev[curr], a);
      const propB = properties.reduce((prev, curr) => prev && prev[curr], b);
      return propA - propB;
    });
  } else {
    arrOut.sort(function(a, b) {
      const properties = Array.isArray(path) ? path : path.split('.');
      const propA = properties.reduce((prev, curr) => prev && prev[curr], a);
      const propB = properties.reduce((prev, curr) => prev && prev[curr], b);
      return propB - propA;
    });
  }

  arrayOut.set(null);
  arrayOut.set(arrOut);
}
