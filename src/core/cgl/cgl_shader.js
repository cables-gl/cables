import { ShaderLibMods } from "./cgl_shader_lib";
import { now } from "../timer";
import { simpleId, generateUUID } from "../utils";
import { MESH } from "./cgl_mesh";
// import { CGL } from "./index";
import { profileData } from "./cgl_profiledata";
import { CONSTANTS } from "./constants";
import { Log } from "../log";
import { escapeHTML } from "./cgl_utils";
// ---------------------------------------------------------------------------
export const SHADER_VARS = {
    "profileShaderBinds": 0,
    // profileUniformCount: 0,
    "profileShaderCompiles": 0,
    "profileVideosPlaying": 0,
    "profileMVPMatrixCount": 0,

    // default attributes
    "SHADERVAR_VERTEX_POSITION": "vPosition",
    "SHADERVAR_VERTEX_NUMBER": "attrVertIndex",
    "SHADERVAR_VERTEX_TEXCOORD": "attrTexCoord",
    "SHADERVAR_INSTANCE_MMATRIX": "instMat",

    // default uniforms
    "SHADERVAR_UNI_PROJMAT": "projMatrix",
    "SHADERVAR_UNI_VIEWMAT": "viewMatrix",
    "SHADERVAR_UNI_MODELMAT": "modelMatrix",
    "SHADERVAR_UNI_NORMALMAT": "normalMatrix",
    "SHADERVAR_UNI_INVVIEWMAT": "inverseViewMatrix",
    "SHADERVAR_UNI_VIEWPOS": "camPos",
};


/*

proposal default shader variable names:

attrVertex - currently: vPosition
attrVertexIndex - currently: attrVertIndex
attrTexCoord
attrInstMat - currently: instMat
attrVertColor
attrTangent
attrBiTangent

uProjMatrix - currently: projMatrix
uModelMatrix - currently: modelMatrix
uNormalMatrix - currently: normalMatrix
uCamPosition - currently: camPos

*/


// ---------------------------------------------------------------------------


/**
 * @class
 * @external CGL
 * @namespace Shader
 * @hideconstructor
 * @example
 * var shader=new CGL.Shader(cgl,'MinimalMaterial');
 * shader.setSource(attachments.shader_vert,attachments.shader_frag);
 */
const Shader = function (_cgl, _name)
{
    if (!_cgl) throw new Error("shader constructed without cgl " + _name);

    this._cgl = _cgl;
    this._name = _name || "unknown";
    this.glslVersion = 0;
    if (_cgl.glVersion > 1) this.glslVersion = 300;

    this.id = simpleId();
    this._program = null;
    this._uniforms = [];
    this._drawBuffers = [true];
    this._defines = [];
    this._needsRecompile = true;

    this._projMatrixUniform = null;
    this._mvMatrixUniform = null;
    this._mMatrixUniform = null;
    this._vMatrixUniform = null;
    this._camPosUniform = null;
    this._normalMatrixUniform = null;
    this._inverseViewMatrixUniform = null;

    this._attrVertexPos = -1;
    this.precision = _cgl.patch.config.glslPrecision || "highp";

    this._pMatrixState = -1;
    this._vMatrixState = -1;

    this._modGroupCount = 0; // not needed anymore...
    this._feedBackNames = [];
    this._attributes = [];

    this.glPrimitive = null;
    this.offScreenPass = false;
    this._extensions = [];
    this.srcVert = this.getDefaultVertexShader();
    this.srcFrag = this.getDefaultFragmentShader();
    this.lastCompile = 0;

    this._moduleNames = [];
    this._modules = [];
    this._moduleNumId = 0;

    this._libs = [];
    this._structNames = [];
    this._structUniformNames = [];
    this._textureStackUni = [];
    this._textureStackTex = [];
    this._textureStackType = [];
    this._textureStackTexCgl = [];

    this._tempNormalMatrix = mat4.create();
    this._tempCamPosMatrix = mat4.create();
    this._tempInverseViewMatrix = mat4.create();

    this.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
};

Shader.prototype.getCgl = function ()
{
    return this._cgl;
};

Shader.prototype.getName = function ()
{
    return this._name;
};

/**
 * enable an extension for the shader
 * @function enableExtension
 * @memberof Shader
 * @instance
 * @param name extension name
 */
Shader.prototype.enableExtension = function (name)
{
    this.setWhyCompile("enable extension " + name);
    this._needsRecompile = true;
    this._extensions.push(name);
};

Shader.prototype.getAttrVertexPos = function ()
{
    return this._attrVertexPos;
};

Shader.prototype.hasTextureUniforms = function ()
{
    for (let i = 0; i < this._uniforms.length; i++)
        if (this._uniforms[i].getType() == "t") return true;
    return false;
};

Shader.prototype.setWhyCompile = function (why)
{
    // Log.log('recompile because '+why);
};


/**
 * copy all uniform values from another shader
 * @function copyUniforms
 * @memberof Shader
 * @instance
 * @param shader uniform values will be copied from this shader
 */
Shader.prototype.copyUniformValues = function (origShader)
{
    for (let i = 0; i < origShader._uniforms.length; i++)
    {
        if (!this._uniforms[i])
        {
            // console.log("unknown uniform?!");
            continue;
        }

        this._uniforms[i].set(origShader._uniforms[i].getValue());
    }

    this.popTextures();
    for (let i = 0; i < origShader._textureStackUni.length; i++)
    {
        this._textureStackUni[i] = origShader._textureStackUni[i];
        this._textureStackTex[i] = origShader._textureStackTex[i];
        this._textureStackType[i] = origShader._textureStackType[i];
        this._textureStackTexCgl[i] = origShader._textureStackTexCgl[i];
    }

    // this._textureStackUni = [];
    // this._textureStackTex = [];
    // this._textureStackType = [];
    // this._textureStackTexCgl = [];
};

/**
 * copy current shader
 * @function copy
 * @memberof Shader
 * @instance
 * @returns newShader
 */
