// constants
var NUM_PORTS = 10;
var DEFAULT_STRING_DEFAULT = "";

// input
var indexPort = op.inInt('index');
var valuePort = op.inString('string in',"cables");
var defaultStringPort = op.inString('default string', "");

// output
var valuePorts = createOutPorts();

// change listeners
indexPort.onChange = valuePort.onChange = defaultStringPort.onChange = update;
//defaultStringPort.onChange = setDefaultValues;

setDefaultValues();
update();
// functions

function createOutPorts()
{
    var arr = [];
    for(var i=0; i<NUM_PORTS; i++)
    {
        var port = op.outString('Index ' + i + ' string');
        arr.push(port);
    }
    return arr;
};

function setDefaultValues()
{

    var defaultValue = defaultStringPort.get();
    // if(indexPort.get())
    // {
        valuePorts.forEach(port => port.set(defaultValue));
    //}

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
