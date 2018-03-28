var DEFAULT_VALUE = 0;

// inputs
var value1Port = op.inValue('Value 1', DEFAULT_VALUE);
var value2Port = op.inValue('Value 2', DEFAULT_VALUE);

// outputs
var resultPort = op.outValue("Maximum", DEFAULT_VALUE);

// listeners
value1Port.onChange = update;
value2Port.onChange = update;

function update() {
    var max = Math.max(value1Port.get(), value2Port.get());
    if(max == max) { // test for infinity and NaN
        resultPort.set(max);
    }   
}
