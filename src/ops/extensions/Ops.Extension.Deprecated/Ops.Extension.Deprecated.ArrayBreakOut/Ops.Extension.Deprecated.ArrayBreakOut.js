// constants
let NUM_PORTS = 12;
let DEFAULT_VALUE_DEFAULT = 0;

// inputs
let inArrayPort = op.inArray("In Array");
let defaultValuePort = op.inValue("Default Value", DEFAULT_VALUE_DEFAULT);

// outputs
let valueOutPorts = createValuePorts();
let restArrayPort = op.outArray("Rest Array");

// change listeners
inArrayPort.onChange = update;
defaultValuePort.onChange = update;

// functions

function update()
{
    let arr = inArrayPort.get();
    if (!arr)
    {
        // resetOutPorts();
        return;
    }
    for (var i = 0; i < Math.min(arr.length, NUM_PORTS); i++)
    {
        valueOutPorts[i].set(arr[i]);
    }
    // set the remaining ports to the default value
    let defaultValue = defaultValuePort.get();
    for (var i = arr.length; i < NUM_PORTS; i++)
    {
        valueOutPorts[i].set(defaultValue);
    }
    restArrayPort.set(arr.slice(NUM_PORTS));
}

/**
  * Sets the ports to their default value, when there is no input array
  */
function resetOutPorts()
{
    let defaultValue = defaultValuePort.get();
    for (let i = 0; i < NUM_PORTS; i++)
    {
        valueOutPorts[i].set(defaultValue);
        restArrayPort.set([]);
    }
}

/**
  * Creates the out ports
  */
function createValuePorts()
{
    let arr = [];
    for (let i = 0; i < NUM_PORTS; i++)
    {
        arr[i] = op.outValue("Value " + i);
    }
    return arr;
}
