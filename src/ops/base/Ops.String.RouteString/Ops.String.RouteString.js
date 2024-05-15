const
    NUM_PORTS = 10,
    indexPort = op.inInt("Index"),
    valuePort = op.inString("String in", "cables"),
    defaultStringPort = op.inString("Default string", ""),
    valuePorts = createOutPorts();

indexPort.onChange = valuePort.onChange = defaultStringPort.onChange = update;

setDefaultValues();
update();

function createOutPorts()
{
    let arr = [];
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.outString("Index " + i + " string");
        arr.push(port);
    }
    return arr;
}

function setDefaultValues()
{
    let defaultValue = defaultStringPort.get();
    if (!defaultStringPort.get())
    {
        defaultValue = "";
    }
    valuePorts.forEach((port) => { return port.set(defaultValue); });
}

function update()
{
    setDefaultValues();
    let index = indexPort.get();
    let value = valuePort.get();
    index = Math.round(index);
    index = clamp(index, 0, NUM_PORTS - 1);
    valuePorts[index].set(value);
}

function clamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}
