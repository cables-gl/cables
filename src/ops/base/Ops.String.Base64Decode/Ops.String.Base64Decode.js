

var inString=op.inValueString("String");

var result=op.outValue("Result");


inString.onChange=function()
{
result.set(b64DecodeUnicode(inString.get()));
};


function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
