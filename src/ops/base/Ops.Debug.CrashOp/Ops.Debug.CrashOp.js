const
    exec = op.inTriggerButton("Async crash"),
    inUndef = op.inTriggerButton("Undefined crash"),
    inExc = op.inTriggerButton("Throw Exception"),
    inErrorFloat2 = op.inFloat("Float", 0),
    inErrorFloat = op.inTriggerButton("Array Exception"),
    inPromiseFailEx = op.inTriggerButton("Promise Fail"),
    inShaderCrash = op.inTriggerButton("Shader Error");

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

inUndef.onTriggered = () =>
{
    cdsvdfscdscds;
};

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

inShaderCrash.onTriggered = () =>
{
    const shader = new CGL.Shader(op.patch.cgl, "MinimalMaterial");
    shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
    shader.setSource("csdcsd", "xcdcsd");
    shader.compile();
};
