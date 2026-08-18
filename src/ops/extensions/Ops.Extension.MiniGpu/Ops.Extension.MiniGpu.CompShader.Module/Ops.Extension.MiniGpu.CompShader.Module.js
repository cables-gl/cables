const
    exec = op.inTrigger("Trigger"),
    inStage = op.inSwitch("Stage", ["VERTEX", "FRAGMENT", "COMPUTE"], "COMPUTE"),

    inCode = op.inStringEditor("Code", "", "glsl"),
    inUpdates = op.inArray("Update Values"),

    inCodePre = op.inString("Code Prepend", ""),
    inReset = op.inTriggerButton("Reset"),
    inView = op.inTriggerButton("View Code"),

    next = op.outTrigger("Next"),
    outCode = op.outString("Final Code");

/* minimalcore:start */
outCode.setUiAttribs({ "editorSyntax": "glsl" });
outCode.ignoreValueSerialize = true;

/* minimalcore:end */

const binds = new CABLES.Stack();
let oldBindings = [];
let s = null;
let bindHead = "";
let reInit = true;
let o = null;
let lastChange = 0;
let hasError = false;

inStage.onChange =
    inStage.onChange =
    inCodePre.onChange =
    inCode.onChange = () =>
    {

        /* minimalcore:start */
        op.setUiAttrib({ "extendTitle": inStage.get() });
        outCode.setUiAttribs({ "title": "final code " + inStage.get() });

        /* minimalcore:end */

        hasError = false;
        reInit = true;
    };

inReset.onTriggered = () =>
{
    reInit = true;
};
inView.onTriggered = () =>
{
    CABLES.UI.codeWatcher(outCode);
};

function genBindHeadSrc()
{
    let bhead = "";
    let g = 0;
    if (inStage.get() == "FRAGMENT") g = 1;

    for (let i = 0; i < binds.array().length; i++)
    {
        const b = binds.array()[i];
        if (b.headSrc)
            bhead += b.headSrc + "\n";
    }

    for (let i = 0; i < binds.array().length; i++)
    {
        const b = binds.array()[i];
        bhead += "@group(" + g + ") @binding(" + i + ") " + b.header + "\n";
    }

    if (bhead != bindHead) reInit = true;
    bindHead = bhead;

    let code = inCodePre.get() + inCode.get();
    code = code.replaceAll("{{BINDINGS}}", bhead);
    outCode.set(code);
    return code;
}

exec.onTriggered = () =>
{
    const mgpu = op.patch.frameStore.mgpu;
    mgpu.constants = {};
    mgpu.stage = GPUShaderStage[inStage.get()];
    mgpu.bindings = binds.clear();

    const updts = inUpdates.get();
    for (let i = 0; i < updts.length; i++)
    {
        updts[i].update(mgpu);

    }

    next.trigger();
    mgpu.shader.pop();
    if (o && o.bindings != mgpu.bindings) reInit = true;

    if (reInit || mgpu.rebuildShaderModule)
    {
        hasError = false;
        s = { "layout": "auto" };
        const module = mgpu.device.createShaderModule(
            {
                "code": genBindHeadSrc()
            });

        /* minimalcore:start */
        module.label = op.uiAttribs.comment || op.id;

        /* minimalcore:end */

        const diags = [];

        outCode.setUiAttribs({ "editorDiagnostics": [] });
        module.getCompilationInfo().then((a) =>
        {
            if (a.messages.length)
            {
                // console.log(genBindHeadSrc());
                console.log(a);
            }

            /* minimalcore:start */
            op.setUiError("shadercomp", null);
            for (let i = 0; i < a.messages.length; i++)
            {
                const msg = a.messages[i];
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
                    if (msg.type == "error") hasError = true;
                }
            }

            outCode.setUiAttribs({ "editorDiagnostics": diags });
            inCode.setUiAttribs({ "editorDiagnostics": diags });

            /* minimalcore:end */
        });

        /* NOPEminimalcore:end */
        s[inStage.get().toLowerCase()] = {

            "module": module,
            "targets": [ // only frag??
                {
                    "format": mgpu.format,
                    "blend":
                    {
                        "color":
                        {
                            "srcFactor": "src-alpha",
                            "dstFactor": "one-minus-src-alpha",
                            "operation": "add"
                        },
                        "alpha":
                        {
                            "srcFactor": "one",
                            "dstFactor": "one-minus-src-alpha",
                            "operation": "add"
                        }
                    }
                }
            ],
            "constants": mgpu.constants
        };

        o = { "updated": performance.now(), "shader": s, "bindings": mgpu.bindings, "constants": [] };

        mgpu.rebuildPipeline = "module rebuild ";
        mgpu.rebuildShaderModule = false;

        reInit = false;
    }

    mgpu.shaderModules[inStage.get().toLowerCase()] = o;
    mgpu.shaderModules.updated = false;
};