Shader.prototype.copy = function ()
{
    const shader = new Shader(this._cgl, this._name + " copy");
    shader.setSource(this.srcVert, this.srcFrag);

    shader._modules = JSON.parse(JSON.stringify(this._modules));
    shader._defines = JSON.parse(JSON.stringify(this._defines));

    shader._modGroupCount = this._modGroupCount;
    shader._moduleNames = this._moduleNames;
    shader.glPrimitive = this.glPrimitive;
    shader.offScreenPass = this.offScreenPass;
    for (let i = 0; i < this._uniforms.length; i++)
    {
        const u = this._uniforms[i].copy(shader);
        u.resetLoc();
    }

    shader._needsRecompile = true;
    return shader;
};


/**
 * set shader source code
 * @function setSource
 * @memberof Shader
 * @instance
 * @param {String} srcVert
 * @param {String} srcFrag
 */
Shader.prototype.setSource = function (srcVert, srcFrag)
{
    this.srcVert = srcVert;
    this.srcFrag = srcFrag;
    this.setWhyCompile("Source changed");
    this._needsRecompile = true;
};

Shader.prototype._addLibs = function (src)
{
    for (const id in ShaderLibMods)
    {
        if (src.indexOf(id) > -1)
        {
            const lib = new ShaderLibMods[id]();
            src = src.replace("{{" + id + "}}", lib.srcHeadFrag);
            this._libs.push(lib);
            if (lib.initUniforms)lib.initUniforms(this);
        }
    }

    return src;
};

Shader.prototype.createStructUniforms = function ()
{
    // * create structs
    let structStrFrag = "";
    let structStrVert = ""; // TODO: not used yet

    this._structNames = [];
    // * reset the arrays holding the value each recompile so we don't skip structs
    // * key value mapping so the same struct can be added twice (two times the same modifier)
    this._injectedStringsFrag = {};
    this._injectedStringsVert = {};

    this._structUniformNamesIndicesFrag = [];
    this._structUniformNamesIndicesVert = [];

    for (let i = 0; i < this._uniforms.length; i++)
    {
        // * only add uniforms to struct that are a member of a struct
        if (this._uniforms[i].isStructMember())
        {
            const injectionString = "{{INJECTION_POINT_STRUCT_" + this._uniforms[i]._structName + "}}";

            // * check if struct is not already part of shader
            if (this._structNames.indexOf(this._uniforms[i]._structName) === -1)
            {
                // * create struct definition with placeholder string to inject
                const structDefinition = "struct "
                    + this._uniforms[i]._structName + " {".endl()
                    + injectionString
                    + "};".endl().endl();

                if (this._uniforms[i].getShaderType() === "both" || this._uniforms[i].getShaderType() === "frag")
                    structStrFrag = structStrFrag.concat(structDefinition);

                if (this._uniforms[i].getShaderType() === "both" || this._uniforms[i].getShaderType() === "vert")
                    structStrVert = structStrVert.concat(structDefinition);

                this._structNames.push(this._uniforms[i]._structName);
                this._injectedStringsFrag[this._uniforms[i]._structName] = [];
                this._injectedStringsVert[this._uniforms[i]._structName] = [];
            }

            // * create member & comment
            let comment = "";
            if (this._uniforms[i].comment) comment = " // " + this._uniforms[i].comment;

            const stringToInsert = "  " + this._uniforms[i].getGlslTypeString()
                 + " " + this._uniforms[i]._propertyName + ";"
                 + comment;

            if (this._uniforms[i].getShaderType() === "both")
            {
                // * inject member before {injectionString}
                if (
                    this._injectedStringsFrag[this._uniforms[i]._structName].indexOf(stringToInsert) === -1
                && this._injectedStringsVert[this._uniforms[i]._structName].indexOf(stringToInsert) === -1)
                {
                    const insertionIndexFrag = structStrFrag.lastIndexOf(injectionString);
                    const insertionIndexVert = structStrVert.lastIndexOf(injectionString);

                    structStrFrag =
                        structStrFrag.slice(0, insertionIndexFrag)
                        + stringToInsert + structStrFrag.slice(insertionIndexFrag - 1);

                    structStrVert =
                        structStrVert.slice(0, insertionIndexVert)
                        + stringToInsert + structStrVert.slice(insertionIndexVert - 1);

                    this._injectedStringsFrag[this._uniforms[i]._structName].push(stringToInsert);
                    this._injectedStringsVert[this._uniforms[i]._structName].push(stringToInsert);
                }

                if (this._structUniformNamesIndicesFrag.indexOf(i) === -1) this._structUniformNamesIndicesFrag.push(i);
                if (this._structUniformNamesIndicesVert.indexOf(i) === -1) this._structUniformNamesIndicesVert.push(i);
            }
            else if (this._uniforms[i].getShaderType() === "frag")
            {
                // * inject member before {injectionString}
                if (this._injectedStringsFrag[this._uniforms[i]._structName].indexOf(stringToInsert) === -1)
                {
                    const insertionIndexFrag = structStrFrag.lastIndexOf(injectionString);

                    structStrFrag =
                        structStrFrag.slice(0, insertionIndexFrag)
                        + stringToInsert + structStrFrag.slice(insertionIndexFrag - 1);

                    this._injectedStringsFrag[this._uniforms[i]._structName].push(stringToInsert);
                }

                if (this._structUniformNamesIndicesFrag.indexOf(i) === -1) this._structUniformNamesIndicesFrag.push(i);
            }
            else if (this._uniforms[i].getShaderType() === "vert")
            {
                // * inject member before {injectionString}
                if (this._injectedStringsVert[this._uniforms[i]._structName].indexOf(stringToInsert) === -1)
                {
                    const insertionIndexVert = structStrVert.lastIndexOf(injectionString);

                    structStrVert =
                        structStrVert.slice(0, insertionIndexVert)
                        + stringToInsert + structStrVert.slice(insertionIndexVert - 1);

                    this._injectedStringsVert[this._uniforms[i]._structName].push(stringToInsert);
                }

                if (this._structUniformNamesIndicesVert.indexOf(i) === -1) this._structUniformNamesIndicesVert.push(i);
            }
        }
    }

    // * dedupe injected uni declarations
    this._uniDeclarationsFrag = [];
    this._uniDeclarationsVert = [];

    // * remove struct injection points and add uniform in fragment
    for (let i = 0; i < this._structUniformNamesIndicesFrag.length; i += 1)
    {
        const index = this._structUniformNamesIndicesFrag[i];
        const uniDeclarationString = "UNI " + this._uniforms[index]._structName + " " + this._uniforms[index]._structUniformName + ";".endl();

        if (this._uniDeclarationsFrag.indexOf(uniDeclarationString) === -1)
        {
            const injectionString = "{{INJECTION_POINT_STRUCT_" + this._uniforms[index]._structName + "}}";

            structStrFrag = structStrFrag.replace(injectionString, "");
            structStrFrag += uniDeclarationString;

            this._uniDeclarationsFrag.push(uniDeclarationString);
        }
    }

    // * remove struct injection points and add uniform in vertex
    for (let i = 0; i < this._structUniformNamesIndicesVert.length; i += 1)
    {
        const index = this._structUniformNamesIndicesVert[i];
        const uniDeclarationString = "UNI " + this._uniforms[index]._structName + " " + this._uniforms[index]._structUniformName + ";".endl();

        if (this._uniDeclarationsVert.indexOf(uniDeclarationString) === -1)
        {
            const injectionString = "{{INJECTION_POINT_STRUCT_" + this._uniforms[index]._structName + "}}";

            structStrVert = structStrVert.replace(injectionString, "");
            structStrVert += uniDeclarationString;
            this._uniDeclarationsVert.push(uniDeclarationString);
        }
    }

    return [structStrVert, structStrFrag];
};

