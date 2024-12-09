const
    inEle = op.inObject("Element"),
    inValue = op.inString("Value"),
    inWhat = op.inSwitch("Type", ["HTML", "Text"], "HTML"),
    inActive = op.inBool("Active", true),
    outEle = op.outObject("HTML Element");

let ele = null;

inWhat.onChange =
    inEle.onChange =
    inValue.onChange = update;

inEle.onLinkChanged = removeProp;

inActive.onChange = () =>
{
    if (!inActive.get()) removeProp();
    else update();
};

function removeProp()
{
    if (ele)
    {
        ele.innerText = "";
        ele.innerHTML = "";
    }
}

function update()
{
    if (!inActive.get()) return;

    if (ele != inEle.get())removeProp();

    ele = inEle.get();
    if (ele)
    {
        const str = inValue.get();

        if (inWhat.get() == "HTML") ele.innerHTML = str;
        else ele.innerText = str;
    }

    outEle.setRef(ele);
}
