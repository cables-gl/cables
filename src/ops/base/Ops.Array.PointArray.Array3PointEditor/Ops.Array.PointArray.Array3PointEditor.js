const
    exec = op.inTrigger("Execute"),
    inNum = op.inInt("Total Points", 10),
    inEdit = op.inBool("Edit", false),
    inEditIndex = op.inInt("Index"),

    inArr = op.inArray("intArr"),
    inPosX = op.inFloat("x", 0),
    inPosY = op.inFloat("y", 0),
    inPosZ = op.inFloat("z", 0),

    inCopyIndex = op.inInt("Copy From Index"),
    inCopy = op.inTriggerButton("Copy Coordinates"),
    inReset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Coordinates");

let changed = false;
let idx = 0;
let arr = [];
let gizmo = null;
arr.length = inNum.get();

op.setPortGroup("Copy", [inCopyIndex, inCopy]);

outArr.setUiAttribs({ "stride": 3 });

inArr.setUiAttribs({ "hideParam": true, "hidePort": true });
inPosX.setUiAttribs({ "hideParam": true, "hidePort": true });
inPosY.setUiAttribs({ "hideParam": true, "hidePort": true });
inPosZ.setUiAttribs({ "hideParam": true, "hidePort": true });

inNum.onChange = numChanged;
inEditIndex.onChange = updateIndex;

updateIndex();

inCopy.onTriggered = () =>
{
    const fromIdx = inCopyIndex.get() * 3;
    // arr[idx + 0] = arr[fromIdx + 0];
    // arr[idx + 1] = arr[fromIdx + 1];
    // arr[idx + 2] = arr[fromIdx + 2];

    removePosListener();
    arr[idx + 0] = arr[fromIdx + 0];
    arr[idx + 1] = arr[fromIdx + 1];
    arr[idx + 2] = arr[fromIdx + 2];
    inPosX.set(arr[idx + 0]);
    inPosY.set(arr[idx + 1]);
    inPosZ.set(arr[idx + 2]);

    addPosListener();

    changed = true;
};

inReset.onTriggered = () =>
{
    arr = [];
    numChanged();
    updateIndex();
};

function posChanged()
{
    arr[idx + 0] = inPosX.get();
    arr[idx + 1] = inPosY.get();
    arr[idx + 2] = inPosZ.get();
    changed = true;
}

function addPosListener()
{
    inPosX.onChange = posChanged;
    inPosY.onChange = posChanged;
    inPosZ.onChange = posChanged;
}

function removePosListener()
{
    inPosX.onChange = null;
    inPosY.onChange = null;
    inPosZ.onChange = null;
}

op.addEventListener("onEnabledChange", function (enabled)
{
    if (!enabled) if (gizmo) gizmo = gizmo.dispose();
});

op.onDelete = () =>
{
    if (gizmo) gizmo = gizmo.dispose();
};

exec.onLinkChanged = () =>
{
    if (!exec.isLinked() && gizmo) gizmo = gizmo.dispose();
};

inEdit.onChange = () =>
{
    if (!inEdit.get() && gizmo)
    {
        gizmo = gizmo.dispose();
    }
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
    removePosListener();
    inPosX.set(arr[idx + 0]);
    inPosY.set(arr[idx + 1]);
    inPosZ.set(arr[idx + 2]);
    addPosListener();
}

exec.onTriggered = () =>
{
    if (CABLES.UI && inEdit.get())
    {
        if (!gizmo) gizmo = new CABLES.UI.Gizmo(op.patch.cgl);
        gizmo.set(
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