Shader.prototype.compile = function ()
{
    const startTime = performance.now();

    profileData.profileShaderCompiles++;
    profileData.profileShaderCompileName = this._name;


    let extensionString = "";
    if (this._extensions)
        for (let i = 0; i < this._extensions.length; i++)
            extensionString += "#extension " + this._extensions[i] + " : enable".endl();

    let definesStr = "";
    if (this._defines.length) definesStr = "\n// cgl generated".endl();
    for (let i = 0; i < this._defines.length; i++)
        definesStr += "#define " + this._defines[i][0] + " " + this._defines[i][1] + "".endl();

    const structStrings = this.createStructUniforms();

    if (this._uniforms)
        for (let i = 0; i < this._uniforms.length; i++)
            this._uniforms[i].resetLoc();

    if (this.hasTextureUniforms()) definesStr += "#define HAS_TEXTURES".endl();

    let vs = "";
    let fs = "";

    if (!this.srcFrag)
    {
        console.error("[cgl shader] has no fragment source!");
        this.srcVert = this.getDefaultVertexShader();
        this.srcFrag = this.getDefaultFragmentShader();
        // return;
    }

    if (this.glslVersion == 300)
    {
        let drawBufferStr = "";

        if (this.srcFrag.indexOf("outColor0") > -1) this._drawBuffers[0] = true;
        if (this.srcFrag.indexOf("outColor1") > -1) this._drawBuffers[1] = true;
        if (this.srcFrag.indexOf("outColor2") > -1) this._drawBuffers[2] = true;
        if (this.srcFrag.indexOf("outColor3") > -1) this._drawBuffers[3] = true;

        if (this._drawBuffers.length == 1)
        {
            // drawBufferStr+='#define gl_FragColor outColor'+i+''.endl();
            drawBufferStr = "out vec4 outColor;".endl();
            drawBufferStr += "#define gl_FragColor outColor".endl();
        }
        else
        {
            let count = 0;
            drawBufferStr += "vec4 outColor;".endl();

            for (let i = 0; i < this._drawBuffers.length; i++)
            {
                if (count == 0) drawBufferStr += "#define gl_FragColor outColor" + i + "".endl();
                drawBufferStr += "layout(location = " + i + ") out vec4 outColor" + i + ";".endl();
                count++;
            }
        }

        vs = "#version 300 es"
            .endl() + "// "
            .endl() + "// vertex shader " + this._name
            .endl() + "// "
            .endl() + "precision " + this.precision + " float;"
            .endl() + ""
            .endl() + "#define WEBGL2"
            .endl() + "#define texture2D texture"
            .endl() + "#define UNI uniform"
            .endl() + "#define IN in"
            .endl() + "#define OUT out"
            .endl();

        fs = "#version 300 es"
            .endl() + "// "
            .endl() + "// fragment shader " + this._name
            .endl() + "// "
            .endl() + "precision " + this.precision + " float;"
            .endl() + ""
            .endl() + "#define WEBGL2"
            .endl() + "#define texture2D texture"
            .endl() + "#define IN in"
            .endl() + "#define UNI uniform"
            .endl() + drawBufferStr

            .endl();
    }
    else
    {
        fs = ""
            .endl() + "// "
            .endl() + "// fragment shader " + this._name
            .endl() + "// "
            .endl() + "#define WEBGL1"
            .endl() + "#define texture texture2D"
            .endl() + "#define outColor gl_FragColor"
            .endl() + "#define IN varying"
            .endl() + "#define UNI uniform"
            .endl();

        vs = ""
            .endl() + "// "
            .endl() + "// vertex shader " + this._name
            .endl() + "// "
            .endl() + "#define WEBGL1"
            .endl() + "#define texture texture2D"
            .endl() + "#define OUT varying"
            .endl() + "#define IN attribute"
            .endl() + "#define UNI uniform"
            .endl();
    }

    let uniformsStrVert = "\n// cgl generated".endl();
    let uniformsStrFrag = "\n// cgl generated".endl();


    for (let i = 0; i < this._uniforms.length; i++)
    {
        if (this._uniforms[i].shaderType && !this._uniforms[i].isStructMember())
        {
            const uniStr = "UNI " + this._uniforms[i].getGlslTypeString() + " " + this._uniforms[i].getName();
            let comment = "";
            if (this._uniforms[i].comment) comment = " // " + this._uniforms[i].comment;

            if (this._uniforms[i].shaderType == "vert" || this._uniforms[i].shaderType == "both")
                if (this.srcVert.indexOf(uniStr) == -1 && this.srcVert.indexOf("uniform " + this._uniforms[i].getGlslTypeString() + " " + this._uniforms[i].getName()) == -1)
                    uniformsStrVert += uniStr + ";" + comment.endl();

            if (this._uniforms[i].shaderType == "frag" || this._uniforms[i].shaderType == "both")
                if (this.srcFrag.indexOf(uniStr) == -1 && this.srcFrag.indexOf("uniform " + this._uniforms[i].getGlslTypeString() + " " + this._uniforms[i].getName()) == -1)
                    uniformsStrFrag += uniStr + ";" + comment.endl();
        }
    }


    let countUniFrag = 0;
    let countUniVert = 0;
    for (let i = 0; i < this._uniforms.length; i++)
    {
        if (this._uniforms[i].shaderType && !this._uniforms[i].isStructMember())
        {
            if (this._uniforms[i].shaderType == "vert" || this._uniforms[i].shaderType == "both") countUniVert++;
            if (this._uniforms[i].shaderType == "frag" || this._uniforms[i].shaderType == "both") countUniFrag++;
        }
    }
    if (countUniFrag >= this._cgl.maxUniformsFrag) console.warn("[cgl_shader] num uniforms frag: " + countUniFrag + " / " + this._cgl.maxUniformsFrag);
    if (countUniVert >= this._cgl.maxUniformsVert) console.warn("[cgl_shader] num uniforms vert: " + countUniVert + " / " + this._cgl.maxUniformsVert);


    if (fs.indexOf("precision") == -1) fs = "precision " + this.precision + " float;".endl() + fs;
    if (vs.indexOf("precision") == -1) vs = "precision " + this.precision + " float;".endl() + vs;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    {
        fs += "#define MOBILE".endl();
        vs += "#define MOBILE".endl();
    }
    vs = extensionString + vs + definesStr + structStrings[0] + uniformsStrVert + "\n// -- \n" + this.srcVert;
    fs = extensionString + fs + definesStr + structStrings[1] + uniformsStrFrag + "\n// -- \n" + this.srcFrag;


    let srcHeadVert = "";
    let srcHeadFrag = "";

    this._modules.sort(function (a, b)
    {
        return a.group - b.group;
    });

    this._modules.sort(function (a, b)
    {
        return a.priority || 0 - b.priority || 0;
    });

    let addedAttributes = false;

    for (let i = 0; i < this._moduleNames.length; i++)
    {
        let srcVert = "";
        let srcFrag = "";

        for (let j = 0; j < this._modules.length; j++)
        {
            if (this._modules[j].name == this._moduleNames[i])
            {
                srcHeadVert += "\n//---- MOD: group:" + this._modules[j].group + ": idx:" + j + " - prfx:" + this._modules[j].prefix + " - " + this._modules[j].title + " ------\n";
                srcHeadFrag += "\n//---- MOD: group:" + this._modules[j].group + ": idx:" + j + " - prfx:" + this._modules[j].prefix + " - " + this._modules[j].title + " ------\n";

                srcVert += "\n\n//---- MOD: " + this._modules[j].title + " ------\n";
                srcFrag += "\n\n//---- MOD: " + this._modules[j].title + " ------\n";

                if (!addedAttributes)
                {
                    addedAttributes = true;

                    for (let k = 0; k < this._attributes.length; k++)
                    {
                        if (this._attributes[k].name && this._attributes[k].type)
                        {
                            srcHeadVert += ""
                                .endl() + "#ifndef ATTRIB_" + this._attributes[k].name
                                .endl() + "  #define ATTRIB_" + this._attributes[k].name
                                .endl() + "  IN " + this._attributes[k].type + " " + this._attributes[k].name + ";"
                                .endl() + "#endif";

                            if (this._attributes[k].nameFrag)
                            {
                                srcHeadVert += ""
                                    .endl() + "#ifndef ATTRIB_" + this._attributes[k].nameFrag
                                    .endl() + "  #define ATTRIB_" + this._attributes[k].nameFrag
                                    .endl() + "  OUT " + this._attributes[k].type + " " + this._attributes[k].nameFrag + ";"
                                    .endl() + "#endif";

                                srcVert += ""
                                    .endl() + this._attributes[k].nameFrag + "=" + this._attributes[k].name + ";";
                            }

                            srcHeadFrag += ""
                                .endl() + "#ifndef ATTRIB_" + this._attributes[k].nameFrag
                                .endl() + "  #define ATTRIB_" + this._attributes[k].nameFrag
                                .endl() + "  IN " + this._attributes[k].type + " " + this._attributes[k].nameFrag + ";"
                                .endl() + "#endif";
                        }
                    }
                }

                srcHeadVert += this._modules[j].srcHeadVert || "";
                srcHeadFrag += this._modules[j].srcHeadFrag || "";
                srcVert += this._modules[j].srcBodyVert || "";
                srcFrag += this._modules[j].srcBodyFrag || "";

                srcHeadVert += "\n//---- end mod ------\n";
                srcHeadFrag += "\n//---- end mod ------\n";

                srcVert += "\n//---- end mod ------\n";
                srcFrag += "\n//---- end mod ------\n";

                srcVert = srcVert.replace(/{{mod}}/g, this._modules[j].prefix);
                srcFrag = srcFrag.replace(/{{mod}}/g, this._modules[j].prefix);
                srcHeadVert = srcHeadVert.replace(/{{mod}}/g, this._modules[j].prefix);
                srcHeadFrag = srcHeadFrag.replace(/{{mod}}/g, this._modules[j].prefix);

                srcVert = srcVert.replace(/MOD_/g, this._modules[j].prefix);
                srcFrag = srcFrag.replace(/MOD_/g, this._modules[j].prefix);
                srcHeadVert = srcHeadVert.replace(/MOD_/g, this._modules[j].prefix);
                srcHeadFrag = srcHeadFrag.replace(/MOD_/g, this._modules[j].prefix);
            }
        }


        vs = vs.replace("{{" + this._moduleNames[i] + "}}", srcVert);
        fs = fs.replace("{{" + this._moduleNames[i] + "}}", srcFrag);
    }
    vs = vs.replace("{{MODULES_HEAD}}", srcHeadVert);
    fs = fs.replace("{{MODULES_HEAD}}", srcHeadFrag);

    vs = this._addLibs(vs);
    fs = this._addLibs(fs);

    if (!this._program)
    {
        this._program = this._createProgram(vs, fs);
    }
    else
    {
        // this.vshader=createShader(vs, gl.VERTEX_SHADER, this.vshader );
        // this.fshader=createShader(fs, gl.FRAGMENT_SHADER, this.fshader );
        // linkProgram(program);
        this._program = this._createProgram(vs, fs);

        this._projMatrixUniform = null;

        for (let i = 0; i < this._uniforms.length; i++) this._uniforms[i].resetLoc();
    }

    this.finalShaderFrag = fs;
    this.finalShaderVert = vs;


    MESH.lastMesh = null;
    MESH.lastShader = null;

    this._needsRecompile = false;
    this.lastCompile = now();

    CGL.profileData.shaderCompileTime += performance.now() - startTime;
};

