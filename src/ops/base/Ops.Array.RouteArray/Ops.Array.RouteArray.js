
const
    NUM_PORTS = 10,
    DEFAULT_ARRAY_DEFAULT = [],
    indexPort = op.inInt('index'),
    arrayPort = op.inArray('array in'),
    defaultArrayPort = op.inArray('default array', DEFAULT_ARRAY_DEFAULT),
    arrayPorts = createOutPorts(DEFAULT_ARRAY_DEFAULT);

indexPort.onChange = arrayPort.onChange = defaultArrayPort.onChange = update;

setDefaultValues();
update();

function createOutPorts()
{
    var arr = [];
    for(var i=0; i<NUM_PORTS; i++)
    {
        var port = op.outArray('Index ' + i + ' array');
        arr.push(port);
    }
    defaultArrayPort.set(null);
    return arr;
};

function setDefaultValues()
{
    var defaultValue = defaultArrayPort.get();

    arrayPorts.forEach(port => port.set(null));
    if(defaultArrayPort.get())
    {
        arrayPorts.forEach(port => port.set(defaultValue));
    }
};

function update()
{
    setDefaultValues();
    var index = indexPort.get();
    var value = arrayPort.get();

    index = Math.floor(index);
    index = clamp(index, 0, NUM_PORTS-1);
    arrayPorts[index].set(value);
};

function clamp(value, min, max)
{
  return Math.min(Math.max(value, min), max);
};
