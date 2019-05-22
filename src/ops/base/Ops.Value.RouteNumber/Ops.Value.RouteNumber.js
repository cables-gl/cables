// constants
var NUM_PORTS = 10;
var DEFAULT_VALUE_DEFAULT = 0;

// input
var indexPort = op.inValue('Index');
var valuePort = op.inValue('Value');
var defaultValuePort = op.inValue('Default Value', DEFAULT_VALUE_DEFAULT);

// output
var valuePorts = createOutPorts(DEFAULT_VALUE_DEFAULT);

// change listeners
indexPort.onChange = update;
valuePort.onChange = update; // TODO: Maybe only one update needed!?
defaultValuePort.onChange = setDefaultValues;

setDefaultValues();

// functions

/**
 * creates the output-port array
 */
function createOutPorts() {
    var arr = [];
    for(var i=0; i<NUM_PORTS; i++) {
        var port = op.outValue('Index ' + i + ' Value');
        arr.push(port);
    }
    return arr;
}

/**
 * Sets all value ports to the default value
 */
function setDefaultValues() {
    var defaultValue = defaultValuePort.get();
    valuePorts.forEach(function(valuePort) {
        valuePort.set(defaultValue);
    });
}

/**
 * Update
 */
function update() {
    var index = indexPort.get();
    var value = valuePort.get();
    index = Math.round(index);
    index = clamp(index, 0, NUM_PORTS-1);   
    valuePorts[index].set(value);
}

/**
 * Returns a number whose value is limited to the given range.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
