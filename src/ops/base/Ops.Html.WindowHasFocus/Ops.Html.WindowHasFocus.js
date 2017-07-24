op.name="WindowHasFocus";

var focused = true;
var outFocussed=op.outValue("has focus");

outFocussed.set(document.hasFocus());

window.onfocus = function() {
    outFocussed.set(true);
};
window.onblur = function() {
    outFocussed.set(false);
};
