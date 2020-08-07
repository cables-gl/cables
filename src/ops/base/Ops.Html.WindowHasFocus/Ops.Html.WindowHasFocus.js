const outFocussed = op.outBool("has focus");
const outVisible = op.outBool("Tab Visible", true);
const focused = true;

outFocussed.set(document.hasFocus());


function handleFocus()
{
    outFocussed.set(true);
}

function handleBlur()
{
    outFocussed.set(false);
}

function updateVisibility(e)
{
    console.log(e, document.hidden);
    outVisible.set(!document.hidden);
    // console.log(document.visibilityState);
}

window.addEventListener("blur", handleBlur);
window.addEventListener("focus", handleFocus);

document.addEventListener("visibilitychange", updateVisibility);

op.onDelete = function ()
{
    document.removeEventListener("visibilitychange", updateVisibility);
};
