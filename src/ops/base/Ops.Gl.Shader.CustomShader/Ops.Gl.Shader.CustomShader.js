const render = op.inTrigger("render");
const fragmentShader = op.addInPort(new CABLES.Port(op, "fragment", CABLES.OP_PORT_TYPE_VALUE, { "display": "editor", "editorSyntax": "glsl" }));
const vertexShader = op.addInPort(new CABLES.Port(op, "vertex", CABLES.OP_PORT_TYPE_VALUE, { "display": "editor", "editorSyntax": "glsl" }));

const trigger = op.outTrigger("trigger");
const outShader = op.outObject("Shader");
const cgl = op.patch.cgl;
const uniformInputs = [];
const uniformTextures = [];


op.toWorkPortsNeedToBeLinked(outShader);


const shader = new CGL.Shader(cgl, "shaderMaterial");
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

// shader.glslVersion=0;

op.setPortGroup("Source Code", [fragmentShader, vertexShader]);

fragmentShader.set(CGL.Shader.getDefaultFragmentShader());
vertexShader.set(CGL.Shader.getDefaultVertexShader());
shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
fragmentShader.onChange = updateLater;
vertexShader.onChange = updateLater;
render.onTriggered = doRender;

let needsUpdate = true;
op.onLoadedValueSet = initDataOnLoad;

function initDataOnLoad(data)
{
    updateShader();

    // set uniform values AFTER shader has been compiled and uniforms are extracted and uniform ports are created.

    for (let i = 0; i < uniformInputs.length; i++)
        for (let j = 0; j < data.portsIn.length; j++)
            if (uniformInputs[i].name == data.portsIn[j].name)
                uniformInputs[i].set(data.portsIn[j].value);
}

function updateLater()
{
    needsUpdate = true;
}

op.init = function ()
{
    updateShader();
};

function doRender()
{
    if (needsUpdate)updateShader();
    trigger.trigger();
}

function bindTextures()
{
    for (let i = 0; i < uniformTextures.length; i++)
    {
        if (uniformTextures[i] && uniformTextures[i].get() && uniformTextures[i].get().tex)
        {
            cgl.setTexture(0 + i + 3, uniformTextures[i].get().tex);
        }
    }
}

function hasUniformInput(name)
{
    let i = 0;
    for (i = 0; i < uniformInputs.length; i++) if (uniformInputs[i].name == name) return true;
    for (i = 0; i < uniformTextures.length; i++) if (uniformTextures[i].name == name) return true;
    return false;
}

const tempMat4 = mat4.create();
// var lastm4;

const uniformNameBlacklist = [
    "modelMatrix",
    "viewMatrix",
    "normalMatrix",
    "mvMatrix",
    "projMatrix",
    "inverseViewMatrix",
    "camPos"
];


function updateShader()
{
    if (!shader) return;
    needsUpdate = false;

    // shader.glslVersion=0;
    shader.bindTextures = bindTextures.bind(this);
    shader.setSource(vertexShader.get(), fragmentShader.get());

    shader.compile();


    const activeUniforms = cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_UNIFORMS);

    let i = 0;
    let countTexture = 0;
    for (i = 0; i < activeUniforms; i++)
    {
        const uniform = cgl.gl.getActiveUniform(shader.getProgram(), i);

        if (
            hasUniformInput(uniform.name) ||
			uniform.name.indexOf("mod") == 0 ||
			uniformNameBlacklist.indexOf(uniform.name) != -1
        )
		    continue;

        if (uniform.type == cgl.gl.FLOAT)
        {
            let newInput = null;
            if (uniform.size > 1)
            {
                newInput = op.inArray(uniform.name, []);

                newInput.uniform = new CGL.Uniform(shader, "f[]", uniform.name, new Float32Array(22));

                newInput.onChange = function (p)
                {
                    p.uniform.needsUpdate = true;
                    p.uniform.setValue(new Float32Array(p.get()));
                };
            }
            else
            {
                newInput = op.inValue(uniform.name, 0);
                newInput.uniform = new CGL.Uniform(shader, "f", uniform.name, newInput);
                newInput.onChange = function (p)
                {
                    p.uniform.needsUpdate = true;
                    p.uniform.setValue(p.get());
                };
            }

            uniformInputs.push(newInput);
        }
        else
        if (uniform.type == cgl.gl.FLOAT_MAT4)
        {
            const newInputM4 = op.inArray(uniform.name);
            newInputM4.onChange = function (p)
            {
                if (p.get() && p.isLinked())
                {
                    mat4.copy(tempMat4, p.get());
                    p.uniform.needsUpdate = true;
                    p.uniform.setValue(tempMat4);
                }
            };

            uniformInputs.push(newInputM4);
            // lastm4=newInputM4;
            newInputM4.uniform = new CGL.Uniform(shader, "m4", uniform.name, mat4.create());
        }
        else
        if (uniform.type == cgl.gl.SAMPLER_2D)
        {
            const newInputTex = op.inObject(uniform.name);
            newInputTex.uniform = new CGL.Uniform(shader, "t", uniform.name, 3 + countTexture);
            uniformTextures.push(newInputTex);
            countTexture++;
        }
        else
        {
            op.logError("unsupported uniform type", uniform.type, uniform);
        }
    }

    for (i = 0; i < uniformInputs.length; i++)
    {
        uniformInputs[i].uniform.needsUpdate = true;
    }

    op.refreshParams();


    outShader.set(null);
    outShader.set(shader);
}


// 0x8B50: 'FLOAT_VEC2',
// 0x8B51: 'FLOAT_VEC3',
// 0x8B52: 'FLOAT_VEC4',
// 0x8B53: 'INT_VEC2',
// 0x8B54: 'INT_VEC3',
// 0x8B55: 'INT_VEC4',
// 0x8B56: 'BOOL',
// 0x8B57: 'BOOL_VEC2',
// 0x8B58: 'BOOL_VEC3',
// 0x8B59: 'BOOL_VEC4',
// 0x8B5A: 'FLOAT_MAT2',
// 0x8B5B: 'FLOAT_MAT3',
// 0x8B5C: 'FLOAT_MAT4',
// 0x8B5E: 'SAMPLER_2D',
// 0x8B60: 'SAMPLER_CUBE',
// 0x1400: 'BYTE',
// 0x1401: 'UNSIGNED_BYTE',
// 0x1402: 'SHORT',
// 0x1403: 'UNSIGNED_SHORT',
// 0x1404: 'INT',
// 0x1405: 'UNSIGNED_INT',
// 0x1406: 'FLOAT'


updateShader();
