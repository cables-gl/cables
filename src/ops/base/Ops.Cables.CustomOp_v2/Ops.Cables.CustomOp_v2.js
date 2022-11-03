const defaultCode = "\
// you can use custom javascript code here, it will be bound to the\n\
// scope of the current op, which is available as `op`.\n\
// \n\
// have a look at the documentation at:\n\
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html\n\
\n\
";

const inJS = op.inStringEditor("JavaScript");
inJS.setUiAttribs({ "editorSyntax": "js" });
inJS.set(defaultCode);
const inLib = op.inUrl("Library", [".js"]);

const portsData = op.inString("portsData", "{}");
portsData.setUiAttribs({ "hidePort": true });
portsData.setUiAttribs({ "hideParam": true });
const protectedPorts = [inJS.id, inLib.id, portsData.id];

let wasPasted = false;

op.setUiError("error", null);

const init = function ()
{
    if (op.uiAttribs)
    {
        wasPasted = op.uiAttribs.pasted;
    }
    restorePorts();
    loadLibAndExecute();
    inLib.onChange = inJS.onChange = loadLibAndExecute;
    if (wasPasted) wasPasted = false;
};

op.onLoadedValueSet = init;
op.patch.on("onOpAdd", (newOp, fromDeserizalize) =>
{
    if (op == newOp && !fromDeserizalize)
    {
        init();
    }
});

op.onError = function (ex)
{
    if (op.patch.isEditorMode())
    {
        op.setUiError("error", ex);
        const str = inJS.get();
        const badLines = [];
        let htmlWarning = "";
        const lines = str.match(/^.*((\r\n|\n|\r)|$)/gm);

        let anonLine = "";
        const exLines = ex.stack.split("\n");
        for (let i = 0; i < exLines.length; i++)
        {
            // firefox
            if (exLines[i].includes("Function:"))
            {
                anonLine = exLines[i];
                break;
            }
            // chrome
            if (exLines[i].includes("anonymous"))
            {
                anonLine = exLines[i];
                break;
            }
        }

        let lineFields = anonLine.split(":");
        let errorLine = lineFields[lineFields.length - 2];

        badLines.push(errorLine - 2);

        for (const i in lines)
        {
            const j = parseInt(i, 10) + 1;
            const line = j + ": " + lines[i];

            let isBadLine = false;
            for (const bj in badLines)
                if (badLines[bj] == j) isBadLine = true;

            if (isBadLine) htmlWarning += "<span class=\"error\">";
            htmlWarning += line.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;")
                .replaceAll("'", "&#039;");
            if (isBadLine) htmlWarning += "</span>";
        }

        ex.customMessage = htmlWarning;
        ex.stack = "";
        op.patch.emitEvent("exceptionOp", ex, op.name);
    }
};

const getEvalFunction = () =>
{
    op.setUiError("error", null);
    let errorEl = document.getElementById("customop-error-" + op.id);
    if (errorEl)
    {
        errorEl.remove();
    }
    try
    {
        return new Function("op", inJS.get());
    }
    catch (err)
    {
        op.onError(err);
        if (op.patch.isEditorMode())
        {
            errorEl = document.createElement("script");
            errorEl.id = "customop-error-" + op.id;
            errorEl.type = "text/javascript";
            errorEl.innerHTML = inJS.get();
            document.body.appendChild(errorEl);
        }
        else
        {
            op.logError("error creating javascript function", err);
        }
        return null;
    }
};

function loadLibAndExecute()
{
    if (inLib.get())
    {
        let scriptTag = document.getElementById("customop_lib_" + op.id);
        if (scriptTag)
        {
            scriptTag.remove();
        }
        scriptTag = document.createElement("script");
        scriptTag.id = "customlib_" + op.id;
        scriptTag.type = "text/javascript";
        scriptTag.src = op.patch.getFilePath(String(inLib.get()));
        scriptTag.onload = function ()
        {
            op.logVerbose("done loading library", inLib.get());
            execute();
        };
        document.body.appendChild(scriptTag);
    }
    else if (inJS.get() && inJS.get() !== defaultCode)
    {
        execute();
    }
}

