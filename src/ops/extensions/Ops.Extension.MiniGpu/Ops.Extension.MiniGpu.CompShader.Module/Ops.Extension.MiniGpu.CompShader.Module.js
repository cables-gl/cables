const
    exec = op.inTrigger("Trigger"),
    inStage = op.inSwitch("Stage", ["VERTEX", "FRAGMENT", "COMPUTE"], "COMPUTE"),

    inCode = op.inStringEditor("Code", "", "glsl"),
    inUpdates = op.inArray("Update Values"),

    inCodePre = op.inString("Code Prepend", ""),
    inView = op.inTriggerButton("View Code"),

    next = op.outTrigger("Next"),
    outCode = op.outString("Final Code");

let sm = null;
const binds = new CABLES.Stack();
let oldBindings = [];
let s = null;
let bindHead = "";
let o = null;
let lastChange = 0;

inStage.onChange =
    inStage.onChange =
    inCodePre.onChange =
    inCode.onChange = () =>
    {

        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": inStage.get() });
        outCode.setUiAttribs({ "title": "final code " + inStage.get() });

        /* minimalcore:end */

        if (sm) sm.reInit = true;
    };

/* minimalcore:start */
outCode.setUiAttribs({ "editorSyntax": "glsl" });
outCode.ignoreValueSerialize = true;

inView.onTriggered = () =>
{
    CABLES.UI.codeWatcher(outCode);
};

/* minimalcore:end */

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    mgpu.constants = {};
    mgpu.stage = GPUShaderStage[inStage.get()];
    mgpu.bindings = binds.clear();

    const updts = inUpdates.get();
    if (updts)
        for (let i = 0; i < updts.length; i++)
        {
            updts[i].update(mgpu);
        }

    next.trigger();
    mgpu.shader.pop();

    if (o && o.bindings != mgpu.bindings) sm.reInit = true;

    if (!sm || sm.reInit || mgpu.rebuildShaderModule)
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

        sm.code = inCode.get();
        sm.codePre = inCodePre.get();
        sm.bindings = mgpu.bindings.array();

        sm.create(mgpu);

        const diags = [];
        outCode.setUiAttribs({ "editorDiagnostics": [] });

        mgpu.rebuildPipeline = "module rebuild ";
        mgpu.rebuildShaderModule = false;

        sm.reInit = false;
        // outModule.setRef(sm);
    }

    mgpu.shaderModules[inStage.get().toLowerCase()] = sm;
    mgpu.shaderModules.updated = false;
};
