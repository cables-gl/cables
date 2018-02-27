var CGL = CGL || {};

// ---------------------------------------------------------------------------

CGL.profileShaderBinds = 0;
CGL.profileUniformCount = 0;
CGL.profileShaderCompiles = 0;
CGL.profileVideosPlaying = 0;

CGL.SHADERVAR_VERTEX_POSITION = 'vPosition';
CGL.SHADERVAR_VERTEX_NUMBER = 'attrVertIndex';
CGL.SHADERVAR_VERTEX_TEXCOORD = 'attrTexCoord';

// ---------------------------------------------------------------------------

/**
 * @class
 * @name Shader
 * @memberof CGL
 */
CGL.Shader = function(_cgl, _name) {
    if (!_cgl) throw "shader constructed without cgl";
    var self = this;
    var name = _name || 'unknown';

    this.glslVersion = 0;
    if(_cgl.glVersion>1)this.glslVersion=300;

    this._program = null;
    var uniforms = [];
    var defines = [];
    this._needsRecompile = true;
    var infoLog = '';
    var cgl = _cgl;
    this._cgl = _cgl;
    var projMatrixUniform = null;
    var mvMatrixUniform = null;
    var mMatrixUniform = null;
    var vMatrixUniform = null;
    var camPosUniform = null;
    var normalMatrixUniform = null;
    var inverseViewMatrixUniform = null;
    var attrVertexPos = -1;

    this._modGroupCount = 0;
    this._feedBackNames = [];
    this._attributes = [];

    this.glPrimitive = null;
    this.offScreenPass = false;
    this._extensions = [];
    this.srcVert = this.getDefaultVertexShader();
    this.srcFrag = this.getDefaultFragmentShader();
    this.lastCompile = 0;

    var moduleNames = [];
    var modules = [];
    var moduleNumId = 0;

    this.getCgl = function() {
        return cgl;
    };

    this.getName=function()
    {
        return name;
    }

    this.setWhyCompile=function(why)
    {
        // console.log('recompile because '+why);
    }

    this.setSource = function(srcVert, srcFrag) {
        this.srcVert = srcVert;
        this.srcFrag = srcFrag;

        this.setWhyCompile("Source changed");
        this._needsRecompile = true;
    };

    this.enableExtension = function(name) {
        this.setWhyCompile("enable extension "+name);
        this._needsRecompile = true;
        this._extensions.push(name);
    };

    this.define = function(name, value) {
        // console.log('add define',name);
        if (!value) value = '';
        // for(var i in defines)
        for (var i = 0; i < defines.length; i++) {
            if (defines[i][0] == name) {
                defines[i][1] = value;
                this._needsRecompile = true;
                return;
            }
        }
        defines.push([name, value]);
        this._needsRecompile = true;
        this.setWhyCompile("define "+name+" "+value);
    };

    this.getDefines=function()
    {
        return defines;
    };

    this.getDefine = function(name) {
        for (var i = 0; i < defines.length; i++)
            if (defines[i][0] == name) return defines[i][1];
        return null;
    };


    this.hasDefine = function(name) {
        for (var i = 0; i < defines.length; i++)
            if (defines[i][0] == name)
                return true;
    };

    this.removeDefine = function(name, value) {
        // console.log('remove define',name);
        for (var i = 0; i < defines.length; i++) {
            if (defines[i][0] == name) {
                defines.splice(i, 1);
                this._needsRecompile = true;
                return;
            }
        }
    };

    this.getUniform = function(name) {
        for (var i = 0; i < uniforms.length; i++)
            if (uniforms[i].getName() == name)
                return uniforms[i];
        return null;
    };

    this.removeUniform = function(name) {
        for (var i = 0; i < uniforms.length; i++) {
            if (uniforms[i].getName() == name) {
                uniforms.splice(i, 1);
            }
        }
        this._needsRecompile = true;
        this.setWhyCompile("remove uniform "+name);
    };

    /**
     * add a uniform to the shader
     * @param {uniform} uniform
     * @function
     */
    this.addUniform = function(uni) {
        uniforms.push(uni);
        this.setWhyCompile("add uniform "+name);
        this._needsRecompile = true;
    };

    this.getAttrVertexPos = function() {
        return attrVertexPos;
    };

    this.hasTextureUniforms = function() {
        for (var i = 0; i < uniforms.length; i++)
            if (uniforms[i].getType() == 't') return true;
        return false;
    };

    this.printStats = function() {
        var activeUniforms = cgl.gl.getProgramParameter(this._program, cgl.gl.ACTIVE_UNIFORMS);
        var activeAttributes = cgl.gl.getProgramParameter(this._program, cgl.gl.ACTIVE_ATTRIBUTES);

        var enums = {
            0x8B50: 'FLOAT_VEC2',
            0x8B51: 'FLOAT_VEC3',
            0x8B52: 'FLOAT_VEC4',
            0x8B53: 'INT_VEC2',
            0x8B54: 'INT_VEC3',
            0x8B55: 'INT_VEC4',
            0x8B56: 'BOOL',
            0x8B57: 'BOOL_VEC2',
            0x8B58: 'BOOL_VEC3',
            0x8B59: 'BOOL_VEC4',
            0x8B5A: 'FLOAT_MAT2',
            0x8B5B: 'FLOAT_MAT3',
            0x8B5C: 'FLOAT_MAT4',
            0x8B5E: 'SAMPLER_2D',
            0x8B60: 'SAMPLER_CUBE',
            0x1400: 'BYTE',
            0x1401: 'UNSIGNED_BYTE',
            0x1402: 'SHORT',
            0x1403: 'UNSIGNED_SHORT',
            0x1404: 'INT',
            0x1405: 'UNSIGNED_INT',
            0x1406: 'FLOAT'
        };
        var i = 0;
        var result = {
            uniformCount: 0,
            attributeCount: 0
        };

        // console.log("shader uniforms");
        for (i = 0; i < activeUniforms; i++) {
            var uniform = cgl.gl.getActiveUniform(this._program, i);
            uniform.typeName = enums[uniform.type];
            // result.uniforms.push(uniform);
            // console.log("  ", i, uniform.name, uniform.typeName);

            result.uniformCount += uniform.size;
        }

        // Loop through active attributes
        for (i = 0; i < activeAttributes; i++) {
            var attribute = cgl.gl.getActiveAttrib(this._program, i);
            attribute.typeName = enums[attribute.type];
            // result.attributes.push(attribute);
            console.log("  ", i, attribute.name, attribute.typeName);
            result.attributeCount += attribute.size;
        }

        console.log(result);
    };

    this.compile = function() {



        CGL.profileShaderCompiles++;
        CGL.profileShaderCompileName = name;

        var extensionString = '';
        if (this._extensions)
            for (i = 0; i < this._extensions.length; i++) {
                extensionString += '#extension GL_OES_standard_derivatives : enable'.endl();
            }

        var definesStr = '';
        var i = 0;
        for (i = 0; i < defines.length; i++) {
            definesStr += '#define ' + defines[i][0] + ' ' + defines[i][1] + ''.endl();
        }

        for (i = 0; i < uniforms.length; i++) {
            uniforms[i].resetLoc(); //needsUpdate=true;
        }

        if (self.hasTextureUniforms()) definesStr += '#define HAS_TEXTURES'.endl();

        // console.log('shader compile...');
        // console.log('has textures: '+self.hasTextureUniforms() );

        var vs = '';
        var fs = '';


        if (self.glslVersion == 300)
        {
            vs = '#version 300 es'
                .endl() + '// '
                .endl() + '// vertex shader '+name
                .endl() + '// '
                .endl() + 'precision highp float;'
                .endl() + ''
                // .endl() + '#define attribute in'
                // .endl() + '#define varying out'
                .endl() + '#define texture2D texture'

                .endl() + '#define UNI uniform'
                .endl() + '#define IN in'
                .endl() + '#define OUT out'
                .endl();


            fs = '#version 300 es'
                .endl() + '// '
                .endl() + '// fragment shader '+name
                .endl() + '// '
                .endl() + 'precision highp float;'
                .endl() + ''
                .endl() + '#define texture2D texture'
                .endl() + '#define IN in'
                .endl() + '#define UNI uniform'
                .endl() + 'out vec4 outColor;'
                .endl() + '#define gl_FragColor outColor'
                .endl();
        } else {
            fs = ''
                .endl() + '// '
                .endl() + '// fragment shader '+name
                .endl() + '// '
                .endl() + '#define outColor gl_FragColor'
                .endl() + '#define IN varying'
                .endl() + '#define UNI uniform'
                .endl();

            vs = ''
                .endl() + '// '
                .endl() + '// vertex shader '+name
                .endl() + '// '
                .endl() + '#define OUT varying'
                .endl() + '#define IN attribute'
                .endl() + '#define UNI uniform'
                .endl();
            }

        if (fs.indexOf("precision") == -1) fs = 'precision highp float;'.endl() + fs;
        if (vs.indexOf("precision") == -1) vs = 'precision highp float;'.endl() + vs;

        vs = extensionString + vs + definesStr + self.srcVert;
        fs = extensionString + fs + definesStr + self.srcFrag;

        // console.log(name);
        // console.log(fs);

        var srcHeadVert = '';
        var srcHeadFrag = '';

        modules.sort(function(a, b) {
            return a.group - b.group;
        });


        modules.sort(function(a, b) {
            return a.priority||0 - b.priority||0;
        });



        // for (var j = 0; j < modules.length; j++) {
        //     console.log(j,modules[j].title);
        // }

        var addedAttributes=false;


        for (i = 0; i < moduleNames.length; i++) {
            // console.log('moduleName',moduleNames[i]);
            var srcVert = '';
            var srcFrag = '';

            for (var j = 0; j < modules.length; j++) {
                if (modules[j].name == moduleNames[i]) {

                    console.log(modules[j].name,modules[j].title);

                    srcHeadVert+='\n//---- MOD: '+modules[j].group+': '+j+' - '+modules[j].title+' ------\n';
                    srcHeadFrag+='\n//---- MOD: '+modules[j].group+': '+j+' - '+modules[j].title+' ------\n';

                    srcVert+='\n\n//---- MOD: '+modules[j].title+' ------\n';
                    srcFrag+='\n\n//---- MOD: '+modules[j].title+' ------\n';

                    
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



                    srcHeadVert += modules[j].srcHeadVert || '';
                    srcHeadFrag += modules[j].srcHeadFrag || '';
                    srcVert += modules[j].srcBodyVert || '';
                    srcFrag += modules[j].srcBodyFrag || '';

                    srcHeadVert+='\n//---- end mod ------\n';
                    srcHeadFrag+='\n//---- end mod ------\n';

                    srcVert+='\n//---- end mod ------\n';
                    srcFrag+='\n//---- end mod ------\n';


                    srcVert = srcVert.replace(/{{mod}}/g, modules[j].prefix);
                    srcFrag = srcFrag.replace(/{{mod}}/g, modules[j].prefix);
                    srcHeadVert = srcHeadVert.replace(/{{mod}}/g, modules[j].prefix);
                    srcHeadFrag = srcHeadFrag.replace(/{{mod}}/g, modules[j].prefix);

                    srcVert = srcVert.replace(/MOD_/g, modules[j].prefix);
                    srcFrag = srcFrag.replace(/MOD_/g, modules[j].prefix);
                    srcHeadVert = srcHeadVert.replace(/MOD_/g, modules[j].prefix);
                    srcHeadFrag = srcHeadFrag.replace(/MOD_/g, modules[j].prefix);
                }
            }

            vs = vs.replace('{{' + moduleNames[i] + '}}', srcVert);
            fs = fs.replace('{{' + moduleNames[i] + '}}', srcFrag);
        }
        vs = vs.replace('{{MODULES_HEAD}}', srcHeadVert);
        fs = fs.replace('{{MODULES_HEAD}}', srcHeadFrag);


        if (!self._program) {
            self._program = createProgram(vs, fs);
        } else {
            // self.vshader=createShader(vs, gl.VERTEX_SHADER, self.vshader );
            // self.fshader=createShader(fs, gl.FRAGMENT_SHADER, self.fshader );
            // linkProgram(program);
            self._program = createProgram(vs, fs);

            projMatrixUniform = null;

            for (i = 0; i < uniforms.length; i++) uniforms[i].resetLoc();
        }

        self.finalShaderFrag = fs;
        self.finalShaderVert = vs;


        CGL.MESH.lastMesh = null;
        CGL.MESH.lastShader = null;

        // printStats();
        self._needsRecompile = false;
        self.lastCompile = CABLES.now();
    };

    this.dispose=function()
    {
        cgl.gl.deleteProgram(this._program);
    };

    this.bind = function() {
        var i = 0;
        CGL.MESH.lastShader = this;

        CGL.profileShaderBinds++;

        if (!this._program || this._needsRecompile) self.compile();

        if (!projMatrixUniform) {
            attrVertexPos = cgl.gl.getAttribLocation(this._program, CGL.SHADERVAR_VERTEX_POSITION);
            projMatrixUniform = cgl.gl.getUniformLocation(this._program, "projMatrix");
            mvMatrixUniform = cgl.gl.getUniformLocation(this._program, "mvMatrix");
            vMatrixUniform = cgl.gl.getUniformLocation(this._program, "viewMatrix");
            mMatrixUniform = cgl.gl.getUniformLocation(this._program, "modelMatrix");
            camPosUniform = cgl.gl.getUniformLocation(this._program, "camPos");
            normalMatrixUniform = cgl.gl.getUniformLocation(this._program, "normalMatrix");
            inverseViewMatrixUniform = cgl.gl.getUniformLocation(this._program, "inverseViewMatrix");
            for (i = 0; i < uniforms.length; i++) uniforms[i].needsUpdate = true;
        }

        if (cgl.currentProgram != this._program) {
            cgl.gl.useProgram(this._program);
            cgl.currentProgram = this._program;
        }

        // console.log("Shaderbind");

        for (i = 0; i < uniforms.length; i++) {
            if (uniforms[i].needsUpdate) uniforms[i].updateValue();
        }

        // console.log('bind',name);

        cgl.gl.uniformMatrix4fv(projMatrixUniform, false, cgl.pMatrix);
        if (vMatrixUniform) {
            cgl.gl.uniformMatrix4fv(vMatrixUniform, false, cgl.vMatrix);
            cgl.gl.uniformMatrix4fv(mMatrixUniform, false, cgl.mvMatrix);

            var m = mat4.create();
            mat4.invert(m, cgl.vMatrix);
            cgl.gl.uniform3f(camPosUniform, m[12], m[13], m[14]);
        } else {
            var tempmv = mat4.create();
            mat4.mul(tempmv, cgl.vMatrix, cgl.mvMatrix);
            cgl.gl.uniformMatrix4fv(mvMatrixUniform, false, tempmv);
        }

        if (inverseViewMatrixUniform) {
            var inverseViewMatrix = mat4.create();

            // mat4.mul(inverseViewMatrix,cgl.mvMatrix,cgl.vMatrix);
            // mat4.mul(inverseViewMatrix,cgl.mvMatrix,cgl.vMatrix);

            mat4.invert(inverseViewMatrix, cgl.vMatrix);


            cgl.gl.uniformMatrix4fv(inverseViewMatrixUniform, false, inverseViewMatrix);
        }

        if (normalMatrixUniform) {
            var normalMatrix = mat4.create();

            mat4.mul(normalMatrix, cgl.vMatrix, cgl.mvMatrix);
            // mat4.clone(normalMatrix,cgl.mvMatrix);

            mat4.invert(normalMatrix, normalMatrix);
            mat4.transpose(normalMatrix, normalMatrix);

            cgl.gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);
        }
    };

    var linkProgram = function(program) {
        if (self._feedBackNames.length > 0) {
            cgl.gl.transformFeedbackVaryings(program, self._feedBackNames, cgl.gl.SEPARATE_ATTRIBS);
            // INTERLEAVED_ATTRIBS
            //SEPARATE_ATTRIBS
        }

        cgl.gl.linkProgram(program);
        cgl.gl.validateProgram(program);

        // var infoLog = cgl.gl.getProgramInfoLog(program);
        // if (infoLog) {
        //     // console.log(name+' link programinfo: ',cgl.gl.getProgramInfoLog(program));
        // }

        if (!cgl.gl.getProgramParameter(program, cgl.gl.LINK_STATUS)) {
            console.error(name + " shader linking fail...");
            console.log('srcFrag',self.srcFrag);
            console.log('srcVert',self.srcVert);
            console.log(name + ' programinfo: ', cgl.gl.getProgramInfoLog(program));

            console.log('--------------------------------------');
            console.log(self);
            console.log('--------------------------------------');

            name = "errorshader";
            self.setSource(CGL.Shader.getDefaultVertexShader(), CGL.Shader.getErrorFragmentShader());
        }

        // var error = cgl.gl.getError();
        // if (error == cgl.gl.NO_ERROR )
        // console.log('no error: ',error);
        // else
        //   console.log('get error: ',error);
        // if(self._feedBackNames.length>0)
        //    cgl.gl.transformFeedbackVaryings( program, [], cgl.gl.SEPARATE_ATTRIBS );

    };

    var createProgram = function(vstr, fstr) {
        var program = cgl.gl.createProgram();
        self.vshader = CGL.Shader.createShader(cgl, vstr, cgl.gl.VERTEX_SHADER, self);
        self.fshader = CGL.Shader.createShader(cgl, fstr, cgl.gl.FRAGMENT_SHADER, self);

        cgl.gl.attachShader(program, self.vshader);
        cgl.gl.attachShader(program, self.fshader);

        linkProgram(program);
        return program;
    };

    /**
     * remove a module from shader
     * @param {shaderModule} module the module to be removed
     * @function
     */
    this.removeModule = function(mod) {

        for (var i = 0; i < modules.length; i++)
        {
            if(mod && mod.id)
            {
                console.log(mod.id,modules[i].id);

                if (modules[i].id == mod.id || !modules[i]) {
                    console.log("removed module");
                    this._needsRecompile = true;
                    this.setWhyCompile("remove module "+mod.title);
            
                    modules.splice(i, 1);
                    break;
                }
    
            }
        }
        console.log("could mod find module to remove");
    };

    /**
     * add a module
     * @param {shaderModule} module the module to be added
     * @param {shaderModule} [sibling] sibling module, new module will share the same group
     * @function
     */
    this.addModule = function(mod, sibling) {
        if(!mod.id) mod.id = CABLES.generateUUID();
        if(!mod.numId) mod.numId = moduleNumId;
        if(!mod.num)mod.num = modules.length;

        console.log("add module",mod.title);

        if (sibling) mod.group = sibling.group;
            else mod.group = this._modGroupCount++;

        mod.prefix = 'mod' + mod.group;

        modules.push(mod);
        this._needsRecompile = true;
        this.setWhyCompile("add module "+mod.title);
        moduleNumId++;


        return mod;
    };

    this.getNumModules = function() {
        return modules.length;
    };

    this.setModules = function(names) {
        moduleNames = names;
    };

    this.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

    this.getCurrentModules=function(){return modules;};

};

