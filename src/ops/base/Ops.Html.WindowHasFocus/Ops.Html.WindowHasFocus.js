const outFocussed=op.outBool("has focus");
var focused = true;

outFocussed.set(document.hasFocus());

window.onfocus = function() {
    outFocussed.set(true);
};

window.onblur = function() {
    outFocussed.set(false);
};
