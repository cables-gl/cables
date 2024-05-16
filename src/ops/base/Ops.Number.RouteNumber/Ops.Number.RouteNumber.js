// constants and variables
const NUM_PORTS = 10;
const DEFAULT_VALUE_DEFAULT = 0;
let lastIdx = null;

// input
const indexPort = op.inInt("Index", 0);
const valuePort = op.inValue("Value", 1);
const defaultValuePort = op.inValue("Default VaonlyOnePortlue", DEFAULT_VALUE_DEFAULT);
const onlyOnePort = op.inBool("Set inactive to default", false);

// output
const valuePorts = createOutPorts(DEFAULT_VALUE_DEFAULT);

// change listeners
indexPort.onChange = update;
valuePort.onChange = update; // TODO: Maybe only one update needed!?
defaultValuePort.onChange = setDefaultValues;
onlyOnePort.onChange = onlyOnePortChange;

setDefaultValues();

// functions

/**
 * creates the output-port array
 */
function createOutPorts()
{
    let arr = [];
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.outNumber("Index " + i + " Value");
        arr.push(port);
    }
    return arr;
}

/**
 * Sets all value ports to the default value
 */
function setDefaultValues()
{
    const defaultValue = defaultValuePort.get();
    valuePorts.forEach((valuePort) =>
    {
        valuePort.set(defaultValue);
    });
    update();
}

/**
 * Update
 */
function update()
{
    let index = indexPort.get();
    index = Math.round(index);
    index = clamp(index, 0, NUM_PORTS - 1);

    if (onlyOnePort.get() && lastIdx !== null && lastIdx != index)
    {
        valuePorts[lastIdx].set(defaultValuePort.get());
    }

    const value = valuePort.get();
    valuePorts[index].set(value);

    lastIdx = index;
}

/**
 * Returns a number whose value is limited to the given range.
 */
function clamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}

/**
 * Reset all ports to default value and set current index
 * or let have several ports with old value
 */
function onlyOnePortChange()
{
    if (onlyOnePort.get())
    {
        setDefaultValues();
        update();
    }
}