Shader.hasChanged = function ()
{
    return this._needsRecompile;
};

Shader.prototype.bind = function ()
{
    MESH.lastShader = this;

    if (!this._program || this._needsRecompile) this.compile();

    if (!this._projMatrixUniform)
    {
        this._attrVertexPos = this._cgl.glGetAttribLocation(this._program, CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION);
        this._projMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_PROJMAT);
        this._mvMatrixUniform = this._cgl.gl.getUniformLocation(this._program, "mvMatrix");
        this._vMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_VIEWMAT);
        this._mMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_MODELMAT);
        this._camPosUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_VIEWPOS);
        this._normalMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_NORMALMAT);
        this._inverseViewMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_INVVIEWMAT);
        for (let i = 0; i < this._uniforms.length; i++) this._uniforms[i].needsUpdate = true;
    }

    if (this._cgl.currentProgram != this._program)
    {
        profileData.profileShaderBinds++;
        this._cgl.gl.useProgram(this._program);
        this._cgl.currentProgram = this._program;
    }

    for (let i = 0; i < this._uniforms.length; i++)
        if (this._uniforms[i].needsUpdate) this._uniforms[i].updateValue();

    if (this._pMatrixState != this._cgl.getProjectionMatrixStateCount())
    {
        this._pMatrixState = this._cgl.getProjectionMatrixStateCount();
        this._cgl.gl.uniformMatrix4fv(this._projMatrixUniform, false, this._cgl.pMatrix);
        profileData.profileMVPMatrixCount++;
    }

    if (this._vMatrixUniform)
    {
        if (this._vMatrixState != this._cgl.getViewMatrixStateCount())
        {
            this._cgl.gl.uniformMatrix4fv(this._vMatrixUniform, false, this._cgl.vMatrix);
            profileData.profileMVPMatrixCount++;
            this._vMatrixState = this._cgl.getViewMatrixStateCount();

            if (this._inverseViewMatrixUniform)
            {
                mat4.invert(this._tempInverseViewMatrix, this._cgl.vMatrix);
                this._cgl.gl.uniformMatrix4fv(this._inverseViewMatrixUniform, false, this._tempInverseViewMatrix);
                profileData.profileMVPMatrixCount++;
            }
        }
        this._cgl.gl.uniformMatrix4fv(this._mMatrixUniform, false, this._cgl.mMatrix);
        profileData.profileMVPMatrixCount++;

        if (this._camPosUniform)
        {
            mat4.invert(this._tempCamPosMatrix, this._cgl.vMatrix);
            this._cgl.gl.uniform3f(this._camPosUniform, this._tempCamPosMatrix[12], this._tempCamPosMatrix[13], this._tempCamPosMatrix[14]);
            profileData.profileMVPMatrixCount++;
        }
    }
    else
    {
        // mvmatrix deprecated....
        const tempmv = mat4.create();

        mat4.mul(tempmv, this._cgl.vMatrix, this._cgl.mMatrix);
        this._cgl.gl.uniformMatrix4fv(this._mvMatrixUniform, false, tempmv);
        profileData.profileMVPMatrixCount++;
    }

    if (this._normalMatrixUniform)
    {
        // mat4.mul(this._tempNormalMatrix, this._cgl.vMatrix, this._cgl.mMatrix);
        mat4.invert(this._tempNormalMatrix, this._cgl.mMatrix);
        mat4.transpose(this._tempNormalMatrix, this._tempNormalMatrix);

        this._cgl.gl.uniformMatrix4fv(this._normalMatrixUniform, false, this._tempNormalMatrix);
        profileData.profileMVPMatrixCount++;
    }

    for (let i = 0; i < this._libs.length; i++)
    {
        if (this._libs[i].onBind) this._libs[i].onBind.bind(this._libs[i])(this._cgl, this);
    }

    this._bindTextures();
};


