const
    NUM_PORTS = 10,
    DEFAULT_OBJECT = {},
    indexPort = op.inInt("index"),
    objectPort = op.inObject("Object in"),
    defaultObjectPort = op.inObject("default object", DEFAULT_OBJECT),
    objectPorts = createOutPorts(DEFAULT_OBJECT);

indexPort.onChange = objectPort.onChange = defaultObjectPort.onChange = update;

setDefaultValues();
update();

function createOutPorts()
{
    let arrayObjects = [];
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.outObject("Index " + i + " Object");
        arrayObjects.push(port);
    }
    defaultObjectPort.set(null);
    return arrayObjects;
}

function setDefaultValues()
{
    let defaultValue = defaultObjectPort.get();

    objectPorts.forEach((port) => { return port.set(null); });
    if (defaultObjectPort.get())
    {
        objectPorts.forEach((port) => { return port.set(defaultValue); });
    }
}

function update()
{
    setDefaultValues();
    let index = indexPort.get();
    let value = objectPort.get();

    index = Math.floor(index);
    index = clamp(index, 0, NUM_PORTS - 1);
    objectPorts[index].setRef(value);
}

function clamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}
