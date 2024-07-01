// inputs
let bbsPort = op.inValueString("Bars:Beats:Sixteenth");

// outputs
let barsPort = op.outValue("Bars", 0);
let beatsPort = op.outValue("Beats", 0);
let sixteenthPort = op.outValue("Sixteenth", 0);
let sixteenthPrecisePort = op.outValue("Sixteenth (Precise)", 0);

bbsPort.onChange = function ()
{
    let bbs = bbsPort.get();
    if (bbs)
    {
        let parts = bbs.split(":");
        if (parts.length === 3)
        {
            try
            {
                barsPort.set(parseFloat(parts[0]));
                beatsPort.set(parseFloat(parts[1]));
                sixteenthPrecisePort.set(parseFloat(parts[2]));
                sixteenthPort.set(Math.floor(parseFloat(parts[2])));
            }
            catch (e) {}
        }
    }
};
