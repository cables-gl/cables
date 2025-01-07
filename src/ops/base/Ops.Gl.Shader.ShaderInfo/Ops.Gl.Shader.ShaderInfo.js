
const
    exec = op.inTrigger("Exec"),
    showFrag = op.inTriggerButton("Show Fragment"),
    showVert = op.inTriggerButton("Show Vertex"),
    showModules = op.inTriggerButton("Show Modules"),
    showUniforms = op.inTriggerButton("Show Uniforms"),
    showState = op.inTriggerButton("State Info"),
    next = op.outTrigger("Next"),

    outSrcFrag = op.outString("Source Frag"),
    outSrcVert = op.outString("Source Vert"),

    outName = op.outString("Name"),
    outId = op.outString("Id"),
    outNeedsBarycentric = op.outBoolNum("needsBarycentric"),
    outNumUniforms = op.outNumber("Num Uniforms"),
    outNumAttributes = op.outNumber("Num Attributes"),
    outAttributeNames = op.outArray("Arributes Names"),
    outDefines = op.outArray("Num Defines");

const cgl = op.patch.cgl;
let shader = null;

function showCodeModal(title, code, type)
{
    if (!CABLES.UI)
    {
        op.log(title, code);
    }

    let html = "";
    html += "<h2>Code</h2>";
    html += "<b>" + title + "</b> ";
    html += "<br/><br/>";
    html += "<br/><br/>";

    code = code || "";
    code = code.replace(/\</g, "&lt;"); // for <
    code = code.replace(/\>/g, "&gt;"); // for >

    html += "<pre><code class=\"" + (type || "javascript") + "\">" + code + "</code></pre>";

    new ModalDialog({
        "title": title,
        "html": html
    });
}

showFrag.onTriggered = function ()
{
    if (CABLES.UI && shader) showCodeModal("fragment shader", shader.finalShaderFrag, "GLSL");
};

showVert.onTriggered = function ()
{
    if (CABLES.UI && shader) showCodeModal("vertex shader", shader.finalShaderVert, "GLSL");
};

let doStateDump = false;
let doUniformDump = false;

showState.onTriggered = function ()
{
    doStateDump = true;
};

showUniforms.onTriggered = function ()
{
    doUniformDump = true;
};

exec.onTriggered = function ()
{
    if (cgl.tempData.shadowPass) return;
    const theShader = cgl.getShader();

    // if (theShader && shader && (theShader == shader || shader.lastCompile == theShader.lastCompile)) return next.trigger();

    shader = theShader;
    next.trigger();

    shader.bind();

    if (!shader.getProgram()) op.setUiError("prognull", "Shader is not compiled");
    else op.setUiError("prognull", null);

    if (!shader) op.setUiError("noshader", "No Shader..");
    else op.setUiError("noshader", null);

    if (shader && shader.getProgram())
    {
        const activeUniforms = cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_UNIFORMS);
        outNumUniforms.set(activeUniforms);
        outNumAttributes.set(cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_ATTRIBUTES));

        let i = 0;
        const attribNames = [];
        for (i = 0; i < cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_ATTRIBUTES); i++)
        {
            const name = cgl.gl.getActiveAttrib(shader.getProgram(), i).name;
            attribNames.push(name);
        }
        outAttributeNames.set(attribNames);
        outDefines.set(shader.getDefines());
        outName.set(shader.getName());
        outNeedsBarycentric.set(shader.wireframe);
        outId.set(shader.id);

        op.setUiError("prognull", null);
    }
    else
    {
        outNumUniforms.set(0);
        outNumAttributes.set(0);
        outDefines.set(0);
        outAttributeNames.set(null);
    }

    if (doUniformDump)
    {
        const json = [];
        for (let i = 0; i < shader._uniforms.length; i++)
        {
            json.push({
                "validLoc": shader._uniforms[i]._isValidLoc(),
                "name": shader._uniforms[i]._name,
                "type": shader._uniforms[i]._type,
                "value": shader._uniforms[i]._value,
                "structName": shader._uniforms[i]._structName,
                "structUniformName": shader._uniforms[i]._structUniformName
            });
        }

        showCodeModal("shader uniforms", JSON.stringify(json, false, 2), "json");

        doUniformDump = false;
    }

    if (doStateDump)
    {
        doStateDump = false;
        stateDump();
    }

    outSrcFrag.set(shader.finalShaderFrag);
    outSrcVert.set(shader.finalShaderVert);
};

function stateDump()
{
    let txt = "";
    txt += "";

    txt += "defines (" + outDefines.get().length + ")\n\n";

    for (let i = 0; i < outDefines.get().length; i++)
    {
        txt += "- ";
        txt += outDefines.get()[i][0];
        if (outDefines.get()[i][1])
        {
            txt += ": ";
            txt += outDefines.get()[i][1];
        }
        txt += "\n";
    }

    txt += "\n\n";
    txt += "texturestack (" + shader._textureStackUni.length + ")\n\n";

    for (let i = 0; i < shader._textureStackUni.length; i++)
    {
        txt += "- ";
        txt += shader._textureStackUni[i]._name;
        txt += "(" + shader._textureStackUni[i].shaderType + ")\n";
        if (shader._textureStackTexCgl[i]) txt += JSON.stringify(shader._textureStackTexCgl[i].getInfo());
        txt += "\n";
    }

    txt += "\n\n";
    txt += "uniforms: (" + shader._uniforms.length + ")\n\n";

    for (let i = 0; i < shader._uniforms.length; i++)
    {
        txt += "- ";
        txt += shader._uniforms[i]._name;
        txt += ": ";
        txt += shader._uniforms[i].getValue();

        if (shader._uniforms[i].comment)
        {
            txt += " // ";
            txt += shader._uniforms[i].comment;
        }
        txt += "\n";
    }

    showCodeModal("state info", txt);
}

showModules.onTriggered = function ()
{
    if (!shader) return;
    const mods = shader.getCurrentModules();

    showCodeModal("vertex shader", JSON.stringify(mods, false, 4), "json");
};
