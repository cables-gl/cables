const
    inEle = op.inObject("HTML Element"),
    inVisible = op.inValueBool("Visible", true),
    inDuration = op.inValue("Duration", 0.25),
    inOpacity = op.inValue("Opacity", 1),
    outEle = op.outObject("PassThrough", null, "element"),
    outShowing = op.outBoolNum("Is Showing", false);

const anim = new CABLES.Anim();

let oldEle = null;
let loaded = true;
const oldvis = null;
loaded = true;
const startTime = CABLES.now();

inDuration.onChange =
    inOpacity.onChange = setAnim();

inVisible.onChange =
    () =>
    {

    };

inEle.onChange = () =>
{
    if (inEle.get() != outEle.get())updateVisibility();
    outEle.setRef(inEle.get());
};

op.onLoaded = function ()
{
    loaded = true;
    updateVisibility();
    outShowing.set(inVisible.get());
};

outEle.onLinkChanged =
inEle.onLinkChanged = () =>
{
    updateVisibility();
};

function updateVisibility()
{
    const ele = inEle.get();

    if (!loaded)
    {
        setTimeout(updateVisibility, 50);
        return;
    }

    if (ele)
    {
        if (inVisible.get())
        {
            ele.style.opacity = 1;
            ele.style.display = "block";

            // outShowing.set(true);
            // if (ele && ele.classList && !ele.classList.contains(animFadeInClass) && !ele.classList.contains(animFadedInClass))
            // {
            //     clearTimeout(theTimeout);
            //     ele.classList.remove(animFadedOutClass);
            //     ele.classList.remove(animFadedInClass);
            //     ele.classList.remove(animFadeOutClass);
            //     ele.classList.add(animFadeInClass);

            //     theTimeout = setTimeout(function ()
            //     {
            //         ele.classList.remove(animFadeInClass);
            //         ele.classList.add(animFadedInClass);
            //         ele.classList.remove(animFadedOutClass);
            //         ele.classList.remove(animFadeOutClass);

            //         outEle.setRef(inEle.get());
            outShowing.set(true);
            //     }, inDuration.get() * 1000);
            // }
        }
        else
        {
            ele.style.opacity = 0;
            ele.style.display = "none";

            // outShowing.set(true);
            // if (ele && ele.classList && !ele.classList.contains(animFadeOutClass) && !ele.classList.contains(animFadedOutClass))
            // {
            //     clearTimeout(theTimeout);
            //     ele.classList.remove(animFadedInClass);
            //     ele.classList.remove(animFadeInClass);
            //     ele.classList.add(animFadeOutClass);
            //     theTimeout = setTimeout(function ()
            //     {
            //         ele.classList.add(animFadedOutClass);
            //         ele.classList.remove(animFadedInClass);
            //         ele.classList.remove(animFadeInClass);
            //         ele.classList.remove(animFadeOutClass);
            //         outEle.setRef(inEle.get());
            outShowing.set(false);
            //     }, inDuration.get() * 1000);
            // }
        }
    }

    outEle.setRef(inEle.get());
}

function setAnim()
{
    // if (dir.get() == "Animate Both")
    // dir.set("Both");
    // finished.set(false);
    const now = (CABLES.now() - startTime) / 1000;
    const oldValue = anim.getValue(now);
    anim.clear();

    anim.setValue(now, oldValue);

    if (inVisible.get())
    {
        // if (dir.get() != "Only True") anim.setValue(now + duration.get(), valueFalse.get());
        // else
        // anim.setValue(now, valueFalse.get());
        anim.setValue(now + inDuration.get() * 1000, inOpacity.get());
    }
    else
    {
        // if (dir.get() != "Only False") anim.setValue(now + inDuration.get(), valueTrue.get());
        // else
        // anim.setValue(now, valueTrue.get());
        anim.setValue(now + inDuration.get() * 1000, 0);
    }
}