/**
 * easily enable/disable a define without a value
 * @function toggleDefine
 * @memberof Shader
 * @instance
 * @param {name} name
 * @param {any} value or port
 */
Shader.prototype.toggleDefine = function (name, enabled)
{
    if (enabled && typeof (enabled) == "object" && enabled.addEventListener) // port
    {
        enabled.removeEventListener("change", enabled.onToggleDefine);
        enabled.onToggleDefine = (v) =>
        {
            this.toggleDefine(name, v);
        };

        enabled.on("change", enabled.onToggleDefine);
        enabled = enabled.get();
    }

    if (enabled) this.define(name);
    else this.removeDefine(name);
};

/**
 * add a define to a shader, e.g.  #define DO_THIS_THAT 1
 * @function define
 * @memberof Shader
 * @instance
 * @param {String} name
 * @param {Any} value (can be empty)
 */
Shader.prototype.define = function (name, value)
{
    if (value === null || value === undefined) value = "";

    if (typeof (value) == "object") // port
    {
        value.removeEventListener("change", value.onDefineChange);
        value.onDefineChange = (v) =>
        {
            this.define(name, v);
        };
        value.on("change", value.onDefineChange);

        value = value.get();
    }


    for (let i = 0; i < this._defines.length; i++)
    {
        if (this._defines[i][0] == name && this._defines[i][1] == value) return;
        if (this._defines[i][0] == name)
        {
            this._defines[i][1] = value;
            this._needsRecompile = true;
            return;
        }
    }

    this._defines.push([name, value]);
    this._needsRecompile = true;
    this.setWhyCompile("define " + name + " " + value);
};

Shader.prototype.getDefines = function ()
{
    return this._defines;
};

Shader.prototype.getDefine = function (name)
{
    for (let i = 0; i < this._defines.length; i++)
        if (this._defines[i][0] == name) return this._defines[i][1];
    return null;
};

/**
 * return true if shader has define
 * @function hasDefine
 * @memberof Shader
 * @instance
 * @param {String} name
 * @return {Boolean}
 */
Shader.prototype.hasDefine = function (name)
{
    for (let i = 0; i < this._defines.length; i++)
        if (this._defines[i][0] == name) return true;
};