const removeInPort = (port) =>
{
    port.removeLinks();
    for (let ipi = 0; ipi < op.portsIn.length; ipi++)
    {
        if (op.portsIn[ipi] == port)
        {
            op.portsIn.splice(ipi, 1);
            return;
        }
    }
};

const removeOutPort = (port) =>
{
    port.removeLinks();
    for (let ipi = 0; ipi < op.portsOut.length; ipi++)
    {
        if (op.portsOut[ipi] == port)
        {
            op.portsOut.splice(ipi, 1);
            return;
        }
    }
};

const execute = () =>
{
    const evalFunction = getEvalFunction();
    if (evalFunction)
    {
        try
        {
            const oldLinksIn = {};
            const oldValuesIn = {};
            const oldLinksOut = {};
            const removeInPorts = [];
            const removeOutPorts = [];
            op.portsIn.forEach((port) =>
            {
                if (!protectedPorts.includes(port.id))
                {
                    oldLinksIn[port.name] = [];
                    oldValuesIn[port.name] = port.get();
                    port.links.forEach((link) =>
                    {
                        const linkInfo = {
                            "op": link.portOut.parent,
                            "portName": link.portOut.name
                        };
                        oldLinksIn[port.name].push(linkInfo);
                    });
                    removeInPorts.push(port);
                }
            });
            op.portsOut.forEach((port) =>
            {
                oldLinksOut[port.name] = [];
                port.links.forEach((link) =>
                {
                    const linkInfo = {
                        "op": link.portIn.parent,
                        "portName": link.portIn.name
                    };
                    oldLinksOut[port.name].push(linkInfo);
                });
                removeOutPorts.push(port);
            });
            removeInPorts.forEach((port) =>
            {
                removeInPort(port);
            });
            removeOutPorts.forEach((port) =>
            {
                removeOutPort(port);
            });
            if (removeOutPorts.length > 0 || removeInPorts.length > 0)
            {
                this.emitEvent("onUiAttribsChange", {});
                this.emitEvent("onPortRemoved", {});
            }
            evalFunction(this);

            op.portsIn.forEach((port) =>
            {
                if (!protectedPorts.includes(port.id))
                {
                    port.onLinkChanged = savePortData;

                    if (oldLinksIn[port.name])
                    {
                        oldLinksIn[port.name].forEach((link) =>
                        {
                            op.patch.link(op, port.name, link.op, link.portName);
                        });
                    }

                    if (typeof port.onChange == "function")
                    {
                        const oldHandler = port.onChange;
                        port.onChange = (p, v) =>
                        {
                            if (!port.isLinked()) savePortData();
                            oldHandler(p, v);
                        };
                    }
                    else
                    {
                        port.onChange = () =>
                        {
                            if (!port.isLinked()) savePortData();
                        };
                    }

                    // for backwards compatibility, do not add default handler (handled above)
                    if (typeof port.onValueChanged == "function")
                    {
                        const oldValueHandler = port.onValueChanged;
                        port.onValueChanged = (p, v) =>
                        {
                            if (!port.isLinked()) savePortData();
                            oldValueHandler(p, v);
                        };
                    }

                    if (oldValuesIn[port.name])
                    {
                        port.set(oldValuesIn[port.name]);
                    }
                }
            });
            op.portsOut.forEach((port) =>
            {
                port.onLinkChanged = savePortData;

                if (oldLinksOut[port.name])
                {
                    oldLinksOut[port.name].forEach((link) =>
                    {
                        op.patch.link(op, port.name, link.op, link.portName);
                    });
                }
            });
            if (wasPasted)
            {
                wasPasted = false;
            }
            savePortData();
        }
        catch (e)
        {
            if (op.patch.isEditorMode())
            {
                op.onError(e);
                const name = "Ops.Custom.CUSTOM" + op.id.replace(/-/g, "");
                const code = inJS.get();
                let codeHead = "Ops.Custom = Ops.Custom || {};\n";
                codeHead += name + " = " + name + " || {};\n";
                codeHead += name + " = function()\n{\nCABLES.Op.apply(this,arguments);\nconst op=this;\n";
                let codeFoot = "\n\n};\n\n" + name + ".prototype = new CABLES.Op();\n";
                codeFoot += "new " + name + "();\n";
                const opCode = codeHead + code + codeFoot;
                const errorEl = document.createElement("script");
                errorEl.id = "customop-error-" + op.id;
                errorEl.type = "text/javascript";
                errorEl.innerHTML = opCode;
                document.body.appendChild(errorEl);
            }
            else
            {
                op.logError("error executing javascript code", e);
            }
        }
    }
};

