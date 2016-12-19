op.name="SplitString";

var inString = op.inValue("Input String");
var separator = op.inValueString("Separator", ",");
//var messageType = op.inValueSelect("Message Type", ["String", "Number", "Boolean"], "String");

var N_OUT_PORTS = 8;

var outPorts = [];

for(var i=0; i<N_OUT_PORTS; i++) {
    outPorts[i] = op.outValue("Part " + (i+1))
}

inString.onValueChanged = function()
{
    var s = inString.get();
    if(s) {
        var arr = s.split(separator.get());

        for(var i=0; i<arr.length; i++) {
            outPorts[i].set(arr[i]);
        }

        for(var j=arr.length; j<N_OUT_PORTS; j++) {
            outPorts[j].set(0);
        }
    }
};
