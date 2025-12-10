const exe = op.inTriggerButton("Remove");
const inName = op.inValueString("Classname");

exe.onTriggered = function ()
{
    let els = document.getElementsByClassName(inName.get());

    for (let i = 0; i < els.length; i++)
    {
        els[i].classList.remove(inName.get());
    }
};
