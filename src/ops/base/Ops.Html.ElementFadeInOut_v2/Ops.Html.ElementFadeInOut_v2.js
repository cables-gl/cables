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
const eleId = "css_" + CABLES.uuid();
const cssClassesId = CABLES.shortId();

const animFadeInClass = "CABLES_animFadeIn_" + cssClassesId;
const animFadedOutClass = "CABLES_animFadedOut_" + cssClassesId;
const animFadedInClass = "CABLES_animFadedIn_" + cssClassesId;
const animFadeOutClass = "CABLES_animFadeOut_" + cssClassesId;

update();

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
            ele.classList.remove(animFadeInClass);
            ele.classList.remove(animFadeOutClass);
            if (inVisible.get()) ele.classList.add(animFadedInClass);
            else ele.classList.add(animFadedInClass);

            currentEle = ele;
        }
        else
        {
            if (inVisible.get() && (ele.classList.contains(animFadedInClass) || ele.classList.contains(animFadeInClass))) return;
            if (!inVisible.get() && (ele.classList.contains(animFadedOutClass) || ele.classList.contains(animFadeOutClass))) return;

            if (inVisible.get())
            {
                outShowing.set(true);
                if (ele && ele.classList && !ele.classList.contains(animFadeInClass))
                {
                    clearTimeout(theTimeout);
                    ele.classList.remove(animFadedOutClass);
                    ele.classList.remove(animFadeOutClass);
                    ele.classList.add(animFadeInClass);
                    theTimeout = setTimeout(function ()
                    {
                        ele.classList.remove(animFadeInClass);
                        ele.classList.add(animFadedInClass);
                        outShowing.set(true);
                    }, inDuration.get() * 1000);
                }
            }
            else
            {
                outShowing.set(true);
                if (ele && ele.classList && !ele.classList.contains(animFadedOutClass))
                {
                    clearTimeout(theTimeout);
                    ele.classList.remove(animFadedInClass);
                    ele.classList.remove(animFadeInClass);
                    ele.classList.add(animFadeOutClass);
                    theTimeout = setTimeout(function ()
                    {
                        ele.classList.add(animFadedOutClass);
                        ele.classList.remove(animFadeOutClass);
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
    while (css.indexOf("$CLASSES_ID") > -1)css = css.replace("$CLASSES_ID", cssClassesId);

    return css;
}

function update()
{
    styleEle = document.getElementById(eleId);

    if (styleEle)
    {
        styleEle.textContent = getCssContent();
    }
    else
    {
        styleEle = document.createElement("style");
        styleEle.type = "text/css";
        styleEle.id = eleId;
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
        ele.classList.remove(animFadeInClass);
        ele.classList.remove(animFadedOutClass);
        ele.classList.remove(animFadedInClass);
        ele.classList.remove(animFadeOutClass);
    }

    styleEle = document.getElementById(eleId);
    if (styleEle)styleEle.remove();
};
