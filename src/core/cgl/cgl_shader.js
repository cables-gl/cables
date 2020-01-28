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
    profileShaderBinds: 0,
    // profileUniformCount: 0,
    profileShaderCompiles: 0,
    profileVideosPlaying: 0,
    profileMVPMatrixCount: 0,

    // default attributes
    SHADERVAR_VERTEX_POSITION: 'vPosition',
    SHADERVAR_VERTEX_NUMBER: 'attrVertIndex',
    SHADERVAR_VERTEX_TEXCOORD: 'attrTexCoord',
    SHADERVAR_INSTANCE_MMATRIX: 'instMat',

    // default uniforms
    SHADERVAR_UNI_PROJMAT: "projMatrix",
    SHADERVAR_UNI_VIEWMAT: "viewMatrix",
    SHADERVAR_UNI_MODELMAT: "modelMatrix",
    SHADERVAR_UNI_NORMALMAT: "normalMatrix",
    SHADERVAR_UNI_INVVIEWMAT: "inverseViewMatrix",
    SHADERVAR_UNI_VIEWPOS: "camPos",
}


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
const Shader = function(_cgl, _name) {
    if (!_cgl) throw new Error("shader constructed without cgl "+_name);

    this._cgl = _cgl;
    this._name = _name || 'unknown';
    this.glslVersion = 0;
    if(_cgl.glVersion>1)this.glslVersion=300;

    this.id=simpleId();
    this._program = null;
    this._uniforms = [];
    this._drawBuffers=[true];
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
    this.precision = _cgl.patch.config.glslPrecision||'highp';

    this._pMatrixState =-1;
    this._vMatrixState =-1;

    this._modGroupCount = 0;
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

    this._libs=[];

    this._textureStackUni = [];
    this._textureStackTex = [];
    this._textureStackType = [];

    this._tempNormalMatrix=mat4.create();
    this._tempCamPosMatrix = mat4.create();
    this._tempInverseViewMatrix = mat4.create();

    this.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
};

Shader.prototype.getCgl = function() {
    return this._cgl;
};

Shader.prototype.getName=function(){
    return this._name;
}

Shader.prototype.enableExtension = function(name) {
    this.setWhyCompile("enable extension "+name);
    this._needsRecompile = true;
    this._extensions.push(name);
};

Shader.prototype.getAttrVertexPos = function() {
    return this._attrVertexPos;
};

Shader.prototype.hasTextureUniforms = function() {
    for (var i = 0; i < this._uniforms.length; i++)
        if (this._uniforms[i].getType() == 't') return true;
    return false;
};

Shader.prototype.setWhyCompile=function(why)
{
    // Log.log('recompile because '+why);
};

/**
 * set shader source code
 * @function setSource
 * @memberof Shader
 * @instance
 * @param {String} srcVert
 * @param {String} srcFrag
 */
Shader.prototype.setSource = function(srcVert, srcFrag)
{
    this.srcVert = srcVert;
    this.srcFrag = srcFrag;
    this.setWhyCompile("Source changed");
    this._needsRecompile = true;
};

Shader.prototype._addLibs=function(src)
{
    for(var id in ShaderLibMods)
    {
        if(src.indexOf(id)>-1)
        {
            var lib=new ShaderLibMods[id]();
            src = src.replace('{{'+id+'}}', lib.srcHeadFrag);
            this._libs.push(lib);
            if(lib.initUniforms)lib.initUniforms(this);
        }
    }

    return src;
}



