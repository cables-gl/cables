const
    inEle = op.inObject("HTML Element"),
    inVisible = op.inValueBool("Visible", true),
    inDuration = op.inValue("Duration", 0.25),
    inOpacity = op.inValue("Opacity", 1),
    outEle = op.outObject("PassThrough", null, "element"),
    outShowing = op.outBoolNum("Is Showing", false);

let theTimeout = null;
let currentEle = null;
let loaded = true;
const oldvis = null;
loaded = true;

inDuration.onChange =
    inOpacity.onChange = update;

inVisible.onChange =
    inEle.onChange = updateVisibility;

let styleEle = null;
// const eleId = "css_" + CABLES.uuid();
// const cssClassesId = CABLES.shortId();

// const getFadeInClassName() = "CABLES_animFadeIn_" + cssClassesId;
// const getFadedOutClassName( = "CABLES_animFadedOut_" + cssClassesId;
// const getFadedInClassName( = "CABLES_animFadedIn_" + cssClassesId;
// const getFadeOutClassName() = "CABLES_animFadeOut_" + cssClassesId;
update();

function getStyleId()
{
    return (String(inOpacity.get() + inDuration.get())).replaceAll(".", "_");
}

function getFadeOutClassName(id)
{
    return "CABLES_animFadeOut_" + (id || getStyleId());
}

function getFadeInClassName(id)
{
    return "CABLES_animFadeIn_" + (id || getStyleId());
}

function getFadedOutClassName(id)
{
    return "CABLES_animFadedOut_" + (id || getStyleId());
}

function getFadedInClassName(id)
{
    return "CABLES_animFadedIn_" + (id || getStyleId());
}

op.onLoaded = function ()
{
    loaded = true;
    updateVisibility();
    outShowing.set(inVisible.get());
};

inEle.onChange =
outEle.onLinkChanged =
inEle.onLinkChanged = () =>
{
    outEle.setRef(inEle.get());
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

    if (styleEle && ele)
    {
        if (currentEle != ele)
        {
            ele.classList.remove(getFadeInClassName());
            ele.classList.remove(getFadeOutClassName());
            if (inVisible.get()) ele.classList.add(getFadedInClassName());
            else ele.classList.add(getFadedInClassName());

            currentEle = ele;
        }
        else
        {
            if (inVisible.get() && (ele.classList.contains(getFadedInClassName()) || ele.classList.contains(getFadeInClassName()))) return;
            if (!inVisible.get() && (ele.classList.contains(getFadedOutClassName()) || ele.classList.contains(getFadeOutClassName()))) return;

            if (inVisible.get())
            {
                outShowing.set(true);
                if (ele && ele.classList && !ele.classList.contains(getFadeInClassName()))
                {
                    clearTimeout(theTimeout);
                    ele.classList.remove(getFadedOutClassName());
                    ele.classList.remove(getFadeOutClassName());
                    ele.classList.add(getFadeInClassName());
                    theTimeout = setTimeout(function ()
                    {
                        ele.classList.remove(getFadeInClassName());
                        ele.classList.add(getFadedInClassName()); outEle.setRef(inEle.get());

                        outShowing.set(true);
                    }, inDuration.get() * 1000);
                }
            }
            else
            {
                outShowing.set(true);
                if (ele && ele.classList && !ele.classList.contains(getFadedOutClassName()))
                {
                    clearTimeout(theTimeout);
                    ele.classList.remove(getFadedInClassName());
                    ele.classList.remove(getFadeInClassName());
                    ele.classList.add(getFadeOutClassName());
                    theTimeout = setTimeout(function ()
                    {
                        ele.classList.add(getFadedOutClassName());
                        ele.classList.remove(getFadeOutClassName()); outEle.setRef(inEle.get());

                        outShowing.set(false);
                    }, inDuration.get() * 1000);
                }
            }
        }

        outEle.setRef(inEle.get());
    }
}

function getCssContent()
{
    let css = attachments.fadeInOut_css;

    while (css.indexOf("$LENGTH") > -1)css = css.replace("$LENGTH", inDuration.get());
    while (css.indexOf("$FULLOPACITY") > -1)css = css.replace("$FULLOPACITY", inOpacity.get());
    while (css.indexOf("$CLASSES_ID") > -1)css = css.replace("$CLASSES_ID", getStyleId());

    return css;
}

function update()
{
    styleEle = document.getElementById("style" + getStyleId());

    if (styleEle)
    {
        // styleEle.textContent = getCssContent();
    }
    else
    {
        styleEle = document.createElement("style");
        styleEle.type = "text/css";
        styleEle.id = "style" + getStyleId();
        styleEle.classList.add("cablesEle");
        styleEle.textContent = getCssContent();

        const head = document.getElementsByTagName("body")[0];
        head.appendChild(styleEle);
    }
}

op.onDelete = function ()
{
    const ele = inEle.get();

    if (ele && ele.classList)
    {
        ele.classList.remove(getFadeInClassName());
        ele.classList.remove(getFadedOutClassName());
        ele.classList.remove(getFadedInClassName());
        ele.classList.remove(getFadeOutClassName());
    }

    // styleEle = document.getElementById(eleId);
    // if (styleEle)styleEle.remove();
};
