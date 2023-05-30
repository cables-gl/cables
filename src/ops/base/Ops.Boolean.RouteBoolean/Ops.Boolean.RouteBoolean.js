const
    NUM_PORTS = 10,
    indexPort = op.inInt("Index"),
    valuePort = op.inBool("Boolean in", true),
    defaultBoolPort = op.inBool("Default boolean", false),
    valuePorts = createOutPorts();

indexPort.onChange = valuePort.onChange = defaultBoolPort.onChange = update;

setDefaultValues();
update();

function createOutPorts()
{
    let arr = [];
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.outBoolNum("Index " + i + " boolean");
        arr.push(port);
    }
    return arr;
}

function setDefaultValues()
{
    let defaultValue = defaultBoolPort.get();
    valuePorts.forEach((port) => { return port.set(defaultValue); });
}

function update()
{
    setDefaultValues();
    let index = indexPort.get();
    let value = valuePort.get();
    index = Math.round(index);
    index = CABLES.clamp(index, 0, NUM_PORTS - 1);
    valuePorts[index].set(value);
}