Shader.prototype.compile = function() {
    profileData.profileShaderCompiles++;
    profileData.profileShaderCompileName = this._name;

    var extensionString = '';
    if (this._extensions)
        for (i = 0; i < this._extensions.length; i++)
            extensionString += '#extension '+this._extensions[i]+' : enable'.endl();

    var definesStr = '';
    var i = 0;
    for (i = 0; i < this._defines.length; i++)
        definesStr += '#define ' + this._defines[i][0] + ' ' + this._defines[i][1] + ''.endl();

    if(this._uniforms)
        for (i = 0; i < this._uniforms.length; i++)
            this._uniforms[i].resetLoc();

    if (this.hasTextureUniforms()) definesStr += '#define HAS_TEXTURES'.endl();

    var vs = '';
    var fs = '';

    if (this.glslVersion == 300)
    {
        var drawBufferStr = '';
        var count=0;

        if(this.srcFrag.indexOf("outColor0")>-1)this._drawBuffers[0]=true;
        if(this.srcFrag.indexOf("outColor1")>-1)this._drawBuffers[1]=true;
        if(this.srcFrag.indexOf("outColor2")>-1)this._drawBuffers[2]=true;
        if(this.srcFrag.indexOf("outColor3")>-1)this._drawBuffers[3]=true;

        if(this._drawBuffers.length==1)
        {
            // drawBufferStr+='#define gl_FragColor outColor'+i+''.endl();
            drawBufferStr='out vec4 outColor;'.endl();
            drawBufferStr+='#define gl_FragColor outColor'.endl();
        }
        else
        {
            var count=0;
            drawBufferStr+='vec4 outColor;'.endl();


            for(var i=0;i<this._drawBuffers.length;i++)
            {
                // if(this._drawBuffers[i])
                {
                    if(count==0)
                    {
                        drawBufferStr+='#define gl_FragColor outColor'+i+''.endl();
                        // drawBufferStr+='#define outColor outColor'+i+''.endl();
                    }
                    drawBufferStr+='layout(location = '+i+') out vec4 outColor'+i+';'.endl();
                }
                count++;
            }
        }

        vs = '#version 300 es'
            .endl() + '// '
            .endl() + '// vertex shader '+this._name
            .endl() + '// '
            .endl() + 'precision ' + this.precision+' float;'
            .endl() + ''
            .endl() + '#define WEBGL2'
            .endl() + '#define texture2D texture'
            .endl() + '#define UNI uniform'
            .endl() + '#define IN in'
            .endl() + '#define OUT out'
            .endl();

        fs = '#version 300 es'
            .endl() + '// '
            .endl() + '// fragment shader '+this._name
            .endl() + '// '
            .endl() + 'precision ' + this.precision+' float;'
            .endl() + ''
            .endl() + '#define WEBGL2'
            .endl() + '#define texture2D texture'
            .endl() + '#define IN in'
            .endl() + '#define UNI uniform'
            .endl() + drawBufferStr

            .endl();

    } else {
        fs = ''
            .endl() + '// '
            .endl() + '// fragment shader '+this._name
            .endl() + '// '
            .endl() + '#define WEBGL1'
            .endl() + '#define texture texture2D'
            .endl() + '#define outColor gl_FragColor'
            .endl() + '#define IN varying'
            .endl() + '#define UNI uniform'
            .endl();

        vs = ''
            .endl() + '// '
            .endl() + '// vertex shader '+this._name
            .endl() + '// '
            .endl() + '#define WEBGL1'
            .endl() + '#define texture texture2D'
            .endl() + '#define OUT varying'
            .endl() + '#define IN attribute'
            .endl() + '#define UNI uniform'
            .endl();
        }

    if (fs.indexOf("precision") == -1) fs = 'precision ' + this.precision+' float;'.endl() + fs;
    if (vs.indexOf("precision") == -1) vs = 'precision ' + this.precision+' float;'.endl() + vs;

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )
    {
        fs+='#define MOBILE'.endl();
        vs+='#define MOBILE'.endl();
    }

    vs = extensionString + vs + definesStr + this.srcVert;
    fs = extensionString + fs + definesStr + this.srcFrag;

    var srcHeadVert = '';
    var srcHeadFrag = '';

    this._modules.sort(function(a, b) {
        return a.group - b.group;
    });

    this._modules.sort(function(a, b) {
        return a.priority||0 - b.priority||0;
    });

    var addedAttributes=false;

    for (i = 0; i < this._moduleNames.length; i++) {
        var srcVert = '';
        var srcFrag = '';

        for (var j = 0; j < this._modules.length; j++) {
            if (this._modules[j].name == this._moduleNames[i]) {

                srcHeadVert+='\n//---- MOD: '+this._modules[j].group+': '+j+' - '+this._modules[j].title+' ------\n';
                srcHeadFrag+='\n//---- MOD: '+this._modules[j].group+': '+j+' - '+this._modules[j].title+' ------\n';

                srcVert+='\n\n//---- MOD: '+this._modules[j].title+' ------\n';
                srcFrag+='\n\n//---- MOD: '+this._modules[j].title+' ------\n';

                if(!addedAttributes)
                {
                    addedAttributes=true;

                    for(var k=0;k<this._attributes.length;k++)
                    {
                        if(this._attributes[k].name && this._attributes[k].type)
                        {
                            srcHeadVert+=''
                                .endl()+'#ifndef ATTRIB_'+this._attributes[k].name
                                .endl()+'  #define ATTRIB_'+this._attributes[k].name
                                .endl()+'  IN '+this._attributes[k].type+' '+this._attributes[k].name+';'
                                .endl()+'#endif';

                            if(this._attributes[k].nameFrag)
                            {
                                srcHeadVert+=''
                                    .endl()+'#ifndef ATTRIB_'+this._attributes[k].nameFrag
                                    .endl()+'  #define ATTRIB_'+this._attributes[k].nameFrag
                                    .endl()+'  OUT '+this._attributes[k].type+' '+this._attributes[k].nameFrag+';'
                                    .endl()+'#endif';

                                srcVert+=''
                                    .endl()+this._attributes[k].nameFrag+'='+this._attributes[k].name+';';
                            }

                            srcHeadFrag+=''
                                .endl()+'#ifndef ATTRIB_'+this._attributes[k].nameFrag
                                .endl()+'  #define ATTRIB_'+this._attributes[k].nameFrag
                                .endl()+'  IN '+this._attributes[k].type+' '+this._attributes[k].nameFrag+';'
                                .endl()+'#endif';
                        }
                    }
                }

                srcHeadVert += this._modules[j].srcHeadVert || '';
                srcHeadFrag += this._modules[j].srcHeadFrag || '';
                srcVert += this._modules[j].srcBodyVert || '';
                srcFrag += this._modules[j].srcBodyFrag || '';

                srcHeadVert+='\n//---- end mod ------\n';
                srcHeadFrag+='\n//---- end mod ------\n';

                srcVert+='\n//---- end mod ------\n';
                srcFrag+='\n//---- end mod ------\n';

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


        vs = vs.replace('{{' + this._moduleNames[i] + '}}', srcVert);
        fs = fs.replace('{{' + this._moduleNames[i] + '}}', srcFrag);
    }
    vs = vs.replace('{{MODULES_HEAD}}', srcHeadVert);
    fs = fs.replace('{{MODULES_HEAD}}', srcHeadFrag);

    vs=this._addLibs(vs);
    fs=this._addLibs(fs);

    if (!this._program) {
        this._program = this._createProgram(vs, fs);
    } else {
        // this.vshader=createShader(vs, gl.VERTEX_SHADER, this.vshader );
        // this.fshader=createShader(fs, gl.FRAGMENT_SHADER, this.fshader );
        // linkProgram(program);
        this._program = this._createProgram(vs, fs);

        this._projMatrixUniform = null;

        for (i = 0; i < this._uniforms.length; i++) this._uniforms[i].resetLoc();
    }

    this.finalShaderFrag = fs;
    this.finalShaderVert = vs;

    MESH.lastMesh = null;
    MESH.lastShader = null;

    this._needsRecompile = false;
    this.lastCompile = now();
};

Shader.prototype.bind = function()
{
    var i = 0;
    MESH.lastShader = this;

    if (!this._program || this._needsRecompile) this.compile();

    if (!this._projMatrixUniform) {
        this._attrVertexPos = this._cgl.glGetAttribLocation(this._program, CONSTANTS.SHADER.SHADERVAR_VERTEX_POSITION);
        this._projMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_PROJMAT);
        this._mvMatrixUniform = this._cgl.gl.getUniformLocation(this._program, "mvMatrix");
        this._vMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_VIEWMAT);
        this._mMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_MODELMAT);
        this._camPosUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_VIEWPOS);
        this._normalMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_NORMALMAT);
        this._inverseViewMatrixUniform = this._cgl.gl.getUniformLocation(this._program, CONSTANTS.SHADER.SHADERVAR_UNI_INVVIEWMAT);
        for (i = 0; i < this._uniforms.length; i++) this._uniforms[i].needsUpdate = true;
    }

    if (this._cgl.currentProgram != this._program) {
        profileData.profileShaderBinds++;
        this._cgl.gl.useProgram(this._program);
        this._cgl.currentProgram = this._program;
    }

    for (i = 0; i < this._uniforms.length; i++)
        if (this._uniforms[i].needsUpdate) this._uniforms[i].updateValue();

    if(this._pMatrixState!=this._cgl.getProjectionMatrixStateCount())
    {
        this._pMatrixState=this._cgl.getProjectionMatrixStateCount();
        this._cgl.gl.uniformMatrix4fv(this._projMatrixUniform, false, this._cgl.pMatrix);
        profileData.profileMVPMatrixCount++;
    }

    if (this._vMatrixUniform)
    {
        if(this._vMatrixState!=this._cgl.getViewMatrixStateCount())
        {
            this._cgl.gl.uniformMatrix4fv(this._vMatrixUniform, false, this._cgl.vMatrix);
            profileData.profileMVPMatrixCount++;
            this._vMatrixState=this._cgl.getViewMatrixStateCount();

            if (this._inverseViewMatrixUniform)
            {
                mat4.invert(this._tempInverseViewMatrix, this._cgl.vMatrix);
                this._cgl.gl.uniformMatrix4fv(this._inverseViewMatrixUniform, false, this._tempInverseViewMatrix);
                profileData.profileMVPMatrixCount++;
            }
        }
        this._cgl.gl.uniformMatrix4fv(this._mMatrixUniform, false, this._cgl.mMatrix);
        profileData.profileMVPMatrixCount++;

        if(this._camPosUniform)
        {
            mat4.invert(this._tempCamPosMatrix, this._cgl.vMatrix);
            this._cgl.gl.uniform3f(this._camPosUniform, this._tempCamPosMatrix[12], this._tempCamPosMatrix[13], this._tempCamPosMatrix[14]);
            profileData.profileMVPMatrixCount++;
        }
    }
    else
    {
        // mvmatrix deprecated....
        var tempmv=mat4.create();

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

    for(var i=0;i<this._libs.length;i++)
    {
        if(this._libs[i].onBind)this._libs[i].onBind.bind(this._libs[i])(this._cgl,this);
    }

    this._bindTextures();
};