/**
 * remove a define from a shader
 * @param {name} name
 * @function removeDefine
 * @memberof Shader
 * @instance
 */
Shader.prototype.removeDefine = function (name)
{
    for (let i = 0; i < this._defines.length; i++)
    {
        if (this._defines[i][0] == name)
        {
            this._defines.splice(i, 1);
            this._needsRecompile = true;
            return;
        }
    }
};

/**
 * remove a module from shader
 * @function removeModule
 * @memberof Shader
 * @instance
 * @param {shaderModule} module the module to be removed
 */
Shader.prototype.removeModule = function (mod)
{
    for (let i = 0; i < this._modules.length; i++)
    {
        if (mod && mod.id)
        {
            if (this._modules[i].id == mod.id || !this._modules[i])
            {
                let found = true;
                while (found)
                {
                    found = false;
                    for (let j = 0; j < this._uniforms.length; j++)
                    {
                        if (this._uniforms[j].getName().indexOf(mod.prefix) == 0)
                        {
                            this._uniforms.splice(j, 1);
                            found = true;
                            continue;
                        }
                    }
                }

                this._needsRecompile = true;
                this.setWhyCompile("remove module " + mod.title);
                this._modules.splice(i, 1);
                break;
            }
        }
    }
};


Shader.prototype.getNumModules = function ()
{
    return this._modules.length;
};


Shader.prototype.getCurrentModules = function () { return this._modules; };


/**
 * add a module
 * @function addModule
 * @memberof Shader
 * @instance
 * @param {shaderModule} module the module to be added
 * @param {shaderModule} [sibling] sibling module, new module will share the same group
 */
Shader.prototype.addModule = function (mod, sibling)
{
    if (!mod.id) mod.id = generateUUID();
    if (!mod.numId) mod.numId = this._moduleNumId;
    if (!mod.num)mod.num = this._modules.length;

    if (sibling && !sibling.group) sibling.group = simpleId();

    if (!mod.group)
        if (sibling) mod.group = sibling.group;
        else mod.group = simpleId();

    mod.prefix = "mod" + mod.group + "_";
    this._modules.push(mod);

    this._needsRecompile = true;
    this.setWhyCompile("add module " + mod.title);
    this._moduleNumId++;

    return mod;
};

Shader.prototype.hasModule = function (modId)
{
    for (let i = 0; i < this._modules.length; i++)
    {
        if (this._modules[i].id == modId) return true;
    }
    return false;
};

Shader.prototype.setModules = function (names)
{
    this._moduleNames = names;
};

Shader.prototype.dispose = function ()
{
    this._cgl.gl.deleteProgram(this._program);
};

Shader.prototype.setDrawBuffers = function (arr)
{
    this._drawBuffers = arr;
    this._needsRecompile = true;
};

Shader.prototype.getUniforms = function ()
{
    return this._uniforms;
};

Shader.prototype.getUniform = function (name)
{
    for (let i = 0; i < this._uniforms.length; i++)
        if (this._uniforms[i].getName() == name)
            return this._uniforms[i];
    return null;
};

Shader.prototype.removeUniform = function (name)
{
    for (let i = 0; i < this._uniforms.length; i++)
    {
        if (this._uniforms[i].getName() == name)
        {
            this._uniforms.splice(i, 1);
        }
    }
    this._needsRecompile = true;
    this.setWhyCompile("remove uniform " + name);
};


Shader.prototype._addUniform = function (uni)
{
    this._uniforms.push(uni);
    this.setWhyCompile("add uniform " + name);
    this._needsRecompile = true;
};

/**
 * add a uniform to the fragment shader
 * @param {String} type ['f','t', etc]
 * @param {String} name
 * @param {any} value or port
 * @memberof Shader
 * @instance
 * @function addUniformFrag
 * @returns {CGL.Uniform}
 */
Shader.prototype.addUniformFrag = function (type, name, valueOrPort, p2, p3, p4)
{
    const uni = new CGL.Uniform(this, type, name, valueOrPort, p2, p3, p4);
    uni.shaderType = "frag";
    return uni;
};

/**
 * add a uniform to the vertex shader
 * @param {String} type ['f','t', etc]
 * @param {String} name
 * @param {any} value or port
 * @memberof Shader
 * @instance
 * @function addUniformVert
 * @returns {CGL.Uniform}
 */
Shader.prototype.addUniformVert = function (type, name, valueOrPort, p2, p3, p4)
{
    const uni = new CGL.Uniform(this, type, name, valueOrPort, p2, p3, p4);
    uni.shaderType = "vert";
    return uni;
};
/**
 * add a uniform to both shaders
 * @param {String} type ['f','t', etc]
 * @param {String} name
 * @param {any} value or port
 * @memberof Shader
 * @instance
 * @function addUniformBoth
 * @returns {CGL.Uniform}
 */
Shader.prototype.addUniformBoth = function (type, name, valueOrPort, p2, p3, p4)
{
    const uni = new CGL.Uniform(this, type, name, valueOrPort, p2, p3, p4);
    uni.shaderType = "both";
    return uni;
};

/**
 * add a struct & its uniforms to the fragment shader
 * @param {String} structName name of the struct, i.e.: LightStruct
 * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
 * @param {Array} members array of objects containing the struct members. see example for structure

 * @memberof Shader
 * @instance
 * @function addUniformStructFrag
 * @returns {Object}
 * @example
 * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
 * shader.setSource(attachments.shader_vert, attachments.shader_frag);
 * shader.addUniformStructFrag("Light", "uniformLight", [
 * { "type": "3f", "name": "position", "v1": null },
 * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
 * ]);
 */
Shader.prototype.addUniformStructFrag = function (structName, uniformName, members)
{
    const uniforms = {};

    if (!members) return uniforms;

    for (let i = 0; i < members.length; i += 1)
    {
        const member = members[i];
        if (!this.hasUniform(uniformName + "." + member.name))
        {
            const uni = new CGL.Uniform(this, member.type, uniformName + "." + member.name, member.v1, member.v2, member.v3, member.v4, uniformName, structName, member.name);
            uni.shaderType = "frag";
            uniforms[uniformName + "." + member.name] = uni;
        }
    }

    return uniforms;
};

