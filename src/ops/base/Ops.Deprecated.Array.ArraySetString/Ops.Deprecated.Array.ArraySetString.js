const
    exe = op.inTriggerButton("Execute"),
    array = op.inArray("Array"),
    index = op.inValueInt("Index"),
    value = op.inString("String"),
    values = op.outArray("Result");

values.ignoreValueSerialize = true;
exe.onTriggered = update;

function updateIndex()
{
    if (exe.isLinked()) return;
    update();
}

function update()
{
    const arr = array.get();
    if (!arr) return;
    arr[index.get()] = value.get();

    values.setRef(arr);
}
