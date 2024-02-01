const
    inFocus = op.inTriggerButton("Focus"),
    hasFocus = op.outBoolNum("has focus");

op.onDelete = removeListeners;
addListeners();

inFocus.onTriggered = () =>
{
    op.patch.cgl.canvas.focus();
};

function onFocus()
{
    hasFocus.set(true);
}

function onBlur()
{
    hasFocus.set(false);
}

function addListeners()
{
    op.patch.cgl.canvas.addEventListener("focus", onFocus);
    op.patch.cgl.canvas.addEventListener("blur", onBlur);
}

function removeListeners()
{
    op.patch.cgl.canvas.removeEventListener("focus", onFocus);
    op.patch.cgl.canvas.removeEventListener("blur", onBlur);
}
