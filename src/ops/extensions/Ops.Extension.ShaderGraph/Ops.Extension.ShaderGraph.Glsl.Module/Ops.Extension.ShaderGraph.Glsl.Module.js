const
    inStage = op.inSwitch("Stage", ["VERTEX", "FRAGMENT"], "FRAGMENT"),
    inCode = op.inStringEditor("Code", "", "glsl"),
    inCodePre = op.inString("Code Prepend", "", "glsl"),
    inView = op.inTriggerButton("View Code"),
    outModule = op.outObject("Module", null, "shadermodule"),
    outCode = op.outString("Final Code"),
    inGraphNodes = op.inMultiPort2("Graph", CABLES.OP_PORT_TYPE_OBJECT),
    debug = op.inBool("Debug comments", false),
    types = op.inBool("Set Type Title", false),
    ids = op.inBool("Show id", false);

/* minimalcore:start */
inStage.setUiAttribs({ "hidePort": true });
inView.setUiAttribs({ "hidePort": true });

/* minimalcore:end */

const sgp = new CABLES.ShaderGraphProgram(inGraphNodes, new CABLES.LangGlsl());
let shader = null;
let needsUpdate = true;
inStage.onChange =
    inCode.onChange =
    inCodePre.onChange =
    inGraphNodes.onChange = () =>
    {
        update();
    };

function update()
{
    sgp.compile({ "showType": types.get(), "debug": debug.get(), "showId": ids.get });
    let str = inCode.get();

    /* minimalcore:start */

    op.setUiError("nomain", str.includes("{{MAIN}}") ? null : "no {{MAIN}} found!");
    op.setUiError("noHEADER", str.includes("{{HEADER}}") ? null : "no {{HEADER}} found!");

    /* minimalcore:end */

    str = str.replaceAll("{{MAIN}}", sgp.srcMain);
    str = str.replaceAll("{{HEADER}}", sgp.srcHeader);

    outCode.set(str);
    outModule.setRef(
        {
            "src": str
        });
    console.log("str", str);
    needsUpdate = false;
}

op.updateShaderModule = (_shader) =>
{
    // console.log(sgp.bindings)
    // console.log("update");
    shader = _shader;
    const updts = sgp.updateableOps;

    if (updts)
    {
        for (const i in updts)
            updts[i].update(shader);
    }

    if (needsUpdate) update();
};
