// welcome to your new op!
// have a look at the documentation:
// https://cables.gl/docs/5_writing_ops/dev_ops/dev_ops

const
    exec = op.inTriggerButton("Async crash"),
    inExc = op.inTriggerButton("Throw Exception"),
    inErrorFloat2 = op.inFloat("Float", 0),
    inErrorFloat = op.inTriggerButton("Array Exception"),
    inPromiseFailEx = op.inTriggerButton("Promise Fail");

exec.onTriggered = () =>
{
    setTimeout(() =>
    {
        a.test();
    }, 100);
};

inErrorFloat2.onChange = () =>
{
    const arr = [];
    arr.length = inErrorFloat2.get();
};

inErrorFloat.onTriggered = () =>
{
    const arr = [];
    arr.length = 1.2;
};

inExc.on("trigger", () =>
{
    throw new Error("crash0r");
});

inPromiseFailEx.onTriggered = () =>
{
    fetch("https://dewdewdew",
        {
            "mode": "cors",
            "headers": {
                "Access-Control-Allow-Origin": "*"
            }
        })
        .then((response) => { return response.json(); })
        .then(() => {});
};
