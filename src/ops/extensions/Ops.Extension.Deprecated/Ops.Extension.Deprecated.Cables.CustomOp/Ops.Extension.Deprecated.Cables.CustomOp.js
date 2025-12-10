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

const protectedPorts = [inJS.id, inLib.id];

op.setUiError("error", null);

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
        op.setUiError("error", err);
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
            op.log("error creating javascript function", err);
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
        scriptTag.src = inLib.get();
        scriptTag.onload = function ()
        {
            console.info("done loading library", inLib.get());
            execute();
        };
        document.body.appendChild(scriptTag);
    }
    if (inJS.get() && inJS.get() !== defaultCode)
    {
        execute();
    }
}

op.onCreate = function ()
{
    loadLibAndExecute();
    inLib.onChange = inJS.onChange = loadLibAndExecute;
};

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
                    if (oldLinksIn[port.name])
                    {
                        oldLinksIn[port.name].forEach((link) =>
                        {
                            op.patch.link(op, port.name, link.op, link.portName);
                        });
                    }

                    if (oldValuesIn[port.name])
                    {
                        port.set(oldValuesIn[port.name]);
                    }
                }
            });
            op.portsOut.forEach((port) =>
            {
                if (oldLinksOut[port.name])
                {
                    oldLinksOut[port.name].forEach((link) =>
                    {
                        op.patch.link(op, port.name, link.op, link.portName);
                    });
                }
            });
        }
        catch (e)
        {
            if (op.patch.isEditorMode())
            {
                const name = "Ops.Custom.CUSTOM" + op.id.replace(/-/g, "");
                const code = inJS.get();
                let codeHead = "Ops.Custom = Ops.Custom || {};\n";
                codeHead += name + " = class extends CABLES.Op \n{";
                codeHead += "constructor()\n{ super(...arguments);\nconst op=this;const attachments=op.attachments={};\n";
                let codeFoot = "\n}\n};\n\n";
                codeFoot += "new " + name + "();\n";
                const opCode = codeHead + code + codeFoot;
                op.setUiError("error", e);
                const errorEl = document.createElement("script");
                errorEl.id = "customop-error-" + op.id;
                errorEl.type = "text/javascript";
                errorEl.innerHTML = opCode;
                document.body.appendChild(errorEl);
            }
            else
            {
                op.log("error executing javascript code", e);
            }
        }
    }
};
