const
    inEle = op.inObject("Element"),
    inValue = op.inString("Value"),
    inWhat = op.inSwitch("Type", ["HTML", "Text"], "HTML"),
    inActive = op.inBool("Active", true),
    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);

inValue.onChange = update;
let ele = null;

inEle.onChange =
    outEle.onLinkChanged =
    inEle.onLinkChanged = removeProp;

inActive.onChange = () =>
{
    if (!inActive.get()) removeProp();
    else update();
};

function removeProp()
{
    if (ele)ele.innerText = "";
}

function update()
{
    if (!inActive.get()) return;

    ele = inEle.get();
    if (ele && ele.style)
    {
        const str = inValue.get();

        if (inWhat.get() == "HTML") ele.innerHTML = str;
        else ele.innerText = str;
    }

    outEle.setRef(inEle.get());
}
