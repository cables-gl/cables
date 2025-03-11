const
    render = op.inTrigger("render"),
    fragmentShader = op.inStringEditor("Fragment Code"),
    vertexShader = op.inStringEditor("Vertex Code"),
    asMaterial = op.inValueBool("Use As Material", true),
    trigger = op.outTrigger("trigger"),
    outShader = op.outObject("Shader", null, "shader"),
    outErrors = op.outBool("Has Errors");

const texSlotOff = 7;
const cgl = op.patch.cgl;
const uniformInputs = [];
const uniformTextures = [];
const vectors = [];

op.toWorkPortsNeedToBeLinked(render);

fragmentShader.setUiAttribs({ "editorSyntax": "glsl" });
vertexShader.setUiAttribs({ "editorSyntax": "glsl" });

const shader = new CGL.Shader(cgl, "customshader", op);

shader.logError = false;
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG", "MODULE_VERTEX_MODELVIEW"]);

op.setPortGroup("Source Code", [fragmentShader, vertexShader]);
op.setPortGroup("Options", [asMaterial]);

fragmentShader.set(CGL.Shader.getDefaultFragmentShader());
vertexShader.set(CGL.Shader.getDefaultVertexShader());

fragmentShader.onChange = vertexShader.onChange = function ()
{
    if (fragmentShader.isLinked() && !fragmentShader.get()) return;
    needsUpdate = true;
};

render.onTriggered = doRender;

let updateCount = 0;
let needsUpdate = true;
op.onLoadedValueSet = initDataOnLoad;

function initDataOnLoad(data)
{
    updateShader();
    if (!data) return;

    // set uniform values AFTER shader has been compiled and uniforms are extracted and uniform ports are created.
    for (let i = 0; i < uniformInputs.length; i++)
        for (let j = 0; j < data.portsIn.length; j++)
            if (uniformInputs[i] && uniformInputs[i].name == data.portsIn[j].name)
            {
                uniformInputs[i].set(data.portsIn[j].value);
                uniformInputs[i].deSerializeSettings(data.portsIn[j]);
            }
}

op.init = function ()
{
    updateShader();
};

function doRender()
{
    setVectorValues();
    if (needsUpdate)updateShader();
    if (asMaterial.get()) cgl.pushShader(shader);
    pushTextures();
    trigger.trigger();
    shader.popTextures();
    if (asMaterial.get()) cgl.popShader();
}

function pushTextures()
{
    for (let i = 0; i < uniformTextures.length; i++)
        if (uniformTextures[i] && uniformTextures[i].get() && uniformTextures[i].get().tex)
            shader.pushTexture(uniformTextures[i].uniform, uniformTextures[i].get().tex);
        else
            shader.pushTexture(uniformTextures[i], CGL.Texture.getEmptyTexture(cgl));
}

function bindTextures()// old - should be removed in next version ?
{
    for (let i = 0; i < uniformTextures.length; i++)
        if (uniformTextures[i] && uniformTextures[i].get() && uniformTextures[i].get().tex)
            cgl.setTexture(0 + i + texSlotOff, uniformTextures[i].get().tex);
}

function hasUniformInput(name)
{
    for (let i = 0; i < uniformInputs.length; i++) if (uniformInputs[i] && uniformInputs[i].name == name) return true;
    for (let i = 0; i < uniformTextures.length; i++) if (uniformTextures[i] && uniformTextures[i].name == name) return true;
    return false;
}

const tempMat4 = mat4.create();
const uniformNameBlacklist = [
    "modelMatrix",
    "viewMatrix",
    "normalMatrix",
    "mvMatrix",
    "projMatrix",
    "inverseViewMatrix",
    "camPos"
];

let countTexture = 0;
const foundNames = [];

