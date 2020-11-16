const
    outFocussed = op.outBool("has focus"),
    outVisible = op.outBool("Tab Visible", true);

const focused = true;

outFocussed.set(document.hasFocus());

window.addEventListener("blur", handleBlur);
window.addEventListener("focus", handleFocus);

document.addEventListener("visibilitychange", updateVisibility);

op.onDelete = function ()
{
    document.removeEventListener("visibilitychange", updateVisibility);
};

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
    outVisible.set(!document.hidden);
}
