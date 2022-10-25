let DEFAULT_VALUE = 0;
// inputs
const value1Port = op.inValue("Value 1", DEFAULT_VALUE);
const value2Port = op.inValue("Value 2", DEFAULT_VALUE);

// outputs
const resultPort = op.outValue("Maximum", DEFAULT_VALUE);

// listeners
value1Port.onChange = update;
value2Port.onChange = update;

function update()
{
    let max = Math.max(value1Port.get(), value2Port.get());
    if (max == max)
    { // test for infinity and NaN
        resultPort.set(max);
    }
}