/**
 * easily enable/disable a define without a value
 * @function toggleDefine
 * @memberof Shader
 * @instance
 * @param {name} name
 */
Shader.prototype.toggleDefine = function(name, enabled)
{
    if(enabled) this.define(name);
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
Shader.prototype.define = function(name, value)
{
    if (!value) value = '';
    for (var i = 0; i < this._defines.length; i++)
    {
        if (this._defines[i][0] == name && this._defines[i][1] == value) return;
        if (this._defines[i][0] == name) {
            this._defines[i][1] = value;
            this._needsRecompile = true;
            return;
        }
    }

    this._defines.push([name, value]);
    this._needsRecompile = true;
    this.setWhyCompile("define "+name+" "+value);
};

Shader.prototype.getDefines=function()
{
    return this._defines;
};

Shader.prototype.getDefine = function(name) {
    for (var i = 0; i < this._defines.length; i++)
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
Shader.prototype.hasDefine = function(name) {
    for (var i = 0; i < this._defines.length; i++)
        if (this._defines[i][0] == name) return true;
};

/**
 * remove a define from a shader
 * @param {name} name
 * @function removeDefine
 * @memberof Shader
 * @instance
 */
Shader.prototype.removeDefine = function(name) {
    for (var i = 0; i < this._defines.length; i++) {
        if (this._defines[i][0] == name) {
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
Shader.prototype.removeModule = function(mod)
{
    for (var i = 0; i < this._modules.length; i++)
    {
        if(mod && mod.id)
        {
            if (this._modules[i].id == mod.id || !this._modules[i])
            {
                var found=true;
                while(found)
                {
                    found=false;
                    for(var j=0;j<this._uniforms.length;j++)
                    {
                        if(this._uniforms[j].getName().indexOf(mod.prefix)==0)
                        {
                            this._uniforms.splice(j, 1);
                            found=true;
                            continue;
                        }
                    }
                }

                this._needsRecompile = true;
                this.setWhyCompile("remove module "+mod.title);
                this._modules.splice(i, 1);
                break;
            }
        }
    }
};


Shader.prototype.getNumModules = function() {
    return this._modules.length;
};


Shader.prototype.getCurrentModules=function(){return this._modules;};


/**
 * add a module
 * @function addModule
 * @memberof Shader
 * @instance
 * @param {shaderModule} module the module to be added
 * @param {shaderModule} [sibling] sibling module, new module will share the same group
 */
Shader.prototype.addModule = function(mod, sibling) {
    if(!mod.id) mod.id = generateUUID();
    if(!mod.numId) mod.numId = this._moduleNumId;
    if(!mod.num)mod.num = this._modules.length;

    if(sibling) mod.group = sibling.group;
        else mod.group = this._modGroupCount++;

    mod.prefix = 'mod' + mod.group;

    this._modules.push(mod);
    this._needsRecompile = true;
    this.setWhyCompile("add module "+mod.title);
    this._moduleNumId++;

    return mod;
};

Shader.prototype.setModules = function(names) {
    this._moduleNames = names;
};

Shader.prototype.dispose=function()
{
    this._cgl.gl.deleteProgram(this._program);
};

Shader.prototype.setDrawBuffers = function(arr) {
    this._drawBuffers=arr;
    this._needsRecompile=true;
};

Shader.prototype.getUniforms = function() {
    return this._uniforms;
};

Shader.prototype.getUniform = function(name) {
    for (var i = 0; i < this._uniforms.length; i++)
        if (this._uniforms[i].getName() == name)
            return this._uniforms[i];
    return null;
};

Shader.prototype.removeUniform = function(name) {
    for (var i = 0; i < this._uniforms.length; i++) {
        if (this._uniforms[i].getName() == name) {
            this._uniforms.splice(i, 1);
        }
    }
    this._needsRecompile = true;
    this.setWhyCompile("remove uniform "+name);
};

/**
 * add a uniform to the shader
 * @param {Uniform} uniform
 * @memberof Shader
 * @instance
 * @function
 */
Shader.prototype.addUniform = function(uni) {
    this._uniforms.push(uni);
    this.setWhyCompile("add uniform "+name);
    this._needsRecompile = true;
};

Shader.prototype._createProgram = function(vstr, fstr) {
    var program = this._cgl.gl.createProgram();
    this.vshader = Shader.createShader(this._cgl, vstr, this._cgl.gl.VERTEX_SHADER, this);
    this.fshader = Shader.createShader(this._cgl, fstr, this._cgl.gl.FRAGMENT_SHADER, this);

    this._cgl.gl.attachShader(program, this.vshader);
    this._cgl.gl.attachShader(program, this.fshader);

    this._linkProgram(program);
    return program;
};

Shader.prototype.hasErrors = function()
{
    return this._hasErrors;
}

Shader.prototype._linkProgram = function(program)
{
    if (this._feedBackNames.length > 0) {
        this._cgl.gl.transformFeedbackVaryings(program, this._feedBackNames, this._cgl.gl.SEPARATE_ATTRIBS);
        // INTERLEAVED_ATTRIBS
        //SEPARATE_ATTRIBS
    }

    this._cgl.gl.linkProgram(program);

    if(this._cgl.patch.config.glValidateShader!==false)
    {
        this._cgl.gl.validateProgram(program);

        if (!this._cgl.gl.getProgramParameter(program, this._cgl.gl.LINK_STATUS))
        {
            console.warn(this._cgl.gl.getShaderInfoLog(this.fshader));
            console.warn(this._cgl.gl.getShaderInfoLog(this.vshader));
            console.error(name + " shader linking fail...");

            Log.log('srcFrag',this.srcFrag);
            Log.log('srcVert',this.srcVert);
            Log.log(name + ' programinfo: ', this._cgl.gl.getProgramInfoLog(program));

            Log.log('--------------------------------------');
            Log.log(this);
            Log.log('--------------------------------------');

            name = "errorshader";
            this.setSource(Shader.getDefaultVertexShader(), Shader.getErrorFragmentShader());
        }
    }
};

Shader.prototype.getProgram = function() {
    return this._program;
};

Shader.prototype.setFeedbackNames = function(names) {
    this._needsRecompile = true;
    this._feedBackNames = names;
};

Shader.prototype.getDefaultVertexShader = Shader.getDefaultVertexShader = function() {
    return ''
        .endl() + '{{MODULES_HEAD}}'
        .endl() + 'IN vec3 vPosition;'
        .endl() + 'IN vec2 attrTexCoord;'
        .endl() + 'IN vec3 attrVertNormal;'
        .endl() + 'IN float attrVertIndex;'

        .endl() + 'OUT vec2 texCoord;'
        .endl() + 'OUT vec3 norm;'
        .endl() + 'UNI mat4 projMatrix;'
        .endl() + 'UNI mat4 viewMatrix;'
        .endl() + 'UNI mat4 modelMatrix;'

        .endl() + 'void main()'
        .endl() + '{'
        .endl() + '   texCoord=attrTexCoord;'
        .endl() + '   norm=attrVertNormal;'
        .endl() + '   vec4 pos=vec4(vPosition,  1.0);'
        .endl() + '   mat4 mMatrix=modelMatrix;'
        .endl() + '   {{MODULE_VERTEX_POSITION}}'
        .endl() + '   gl_Position = projMatrix * (viewMatrix*mMatrix) * pos;'
        .endl() + '}';
};

Shader.prototype.getDefaultFragmentShader = Shader.getDefaultFragmentShader = function(r,g,b)
{
    if(r==undefined)
    {
        r=0.5;
        g=0.5;
        b=0.5;
    }
    return ''
        .endl()+'IN vec2 texCoord;'
        .endl()+'{{MODULES_HEAD}}'
        .endl()+'void main()'
        .endl()+'{'
        .endl()+'    vec4 col=vec4('+r+','+g+','+b+',1.0);'
        .endl()+'    {{MODULE_COLOR}}'
        .endl()+'    outColor = col;'
        .endl()+'}';
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
Shader.prototype.addAttribute = function(attr) {
    for(var i=0;i<this._attributes.length;i++)
    {
        if(this._attributes[i].name==attr.name && this._attributes[i].nameFrag==attr.nameFrag)return;
    }
    this._attributes.push(attr);
    this._needsRecompile = true;
};

Shader.prototype.bindTextures=
Shader.prototype._bindTextures=function()
{
    if(this._textureStackTex.length>this.maxTextureUnits)
    {
        console.log("[shader._bindTextures] too many textures bound",this._textureStackTex.length+'/'+this._cgl.maxTextureUnits);
    }

    for(var i=0;i<this._textureStackTex.length;i++)
    {
        if(!this._textureStackTex[i])
        {
            console.log('no texture for pushtexture',this._name);

        }
        else
        if(!this._textureStackUni[i])
        {
            // throw(new Error('no uniform given to texturestack'));
            console.log('no uniform for pushtexture',this._name);
            this._cgl.setTexture(i,this._textureStackTex[i],this._textureStackType[i]);
        }
        else
        {
            this._textureStackUni[i].setValue(i);
            this._cgl.setTexture(i,this._textureStackTex[i],this._textureStackType[i]);
        }
    }

}

/**
 * push a texture on the stack. those textures will be bound when binding the shader. texture slots are automatically set
 * @param {uniform} texture uniform
 * @param {texture} texture
 * @param {type} texture type, can be ignored when TEXTURE_2D
 * @function pushTexture
 * @memberof Shader
 * @instance
 */
Shader.prototype.pushTexture=function(uniform,t,type)
{
    if(!uniform) throw(new Error('no uniform given to texturestack'));

    // this._cgl.setTexture(this._textureStackTex.length-1,this._textureStackTex[i],this._textureStackType[i]);

    this._textureStackUni.push(uniform);
    this._textureStackTex.push(t);
    this._textureStackType.push(type);
};

/**
 * pop last texture
 * @function popTexture
 * @memberof Shader
 * @instance
 */
Shader.prototype.popTexture=function()
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
Shader.prototype.popTextures=function()
{
    this._textureStackTex.length=
    this._textureStackType.length=
    this._textureStackUni.length=0;

};




// --------------------------

Shader.getErrorFragmentShader = function() {
    return ''
        .endl() + 'void main()'
        .endl() + '{'
        .endl() + '   float g=mod((gl_FragCoord.y+gl_FragCoord.x),50.0)/50.0;'
        .endl() + '   g= step(0.1,g);'
        .endl() + '   outColor = vec4( g+0.5, 0.0, 0.0, 1.0);'
        .endl() + '}';
};

Shader.createShader = function(cgl, str, type, cglShader) {
    function getBadLines(infoLog) {
        var basLines = [];
        var lines = infoLog.split('\n');
        for (var i in lines) {
            var divide = lines[i].split(':');
            if (parseInt(divide[2], 10)) basLines.push(parseInt(divide[2], 10));
        }
        return basLines;
    }

    var shader = cgl.gl.createShader(type);
    cgl.gl.shaderSource(shader, str);
    cgl.gl.compileShader(shader);

    if (!cgl.gl.getShaderParameter(shader, cgl.gl.COMPILE_STATUS)) {
        Log.log('compile status: ');

        if (type == cgl.gl.VERTEX_SHADER) Log.log('VERTEX_SHADER');
        if (type == cgl.gl.FRAGMENT_SHADER) Log.log('FRAGMENT_SHADER');

        console.warn(cgl.gl.getShaderInfoLog(shader));

        var infoLog = cgl.gl.getShaderInfoLog(shader);
        var badLines = getBadLines(infoLog);
        var htmlWarning = '<div class="shaderErrorCode">';
        var lines = str.match(/^.*((\r\n|\n|\r)|$)/gm);

        for (var i in lines) {
            var j = parseInt(i, 10) + 1;
            var line = j + ': ' + lines[i];
            Log.log(line);

            var isBadLine = false;
            for (var bj in badLines)
                if (badLines[bj] == j) isBadLine = true;

            if (isBadLine) htmlWarning += '<span class="error">';
            htmlWarning += escapeHTML(line);
            if (isBadLine) htmlWarning += '</span>';
        }

        console.warn(infoLog);

        infoLog = infoLog.replace(/\n/g, '<br/>');

        htmlWarning = infoLog + '<br/>' + htmlWarning + '<br/><br/>';

        cgl.patch.emitEvent("criticalError",'Shader error ' + name, htmlWarning);
        if(cgl.patch.isEditorMode())Log.log('Shader error ' + name, htmlWarning);

        htmlWarning += '</div>';

        name = "errorshader";
        cglShader.setSource(Shader.getDefaultVertexShader(), Shader.getErrorFragmentShader());
    } else {
        // Log.log(name+' shader compiled...');
    }
    return shader;
};

export { Shader };