CGL.Shader.prototype.getProgram = function() {
    return this._program;
};

CGL.Shader.prototype.setFeedbackNames = function(names) {
    this._needsRecompile = true;
    this._feedBackNames = names;
};

CGL.Shader.prototype.getDefaultVertexShader = CGL.Shader.getDefaultVertexShader = function() {
    return ''
        .endl()+'{{MODULES_HEAD}}'
        .endl() + 'IN vec3 vPosition;'
        .endl() + 'IN vec2 attrTexCoord;'
        .endl() + 'IN vec3 attrVertNormal;'
        .endl() + 'OUT vec2 texCoord;'
        .endl() + 'OUT vec3 norm;'
        .endl() + 'UNI mat4 projMatrix;'
        .endl() + 'UNI mat4 mvMatrix;'
        .endl() + 'UNI mat4 modelMatrix;'
        // .endl()+'uniform mat4 normalMatrix;'

        .endl() + 'void main()'
        .endl() + '{'
        .endl() + '   texCoord=attrTexCoord;'
        .endl() + '   norm=attrVertNormal;'
        .endl() + '   vec4 pos=vec4(vPosition,  1.0);'
        .endl() + '   mat4 mMatrix=modelMatrix;'
        
        .endl() + '   {{MODULE_VERTEX_POSITION}}'

        .endl() + '   gl_Position = projMatrix * mvMatrix * pos;'
        .endl() + '}';
};