/**
 * add a struct & its uniforms to the vertex shader
 * @param {String} structName name of the struct, i.e.: LightStruct
 * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
 * @param {Array} members array of objects containing the struct members. see example for structure

 * @memberof Shader
 * @instance
 * @function addUniformStructVert
 * @returns {CGL.Uniform}
 * @example
 * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
 * shader.setSource(attachments.shader_vert, attachments.shader_frag);
 * shader.addUniformStructVert("Light", "uniformLight", [
 * { "type": "3f", "name": "position", "v1": null },
 * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
 * ]);
 */
Shader.prototype.addUniformStructVert = function (structName, uniformName, members)
{
    const uniforms = {};

    if (!members) return uniforms;

    for (let i = 0; i < members.length; i += 1)
    {
        const member = members[i];
        if (!this.hasUniform(uniformName + "." + member.name))
        {
            const uni = new CGL.Uniform(this, member.type, uniformName + "." + member.name, member.v1, member.v2, member.v3, member.v4, uniformName, structName, member.name);
            uni.shaderType = "vert";
            uniforms[uniformName + "." + member.name] = uni;
        }
    }

    return uniforms;
};

/**
 * add a struct & its uniforms to the both shaders. PLEASE NOTE: it is not possible to add the same struct to both shaders when it contains ANY integer members.
 * @param {String} structName name of the struct, i.e.: LightStruct
 * @param {String} uniformName name of the struct uniform in the shader, i.e.: lightUni
 * @param {Array} members array of objects containing the struct members. see example for structure

 * @memberof Shader
 * @instance
 * @function addUniformStructBoth
 * @returns {Object}
 * @example
 * const shader = new CGL.Shader(cgl, 'MinimalMaterial');
 * shader.setSource(attachments.shader_vert, attachments.shader_frag);
 * shader.addUniformStructBoth("Light", "uniformLight", [
 * { "type": "3f", "name": "position", "v1": null },
 * { "type": "4f", "name": "color", "v1": inR, v2: inG, v3: inB, v4: inAlpha }
 * ]);
 */
Shader.prototype.addUniformStructBoth = function (structName, uniformName, members)
{
    const uniforms = {};

    if (!members) return uniforms;

    for (let i = 0; i < members.length; i += 1)
    {
        const member = members[i];
        if ((member.type === "2i" || member.type === "i" || member.type === "3i"))
            console.error("Adding an integer struct member to both shaders can potentially error. Please use different structs for each shader. Error occured in struct:", structName, " with member:", member.name, " of type:", member.type, ".");
        if (!this.hasUniform(uniformName + "." + member.name))
        {
            const uni = new CGL.Uniform(this, member.type, uniformName + "." + member.name, member.v1, member.v2, member.v3, member.v4, uniformName, structName, member.name);
            uni.shaderType = "both";
            uniforms[uniformName + "." + member.name] = uni;
        }
    }

    return uniforms;
};

Shader.prototype.hasUniform = function (name)
{
    for (let i = 0; i < this._uniforms.length; i++)
    {
        if (this._uniforms[i].getName() == name) return true;
    }
    return false;
};

Shader.prototype._createProgram = function (vstr, fstr)
{
    const program = this._cgl.gl.createProgram();
    this.vshader = Shader.createShader(this._cgl, vstr, this._cgl.gl.VERTEX_SHADER, this);
    this.fshader = Shader.createShader(this._cgl, fstr, this._cgl.gl.FRAGMENT_SHADER, this);

    this._cgl.gl.attachShader(program, this.vshader);
    this._cgl.gl.attachShader(program, this.fshader);

    this._linkProgram(program);
    return program;
};

Shader.prototype.hasErrors = function ()
{
    return this._hasErrors;
};

Shader.prototype._linkProgram = function (program)
{
    if (this._feedBackNames.length > 0)
    {
        this._cgl.gl.transformFeedbackVaryings(program, this._feedBackNames, this._cgl.gl.SEPARATE_ATTRIBS);
        // INTERLEAVED_ATTRIBS
        // SEPARATE_ATTRIBS
    }

    this._cgl.gl.linkProgram(program);

    if (this._cgl.patch.config.glValidateShader !== false)
    {
        this._cgl.gl.validateProgram(program);

        if (!this._cgl.gl.getProgramParameter(program, this._cgl.gl.LINK_STATUS))
        {
            console.warn(this._cgl.gl.getShaderInfoLog(this.fshader));
            console.warn(this._cgl.gl.getShaderInfoLog(this.vshader));
            console.error(name + " shader linking fail...");

            Log.log("srcFrag", this.srcFrag);
            Log.log("srcVert", this.srcVert);
            Log.log(name + " programinfo: ", this._cgl.gl.getProgramInfoLog(program));

            Log.log("--------------------------------------");
            Log.log(this);
            Log.log("--------------------------------------");

            this._name = "errorshader";
            this.setSource(Shader.getDefaultVertexShader(), Shader.getErrorFragmentShader());
        }
    }
};

Shader.prototype.getProgram = function ()
{
    return this._program;
};

Shader.prototype.setFeedbackNames = function (names)
{
    this._needsRecompile = true;
    this._feedBackNames = names;
};

Shader.prototype.getDefaultVertexShader = Shader.getDefaultVertexShader = function ()
{
    return ""
        .endl() + "{{MODULES_HEAD}}"
        .endl() + "IN vec3 vPosition;"
        .endl() + "IN vec2 attrTexCoord;"
        .endl() + "IN vec3 attrVertNormal;"
        .endl() + "IN vec3 attrTangent,attrBiTangent;"

        .endl() + "IN float attrVertIndex;"

        .endl() + "OUT vec2 texCoord;"
        .endl() + "OUT vec3 norm;"
        .endl() + "UNI mat4 projMatrix;"
        .endl() + "UNI mat4 viewMatrix;"
        .endl() + "UNI mat4 modelMatrix;"

        .endl() + "void main()"
        .endl() + "{"
        .endl() + "   texCoord=attrTexCoord;"
        .endl() + "   norm=attrVertNormal;"
        .endl() + "   vec4 pos=vec4(vPosition,  1.0);"
        .endl() + "   mat4 mMatrix=modelMatrix;"
        .endl() + "   {{MODULE_VERTEX_POSITION}}"
        .endl() + "   gl_Position = projMatrix * (viewMatrix*mMatrix) * pos;"
        .endl() + "}";
};

