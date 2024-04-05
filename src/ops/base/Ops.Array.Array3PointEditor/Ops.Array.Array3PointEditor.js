const
    exec = op.inTrigger("Execute"),
    inNum = op.inInt("Total Points", 10),
    inEdit = op.inBool("Edit", false),
    inEditIndex = op.inInt("Index"),

    inArr = op.inArray("intArr"),
    inPosX = op.inFloat("x", 0),
    inPosY = op.inFloat("y", 0),
    inPosZ = op.inFloat("z", 0),

    inReset = op.inTriggerButton("Reset"),

    next = op.outTrigger("Next"),
    outArr = op.outArray("Coordinates");

let changed = false;
let idx = 0;
let arr = [];
arr.length = inNum.get();

outArr.setUiAttribs({ "stride": 3 });

inArr.setUiAttribs({ "hideParam": true, "hidePort": true });
inPosX.setUiAttribs({ "hideParam": true, "hidePort": true });
inPosY.setUiAttribs({ "hideParam": true, "hidePort": true });
inPosZ.setUiAttribs({ "hideParam": true, "hidePort": true });

inNum.onChange = numChanged;
inEditIndex.onChange = updateIndex;

updateIndex();

inReset.onTriggered = () =>
{
    arr = [];
    numChanged();
    updateIndex();
};

inPosX.onChange = (p, v) =>
{
    arr[idx + 0] = v;
    changed = true;
};
inPosY.onChange = (p, v) =>
{
    arr[idx + 1] = v;
    changed = true;
};
inPosZ.onChange = (p, v) =>
{
    arr[idx + 2] = v;
    changed = true;
};

inEdit.onChange = () =>
{
    gui.setTransformGizmo(null);
};

inArr.onChange = () =>
{
    arr = inArr.get() || [];
};

function numChanged()
{
    arr.length = Math.max(3, Math.abs(inNum.get() * 3));
    for (let i = 0; i < arr.length; i++) if (arr[i] === undefined || arr[i] === null)arr[i] = 0.0;
    changed = true;
}

function updateIndex()
{
    idx = Math.min(inNum.get() * 3, Math.abs(inEditIndex.get() * 3));
    inPosX.set(arr[idx + 0]);
    inPosY.set(arr[idx + 1]);
    inPosZ.set(arr[idx + 2]);
}

exec.onTriggered = () =>
{
    if (CABLES.UI && inEdit.get())
    {
        gui.setTransformGizmo(
            {
                "posX": inPosX,
                "posY": inPosY,
                "posZ": inPosZ
            });
    }

    if (changed)
    {
        inArr.set(arr);
        outArr.setRef(arr);
        changed = false;
    }
    next.trigger();
};

//
