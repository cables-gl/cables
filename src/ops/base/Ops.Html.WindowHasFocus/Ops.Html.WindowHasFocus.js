const
    outFocussed = op.outBoolNum("has focus"),
    outVisible = op.outBoolNum("Tab Visible", true);

const focused = true;

outFocussed.set(op.patch.getDocument().hasFocus());

window.addEventListener("blur", handleBlur);
window.addEventListener("focus", handleFocus);

op.patch.getDocument().addEventListener("visibilitychange", updateVisibility);

op.onDelete = function ()
{
    op.patch.getDocument().removeEventListener("visibilitychange", updateVisibility);
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
    outVisible.set(!op.patch.getDocument().hidden);
}