function savePortData()
{
    const newPortsData = { "portsIn": {}, "portsOut": {} };
    op.portsIn.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            let v = port.get();
            if (port.ignoreValueSerialize)v = null;
            const portData = {
                "name": port.name,
                "title": port.title,
                "value": v,
                "type": port.type,
                "links": []
            };
            port.links.forEach((link) =>
            {
                const linkData = {
                    "objOut": link.portOut.parent.id,
                    "portOut": link.portOut.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsIn[port.name] = portData;
        }
    });

    op.portsOut.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            let v = port.get();
            if (port.ignoreValueSerialize)v = null;

            const portData = {
                "name": port.name,
                "title": port.title,
                "value": v,
                "type": port.type,
                "links": []
            };
            port.links.forEach((link) =>
            {
                const linkData = {
                    "objIn": link.portIn.parent.id,
                    "portIn": link.portIn.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsOut[port.name] = portData;
        }
    });

    let serializedPortsData = "{}";
    try
    {
        serializedPortsData = JSON.stringify(newPortsData);
    }
    catch (e)
    {
        op.log("failed to stringify new port data", newPortsData);
    }
    portsData.set(serializedPortsData);
}

const getOldPorts = () =>
{
    const jsonData = portsData.get();
    let oldPorts = {};
    try
    {
        oldPorts = JSON.parse(jsonData);
    }
    catch (e)
    {
        op.log("failed to parse old port data", jsonData);
    }

    let oldPortsIn = {};
    let oldPortsOut = {};

    if (oldPorts.portsOut)
    {
        oldPortsOut = oldPorts.portsOut;
    }
    if (oldPorts.portsIn)
    {
        oldPortsIn = oldPorts.portsIn;
    }
    return { "portsIn": oldPortsIn, "portsOut": oldPortsOut };
};

const restorePorts = () =>
{
    const oldPorts = getOldPorts();
    const portInKeys = Object.keys(oldPorts.portsIn);
    if (op.patch.isEditorMode()) CABLES.UI.undo.pause();
    for (let i = 0; i < portInKeys.length; i++)
    {
        const oldPortIn = oldPorts.portsIn[portInKeys[i]];
        const newPort = op.addInPort(new CABLES.Port(op, oldPortIn.name, oldPortIn.type));

        if (!wasPasted && Array.isArray(oldPortIn.links))
        {
            oldPortIn.links.forEach((link) =>
            {
                let parent = op.patch.getOpById(link.objOut);
                if (parent)
                {
                    op.patch.link(parent, link.portOut, op, newPort.name);
                }
            });
        }
        if (!newPort.isLinked())
        {
            newPort.set(oldPortIn.value);
        }
        newPort.onLinkChanged = savePortData;

        if (oldPortIn.title)
        {
            newPort.setUiAttribs({ "title": oldPortIn.title });
        }
    }

    const portOutKeys = Object.keys(oldPorts.portsOut);
    for (let i = 0; i < portOutKeys.length; i++)
    {
        const oldPortOut = oldPorts.portsOut[portOutKeys[i]];
        const newPort = op.addOutPort(new CABLES.Port(op, oldPortOut.name, oldPortOut.type));
        if (!wasPasted && Array.isArray(oldPortOut.links))
        {
            oldPortOut.links.forEach((link) =>
            {
                let parent = op.patch.getOpById(link.objIn);
                if (parent)
                {
                    op.patch.link(op, newPort.name, parent, link.portIn);
                }
            });
            if (!newPort.isLinked())
            {
                newPort.set(oldPortOut.value);
            }
            newPort.onLinkChanged = savePortData;

            if (oldPortOut.title)
            {
                newPort.setUiAttribs({ "title": oldPortOut.title });
            }
        }
    }
    if (op.patch.isEditorMode()) CABLES.UI.undo.resume();
};
