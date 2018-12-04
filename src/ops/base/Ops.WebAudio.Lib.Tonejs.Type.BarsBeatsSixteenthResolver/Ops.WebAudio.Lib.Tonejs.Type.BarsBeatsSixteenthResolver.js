
// inputs
var bbsPort = op.inValueString("Bars:Beats:Sixteenth");

// outputs
var barsPort = op.outValue("Bars", 0);
var beatsPort = op.outValue("Beats", 0);
var sixteenthPort = op.outValue("Sixteenth", 0);
var sixteenthPrecisePort = op.outValue("Sixteenth (Precise)", 0);

bbsPort.onChange = function() {
    var bbs = bbsPort.get();
    if(bbs) {
        var parts = bbs.split(":");
        if(parts.length === 3) {
            try {
                barsPort.set(parseFloat(parts[0]));
                beatsPort.set(parseFloat(parts[1]));
                sixteenthPrecisePort.set(parseFloat(parts[2]));
                sixteenthPort.set(Math.floor(parseFloat(parts[2])));    
            } catch(e) {}
        }
    }
};