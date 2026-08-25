const
    inStage = op.inSwitch("Stage", ["VERTEX", "FRAGMENT", "COMPUTE"], "COMPUTE"),

    inCode = op.inStringEditor("Code", "", "glsl"),
    // inUpdates = op.inArray("Update Values"),

    inCodePre = op.inString("Code Prepend", ""),
    inView = op.inTriggerButton("View Code"),

    outModule = op.outObject("Module", null, "shadermodule"),
    outCode = op.outString("Final Code");

const
    inO = op.inObject("Graph"),
    debug = op.inBool("Debug comments", false),
    types = op.inBool("Set Type Title", true),
    ids = op.inBool("Show id", true);

/* minimalcore:start */
inStage.setUiAttribs({ "hidePort": true });
inView.setUiAttribs({ "hidePort": true });

/* minimalcore:end */

let oldBindings = [];
let s = null;
let bindHead = "";
let o = null;
let lastChange = 0;

let sm = null;
let gencode = "";
const sgp = new CABLES.ShaderGraphProgram(inO, new CABLES.LangWgsl());

ids.onChange =
    types.onChange =
    debug.onChange =
    inCode.onChange =
    inO.onChange = () =>
    {
        sgp.compile({ "showType": types.get(), "debug": debug.get(), "showId": ids.get });
        let str = inCode.get() || "";

        /* minimalcore:start */

        op.setUiError("nomain", str.includes("{{MAIN}}") ? null : "no {{MAIN}} found!");
        op.setUiError("noHEADER", str.includes("{{HEADER}}") ? null : "no {{HEADER}} found!");

        /* minimalcore:end */

        str = str.replaceAll("{{MAIN}}", sgp.srcMain);
        str = str.replaceAll("{{HEADER}}", sgp.srcHeader);

        if (sm) sm.reInit = true;
        outModule.setRef(sm);
        gencode = str;

    };

inStage.onChange =
    inCodePre.onChange =
    outCode.onChange = () =>
    {

        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": inStage.get() });
        outCode.setUiAttribs({ "title": "final code " + inStage.get() });

        /* minimalcore:end */

        if (sm) sm.reInit = true;
        // sm = null;
    };

/* minimalcore:start */
outCode.setUiAttribs({ "editorSyntax": "glsl" });
outCode.ignoreValueSerialize = true;

inView.onTriggered = () =>
{
    CABLES.UI.codeWatcher(outCode);
};

/* minimalcore:end */

op.updateShaderModule = (mgpu) =>
{
    mgpu.constants = {};
    mgpu.stage = GPUShaderStage[inStage.get()];
    const binds = [];

    const updts = sgp.updateableOps;

    // console.log("updaaaa", updts);
    if (updts)
    {
        for (const i in updts)
        {
            updts[i].update(mgpu, binds);
        }
    }

    // if (o && o.bindings != mgpu.bindings) sm.reInit = true;

    if (!sm || sm.reInit)
    {
        sm = new MGPU.ShaderModule(mgpu, { "stage": inStage.get(), "op": op });
        sm.onShaderInfo = (shaderInfo) =>
        {

            /* minimalcore:start */
            op.setUiError("shadercomp", null);
            for (let i = 0; i < shaderInfo.messages.length; i++)
            {
                const msg = shaderInfo.messages[i];
                if (msg)
                {
                    diags.push({ "message": msg.type + " line " + msg.lineNum + ": " + msg.message, "line": msg.lineNum, "column": -1, "severity": 2, "fatal": true });

                    let message = msg.message;
                    if (message.split("\n") && message.split("\n").length > 1) message = message.split("\n")[0] + "...";

                    op.setUiError("shadercomp", msg.type + " line " + msg.lineNum + ": " + message.replaceAll("\n", "<br/>"), 2,
                        {
                            "button": "show",
                            "buttonCb": () => { CABLES.UI.codeWatcher(outCode); }
                        });
                }
            }

            outCode.setUiAttribs({ "editorDiagnostics": diags });
            inCode.setUiAttribs({ "editorDiagnostics": diags });

            /* minimalcore:end */
        };

        sm.code = gencode;
        sm.codePre = inCodePre.get();
        sm.bindings = binds;

        sm.create(mgpu);
        console.log("rebuild moduleeeeeeeeeeeeeee", sm.bindings, sm.bindings);

        outCode.set(sm.finalCode);
        const diags = [];
        outCode.setUiAttribs({ "editorDiagnostics": [] });

        mgpu.rebuildPipeline = "module rebuild ";
        mgpu.rebuildShaderModule = false;

        sm.reInit = false;

        outModule.setRef(sm);
    }

};
