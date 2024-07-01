op.name = "SplitString";

let inString = op.inValue("Input String");
let separator = op.inValueString("Separator", ",");
// var messageType = op.inValueSelect("Message Type", ["String", "Number", "Boolean"], "String");

let N_OUT_PORTS = 8;

let outPorts = [];

for (let i = 0; i < N_OUT_PORTS; i++)
{
    outPorts[i] = op.outValue("Part " + (i + 1));
}

inString.onChange = function ()
{
    let s = inString.get();
    if (s)
    {
        let arr = s.split(separator.get());

        for (let i = 0; i < arr.length; i++)
        {
            outPorts[i].set(arr[i]);
        }

        for (let j = arr.length; j < N_OUT_PORTS; j++)
        {
            outPorts[j].set(0);
        }
    }
};