function parseUniforms(src)
{
    const lblines = src.split("\n");
    const groupUniforms = [];

    for (let k = 0; k < lblines.length; k++)
    {
        const lines = lblines[k].split(";");

        for (let i = 0; i < lines.length; i++)
        {
            let words = lines[i].split(" ");

            for (let j = 0; j < words.length; j++) words[j] = (words[j] + "").trim();

            if (words[0] === "UNI" || words[0] === "uniform")
            {
                let varnames = words[2];
                if (words.length > 4) for (let j = 3; j < words.length; j++)varnames += words[j];

                words = words.filter(function (el) { return el !== ""; });
                const type = words[1];

                let names = [];
                if (varnames)
                {
                    names = [varnames];
                    if (varnames.indexOf(",") > -1) names = varnames.split(",");
                }

                for (let l = 0; l < names.length; l++)
                {
                    if (uniformNameBlacklist.indexOf(names[l]) > -1) continue;
                    const uniName = names[l].trim().replace(/\[\d+\]$/, "");

                    if (type === "float")
                    {
                        foundNames.push(uniName);
                        if (!hasUniformInput(uniName))
                        {
                            const arrayMatch = names[l].trim().match(/\[\d+\]$/);
                            if (arrayMatch)
                            {
                                const arrayLength = parseInt(arrayMatch[0].trim().slice(1, -1));

                                const newInput = op.inArray(uniName, []);
                                newInput.uniform = new CGL.Uniform(shader, "f[]", uniName, new Float32Array(arrayLength));
                                uniformInputs.push(newInput);
                                groupUniforms.push(newInput);

                                const vec = {
                                    "name": uniName,
                                    "num": arrayLength,
                                    "port": newInput,
                                    "uni": newInput.uniform,
                                    "changed": false
                                };
                                newInput.onChange = function () { this.changed = true; }.bind(vec);

                                vectors.push(vec);
                            }
                            else
                            {
                                const newInput = op.inFloat(uniName, 0);
                                newInput.uniform = new CGL.Uniform(shader, "f", uniName, newInput);
                                uniformInputs.push(newInput);
                                groupUniforms.push(newInput);
                            }
                        }
                    }
                    else if (type === "int")
                    {
                        foundNames.push(uniName);
                        if (!hasUniformInput(uniName))
                        {
                            const newInput = op.inInt(uniName, 0);
                            newInput.uniform = new CGL.Uniform(shader, "i", uniName, newInput);
                            uniformInputs.push(newInput);
                            groupUniforms.push(newInput);
                        }
                    }
                    else if (type === "bool")
                    {
                        foundNames.push(uniName);
                        if (!hasUniformInput(uniName))
                        {
                            const newInput = op.inBool(uniName, false);
                            newInput.uniform = new CGL.Uniform(shader, "b", uniName, newInput);
                            uniformInputs.push(newInput);
                            groupUniforms.push(newInput);
                        }
                    }
                    else if (type === "mat4")
                    {
                        foundNames.push(uniName);
                        if (!hasUniformInput(uniName))
                        {
                            const newInput = op.inArray(uniName, 0);
                            newInput.uniform = new CGL.Uniform(shader, "m4", uniName, newInput);
                            uniformInputs.push(newInput);
                            groupUniforms.push(newInput);

                            const vec = {
                                "name": uniName,
                                "num": 16,
                                "port": newInput,
                                "uni": newInput.uniform,
                                "changed": false
                            };
                            newInput.onChange = function () { this.changed = true; }.bind(vec);

                            vectors.push(vec);
                        }
                    }
                    else if (type === "sampler2D" || type === "samplerCube")
                    {
                        foundNames.push(uniName);
                        if (!hasUniformInput(uniName))
                        {
                            const newInputTex = op.inObject(uniName);

                            let uniType = "t";
                            if (type === "samplerCube")uniType = "tc";

                            newInputTex.uniform = new CGL.Uniform(shader, uniType, uniName, texSlotOff + uniformTextures.length);
                            uniformTextures.push(newInputTex);
                            groupUniforms.push(newInputTex);
                            newInputTex.set(CGL.Texture.getTempTexture(cgl));
                            newInputTex.on("change", (v, p) =>
                            {
                                if (!v)p.set(CGL.Texture.getTempTexture(cgl));
                            });
                            countTexture++;
                        }
                    }
                    else if (type === "vec3" || type === "vec2" || type === "vec4")
                    {
                        let num = 2;
                        if (type === "vec4")num = 4;
                        if (type === "vec3")num = 3;
                        foundNames.push(uniName + " X");
                        foundNames.push(uniName + " Y");
                        if (num > 2)foundNames.push(uniName + " Z");
                        if (num > 3)foundNames.push(uniName + " W");

                        if (!hasUniformInput(uniName + " X"))
                        {
                            const group = [];
                            const vec = {
                                "name": uniName,
                                "num": num,
                                "changed": false,
                            };
                            vectors.push(vec);
                            initVectorUniform(vec);

                            const newInputX = op.inFloat(uniName + " X", 0);
                            newInputX.onChange = function () { this.changed = true; }.bind(vec);
                            uniformInputs.push(newInputX);
                            group.push(newInputX);
                            vec.x = newInputX;

                            const newInputY = op.inFloat(uniName + " Y", 0);
                            newInputY.onChange = function () { this.changed = true; }.bind(vec);
                            uniformInputs.push(newInputY);
                            group.push(newInputY);
                            vec.y = newInputY;

                            if (num > 2)
                            {
                                const newInputZ = op.inFloat(uniName + " Z", 0);
                                newInputZ.onChange = function () { this.changed = true; }.bind(vec);
                                uniformInputs.push(newInputZ);
                                group.push(newInputZ);
                                vec.z = newInputZ;
                            }
                            if (num > 3)
                            {
                                const newInputW = op.inFloat(uniName + " W", 0);
                                newInputW.onChange = function () { this.changed = true; }.bind(vec);
                                uniformInputs.push(newInputW);
                                group.push(newInputW);
                                vec.w = newInputW;
                            }

                            op.setPortGroup(uniName, group);
                        }
                    }
                }
            }
        }
    }
    op.setPortGroup("uniforms", groupUniforms);
}

