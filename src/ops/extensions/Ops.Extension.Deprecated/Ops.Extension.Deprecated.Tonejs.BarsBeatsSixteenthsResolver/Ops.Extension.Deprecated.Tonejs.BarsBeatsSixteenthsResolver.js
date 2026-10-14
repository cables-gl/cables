// input ports
let inPort = op.inValueString("Bars Beats Sixteenth");

// change listeners
inPort.onChange = function ()
{
    let s = inPort.get();
    if (s)
    {
        try
        {
            let sArr = s.split(":");
            barsPort.set(sArr[0]);
            beatsPort.set(sArr[1]);
            sixteenthPort.set(Math.floor(sArr[2]));
            sixteenthFloatPort.set(sArr[2]);
        }
        catch (e)
        {
            op.log(e);
        }
    }
};

// output ports
var barsPort = op.outNumber("Bars");
var beatsPort = op.outNumber("Beats");
var sixteenthPort = op.outNumber("Sixteenth");
var sixteenthFloatPort = op.outNumber("Sixteenth Precise");
