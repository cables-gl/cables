
// input ports
var inPort = op.inValueString("Bars Beats Sixteenth");

// change listeners
inPort.onChange = function() {
    var s = inPort.get();
    if(s) {
        try {
            var sArr = s.split(':');
            barsPort.set(sArr[0]);
            beatsPort.set(sArr[1]);
            sixteenthPort.set(Math.floor(sArr[2]));
            sixteenthFloatPort.set(sArr[2]);
        } catch(e) {
            op.log(e);
        }
    }
};

// output ports
var barsPort = op.outValue("Bars");
var beatsPort = op.outValue("Beats");
var sixteenthPort = op.outValue("Sixteenth");
var sixteenthFloatPort = op.outValue("Sixteenth Precise");