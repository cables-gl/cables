const
    NUM_PORTS = 10,
    indexPort = op.inInt('Index'),
    valuePort = op.inBool('Boolean in',true),
    defaultBoolPort = op.inBool('Default boolean', false),
    valuePorts = createOutPorts();

indexPort.onChange = valuePort.onChange = defaultBoolPort.onChange = update;

setDefaultValues();
update();

function createOutPorts()
{
    var arr = [];
    for(var i=0; i<NUM_PORTS; i++)
    {
        var port = op.outBool('Index ' + i + ' boolean');
        arr.push(port);
    }
    return arr;
};

function setDefaultValues()
{

    var defaultValue = defaultBoolPort.get();
    valuePorts.forEach(port => port.set(defaultValue));
};

function update()
{
    setDefaultValues();
    var index = indexPort.get();
    var value = valuePort.get();
    index = Math.round(index);
    index = clamp(index, 0, NUM_PORTS-1);
    valuePorts[index].set(value);
};

function clamp(value, min, max)
{
  return Math.min(Math.max(value, min), max);
};