function updateShader()
{
    if (!shader) return;
    let manual = false;
    updateCount++;
    if (updateCount > 2)manual = true;

    // shader.bindTextures = bindTextures.bind(this);
    shader.setSource(vertexShader.get(), fragmentShader.get(), manual);

    if (cgl.glVersion == 1)
    {
        cgl.enableExtension("OES_standard_derivatives");
        // cgl.enableExtension('OES_texture_float');
        // cgl.enableExtension('OES_texture_float_linear');
        // cgl.enableExtension('OES_texture_half_float');
        // cgl.enableExtension('OES_texture_half_float_linear');

        shader.enableExtension("GL_OES_standard_derivatives");
    // shader.enableExtension("GL_OES_texture_float");
    // shader.enableExtension("GL_OES_texture_float_linear");
    // shader.enableExtension("GL_OES_texture_half_float");
    // shader.enableExtension("GL_OES_texture_half_float_linear");
    }

    countTexture = 0;
    foundNames.length = 0;

    parseUniforms(vertexShader.get());
    parseUniforms(fragmentShader.get());

    for (let j = 0; j < uniformTextures.length; j++)
        for (let i = 0; i < foundNames.length; i++)
            if (uniformTextures[j] && foundNames.indexOf(uniformTextures[j].name) == -1)
            {
                uniformTextures[j].remove();
                uniformTextures[j] = null;
            }

    for (let j = 0; j < uniformInputs.length; j++)
        for (let i = 0; i < foundNames.length; i++)
            if (uniformInputs[j] && foundNames.indexOf(uniformInputs[j].name) == -1)
            {
                uniformInputs[j].remove();
                uniformInputs[j] = null;
            }

    for (let j = 0; j < vectors.length; j++)
    {
        initVectorUniform(vectors[j]);
        vectors[j].changed = true;
    }

    for (let i = 0; i < uniformInputs.length; i++)
        if (uniformInputs[i] && uniformInputs[i].uniform) uniformInputs[i].uniform.needsUpdate = true;

    shader.compile();

    op.refreshParams();

    // outShader.set(null);
    outShader.setRef(shader);
    needsUpdate = false;

    if (shader.hasErrors()) op.setUiError("compile", "Shader has errors", 2, { "button": "show",
        "buttonCb": () =>
        {
            CABLES.UI.showShaderError(shader);
        } });
    else op.setUiError("compile", null);

    outErrors.set(shader.hasErrors());
}

function initVectorUniform(vec)
{
    if (vec.num == 2) vec.uni = new CGL.Uniform(shader, "2f", vec.name, [0, 0]);
    else if (vec.num == 3) vec.uni = new CGL.Uniform(shader, "3f", vec.name, [0, 0, 0]);
    else if (vec.num == 4) vec.uni = new CGL.Uniform(shader, "4f", vec.name, [0, 0, 0, 0]);
}

function setVectorValues()
{
    for (let i = 0; i < vectors.length; i++)
    {
        const v = vectors[i];
        if (v.changed)
        {
            if (v.num === 2) v.uni.setValue([v.x.get(), v.y.get()]);
            else if (v.num === 3) v.uni.setValue([v.x.get(), v.y.get(), v.z.get()]);
            else if (v.num === 4) v.uni.setValue([v.x.get(), v.y.get(), v.z.get(), v.w.get()]);

            else if (v.num > 4)
            {
                v.uni.setValue(v.port.get());
            }

            v.changed = false;
        }
    }
}