CGL.Shader.prototype.getDefaultFragmentShader = CGL.Shader.getDefaultFragmentShader = function(r,g,b) {

    if(r==undefined)
    {
        r=0.5;
        g=0.5;
        b=0.5;
    }
    return ''
        // .endl()+'precision highp float;'
        // .endl()+'varying vec3 norm;'
        .endl()+'{{MODULES_HEAD}}'
        .endl() + 'void main()'
        .endl() + '{'
        .endl() + '    vec4 col=vec4('+r+','+g+','+b+',1.0);'
        .endl() + '    {{MODULE_COLOR}}'
        .endl() + '    outColor = col;'
        // '   gl_FragColor = vec4(norm.x,norm.y,1.0,1.0);\n'+
        .endl() + '}';
};

/**
 * @function
 * adds attribute definition to shader header without colliding with other shader modules...
 * when attrFrag is defined, vertex shader will output this attribute to the fragment shader
 * @name CGL.Shader#addAttribute
 * @param {Object} attribObject {type:x,name:x,[nameFrag:x]}
 * @return {Object}
 */
CGL.Shader.prototype.addAttribute = function(attr) {
    for(var i=0;i<this._attributes.length;i++)
    {
        if(this._attributes[i].name==attr.name && this._attributes[i].nameFrag==attr.nameFrag)return;
    }
    this._attributes.push(attr);
    this._needsRecompile = true;
};





