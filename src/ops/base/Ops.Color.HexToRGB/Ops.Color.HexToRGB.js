var hex=op.inValueString("Hex");

var asBytes=op.inValueBool("Bytes");

var outR=op.outValue("R");
var outG=op.outValue("G");
var outB=op.outValue("B");


function hexToR(h) {
    return parseInt((cutHex(h)).substring(0,2),16)||0;
}
function hexToG(h) {
    return parseInt((cutHex(h)).substring(2,4),16)||0;
}
function hexToB(h) {
    return parseInt((cutHex(h)).substring(4,6),16)||0;
}
function cutHex(h) {
    return (h.charAt(0)=="#") ? h.substring(1,7):h;
}


hex.onChange=parse;
asBytes.onChange=parse;

function parse()
{
    var str=hex.get();
    var r=hexToR(str);
    var g=hexToG(str);
    var b=hexToB(str);
    

    if(!asBytes.get())
    {
        r/=255;
        g/=255;
        b/=255;
    }
    
    outR.set(r);
    outB.set(b);
    outG.set(g);
}