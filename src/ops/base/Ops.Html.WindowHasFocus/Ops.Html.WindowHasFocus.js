const outFocussed=op.outBool("has focus");
const outVisible=op.outBool("Tab Visible",true);
var focused = true;

outFocussed.set(document.hasFocus());

window.onfocus = function() {
    outFocussed.set(true);
};

window.onblur = function() {
    outFocussed.set(false);
};

function updateVisibility(e)
{
    console.log(e,document.hidden);
    outVisible.set(!document.hidden);
    // console.log(document.visibilityState);
}

document.addEventListener("visibilitychange", updateVisibility);

op.onDelete=function()
{
    document.removeEventListener("visibilitychange", updateVisibility);
};