Shader.prototype.getDefaultFragmentShader = Shader.getDefaultFragmentShader = function (r, g, b)
{
    if (r == undefined)
    {
        r = 0.5;
        g = 0.5;
        b = 0.5;
    }
    return ""
        .endl() + "IN vec2 texCoord;"
        .endl() + "{{MODULES_HEAD}}"
        .endl() + "void main()"
        .endl() + "{"
        .endl() + "    vec4 col=vec4(" + r + "," + g + "," + b + ",1.0);"
        .endl() + "    {{MODULE_COLOR}}"
        .endl() + "    outColor = col;"
        .endl() + "}";
};

/**
  * adds attribute definition to shader header without colliding with other shader modules...
 * when attrFrag is defined, vertex shader will output this attribute to the fragment shader
 * @function
 * @memberof Shader
 * @instance
 * @param {Object} attribObject {type:x,name:x,[nameFrag:x]}
 * @return {Object}
 */
Shader.prototype.addAttribute = function (attr)
{
    for (let i = 0; i < this._attributes.length; i++)
    {
        if (this._attributes[i].name == attr.name && this._attributes[i].nameFrag == attr.nameFrag) return;
    }
    this._attributes.push(attr);
    this._needsRecompile = true;
};

Shader.prototype.bindTextures =
Shader.prototype._bindTextures = function ()
{
    if (this._textureStackTex.length > this._cgl.maxTextureUnits)
    {
        console.log("[shader._bindTextures] too many textures bound", this._textureStackTex.length + "/" + this._cgl.maxTextureUnits);
    }

    for (let i = 0; i < this._textureStackTex.length; i++)
    {
        if (!this._textureStackTex[i])
        {
            console.log("no texture for pushtexture", this._name);
        }
        else
        if (!this._textureStackUni[i])
        {
            // throw(new Error('no uniform given to texturestack'));
            console.log("no uniform for pushtexture", this._name);
            this._cgl.setTexture(i, this._textureStackTex[i], this._textureStackType[i]);
        }
        else
        {
            this._textureStackUni[i].setValue(i);
            this._cgl.setTexture(i, this._textureStackTex[i], this._textureStackType[i]);
        }
    }
};

/**
 * push a texture on the stack. those textures will be bound when binding the shader. texture slots are automatically set
 * @param {uniform} texture uniform
 * @param {texture} texture
 * @param {type} texture type, can be ignored when TEXTURE_2D
 * @function pushTexture
 * @memberof Shader
 * @instance
 */
Shader.prototype.pushTexture = function (uniform, t, type)
{
    if (!uniform) throw (new Error("no uniform given to texturestack"));
    if (!t) throw (new Error("no texture given to texturestack"));

    // this._cgl.setTexture(this._textureStackTex.length-1,this._textureStackTex[i],this._textureStackType[i]);

    this._textureStackUni.push(uniform);

    if (t.tex)
    {
        this._textureStackTexCgl.push(t);
        this._textureStackTex.push(t.tex);
    }
    else
    {
        this._textureStackTexCgl.push(null);
        this._textureStackTex.push(t);
    }

    this._textureStackType.push(type);
};

/**
 * pop last texture
 * @function popTexture
 * @memberof Shader
 * @instance
 */
Shader.prototype.popTexture = function ()
{
    this._textureStackUni.pop();
    this._textureStackTex.pop();
    this._textureStackType.pop();
};

/**
 * pop all textures
 * @function popTextures
 * @memberof Shader
 * @instance
 */
Shader.prototype.popTextures = function ()
{
    this._textureStackTex.length =
    this._textureStackTexCgl.length =
    this._textureStackType.length =
    this._textureStackUni.length = 0;
};

// --------------------------

Shader.getErrorFragmentShader = function ()
{
    return ""
        .endl() + "void main()"
        .endl() + "{"
        .endl() + "   float g=mod((gl_FragCoord.y+gl_FragCoord.x),50.0)/50.0;"
        .endl() + "   g= step(0.1,g);"
        .endl() + "   outColor = vec4( g+0.5, 0.0, 0.0, 1.0);"
        .endl() + "}";
};

Shader.createShader = function (cgl, str, type, cglShader)
{
    function getBadLines(infoLog)
    {
        const basLines = [];
        const lines = infoLog.split("\n");
        for (const i in lines)
        {
            const divide = lines[i].split(":");
            if (parseInt(divide[2], 10)) basLines.push(parseInt(divide[2], 10));
        }
        return basLines;
    }

    const shader = cgl.gl.createShader(type);
    cgl.gl.shaderSource(shader, str);
    cgl.gl.compileShader(shader);

    if (!cgl.gl.getShaderParameter(shader, cgl.gl.COMPILE_STATUS))
    {
        Log.log("compile status: ");

        if (type == cgl.gl.VERTEX_SHADER) Log.log("VERTEX_SHADER");
        if (type == cgl.gl.FRAGMENT_SHADER) Log.log("FRAGMENT_SHADER");

        console.warn(cgl.gl.getShaderInfoLog(shader));

        let infoLog = cgl.gl.getShaderInfoLog(shader);
        const badLines = getBadLines(infoLog);
        let htmlWarning = "<div class=\"shaderErrorCode\">";
        const lines = str.match(/^.*((\r\n|\n|\r)|$)/gm);

        for (const i in lines)
        {
            const j = parseInt(i, 10) + 1;
            const line = j + ": " + lines[i];
            Log.log(line);

            let isBadLine = false;
            for (const bj in badLines)
                if (badLines[bj] == j) isBadLine = true;

            if (isBadLine) htmlWarning += "<span class=\"error\">";
            htmlWarning += escapeHTML(line);
            if (isBadLine) htmlWarning += "</span>";
        }

        console.warn(infoLog);

        infoLog = infoLog.replace(/\n/g, "<br/>");

        htmlWarning = infoLog + "<br/>" + htmlWarning + "<br/><br/>";

        cgl.patch.emitEvent("criticalError", "Shader error " + name, htmlWarning);
        if (cgl.patch.isEditorMode())Log.log("Shader error " + name, htmlWarning);

        htmlWarning += "</div>";

        this._name = "errorshader";
        cglShader.setSource(Shader.getDefaultVertexShader(), Shader.getErrorFragmentShader());
    }
    else
    {
        // Log.log(name+' shader compiled...');
    }
    return shader;
};

export { Shader };