// --------------------------

CGL.Shader.getErrorFragmentShader = function() {
    return ''
        // .endl()+'precision mediump float;'
        // .endl() + 'IN vec3 norm;'
        .endl() + 'void main()'
        .endl() + '{'
        .endl() + '   float g=mod(gl_FragCoord.y+gl_FragCoord.x,0.02)*50.0;'
        .endl() + '   if(g>0.5)g=0.4;'
        .endl() + '       else g=0.0;'
        .endl() + '   outColor = vec4( 1.0, g, 0.0, 1.0);'
        .endl() + '}';
};

CGL.Shader.createShader = function(cgl, str, type, cglShader) {
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
        console.log('compile status: ');

        if (type == cgl.gl.VERTEX_SHADER) console.log('VERTEX_SHADER');
        if (type == cgl.gl.FRAGMENT_SHADER) console.log('FRAGMENT_SHADER');

        console.warn(cgl.gl.getShaderInfoLog(shader));

        var infoLog = cgl.gl.getShaderInfoLog(shader);
        var badLines = getBadLines(infoLog);
        var htmlWarning = '<div class="shaderErrorCode">';
        var lines = str.match(/^.*((\r\n|\n|\r)|$)/gm);

        for (var i in lines) {
            var j = parseInt(i, 10) + 1;
            var line = j + ': ' + lines[i];
            console.log(line);

            var isBadLine = false;
            for (var bj in badLines)
                if (badLines[bj] == j) isBadLine = true;

            if (isBadLine) htmlWarning += '<span class="error">';
            htmlWarning += line;
            if (isBadLine) htmlWarning += '</span>';
        }

        console.warn(infoLog);

        infoLog = infoLog.replace(/\n/g, '<br/>');

        htmlWarning = infoLog + '<br/>' + htmlWarning + '<br/><br/>';

        if (CABLES.UI) CABLES.UI.MODAL.showError('shader error ' + name, htmlWarning);
        else {
            console.log('shader error ' + name, htmlWarning);
        }

        htmlWarning += '</div>';

        name = "errorshader";
        cglShader.setSource(CGL.Shader.getDefaultVertexShader(), CGL.Shader.getErrorFragmentShader());
    } else {
        // console.log(name+' shader compiled...');
    }
    return shader;
};