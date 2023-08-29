const
    inClass = op.inString("Class"),
    inParent = op.inObject("Parent", null, "element"),
    inNum = op.inInt("Num", 10),
    inActive = op.inBool("Active", true),
    inText = op.inArray("Text"),
    inResetHover = op.inTriggerButton("Reset Hover"),
    outArr = op.outArray("Elements", null, "element"),
    outIndex = op.outNumber("Index Clicked"),
    outClicked = op.outTrigger("Element Clicked"),
    outHover = op.outNumber("Index Hovered");

const elements = [];

inParent.onChange =
inText.onChange =
inClass.onChange =
inClass.onChange =
    inNum.onChange = createElements;

op.onDelete = removeElements;

inActive.onChange = () =>
{
    if (!inActive.get()) removeElements();
    else createElements();
};

function removeElements()
{
    for (let i = 0; i < elements.length; i++)
    {
        elements[i].remove();
    }
    elements.length = 0;
}

inResetHover.onTriggered = () =>
{
    outHover.set(-1);
};

function createElements()
{
    removeElements();
    if (!inActive.get()) return;

    const parent = inParent.get();
    const textarr = inText.get();

    for (let i = 0; i < inNum.get(); i++)
    {
        const div = document.createElement("div");
        div.dataset.op = op.id;

        const index = i;
        div.addEventListener("pointerdown", () =>
        {
            outIndex.set(index);
            outClicked.trigger();
            // outHover.set(-1);
        });

        div.addEventListener("pointerenter", () =>
        {
            outHover.set(index);
        });

        div.addEventListener("pointerleave", () =>
        {
            outHover.set(-1);
        });

        const parent = inParent.get() || op.patch.cgl.canvas.parentElement;

        parent.appendChild(div);

        div.setAttribute("class", inClass.get());
        div.classList.add("index_" + i);

        if (textarr && textarr.length > i)div.innerHTML = textarr[i];

        elements[i] = div;
    }

    outArr.set(null);
    outArr.set(elements);
}
