var CGL=CGL || {};

// ---------------------------------------------------------------------------

CGL.profileShaderBinds=0;
CGL.profileUniformCount=0;
CGL.profileShaderCompiles=0;

CGL.Uniform=function(_shader,_type,_name,_value)
{
    var self=this;
    var loc=-1;
    var name=_name;
    var type=_type;
    var value=0.00001;
    var shader=_shader;
    var port=null;


    this.needsUpdate=true;

    shader.addUniform(this);

    this.getType=function() {return type;};
    this.getName=function() {return name;};
    this.getValue=function() {return value;};
    this.resetLoc=function() { loc=-1;self.needsUpdate=true; };

    this.updateValueF=function()
    {
        if(loc==-1) loc=shader.getCgl().gl.getUniformLocation(shader.getProgram(), name);
        else self.needsUpdate=false;
        shader.getCgl().gl.uniform1f(loc, value);
        CGL.profileUniformCount++;
    };

    this.bindTextures=function()
    {

    };

    this.setValueF=function(v)
    {
        if(v!=value)
        {
            self.needsUpdate=true;
            value=v;
            // self.updateValueF();
        }
    };


    this.updateValue4F=function()
    {
        if(loc==-1)
        {
            loc=shader.getCgl().gl.getUniformLocation(shader.getProgram(), name);
            CGL.profileShaderGetUniform++;
        }
        shader.getCgl().gl.uniform4f(loc, value[0],value[1],value[2],value[3]);
        CGL.profileUniformCount++;
        // self.needsUpdate=false;
    };

    this.setValue4F=function(v)
    {
        self.needsUpdate=true;
        value=v;
    };

    this.updateValueM4=function()
    {
        // console.log(name);
        if(loc==-1)
        {
            loc=shader.getCgl().gl.getUniformLocation(shader.getProgram(), name);
            CGL.profileShaderGetUniform++;
        }
        shader.getCgl().gl.uniformMatrix4fv(loc,false,value);
        CGL.profileUniformCount++;

    };

    this.setValueM4=function(v)
    {
        self.needsUpdate=true;
        value=v;
    };

    this.getLoc=function()
    {
        return loc;
    };




    var oldValue=null;

    this.updateValue3F=function()
    {
        if(!value)
        {
            // console.log('name',name);
            return;
        }
        if(loc==-1)
        {
            loc=shader.getCgl().gl.getUniformLocation(shader.getProgram(), name);
            CGL.profileShaderGetUniform++;
        }

        shader.getCgl().gl.uniform3f(loc, value[0],value[1],value[2]);
        self.needsUpdate=false;
        CGL.profileUniformCount++;
    };

    this.setValue3F=function(v)
    {
        if(!v)return;
        if(!oldValue)
        {
            oldValue=[v[0]-1,1,2];
            self.needsUpdate=true;
        }
        else
        if( v[0]!=oldValue[0] || v[1]!=oldValue[1] || v[2]!=oldValue[2])
        {
            oldValue[0]=v[0];
            oldValue[1]=v[1];
            oldValue[2]=v[2];
            self.needsUpdate=true;
        }

        value=v;
    };

    this.updateValue2F=function()
    {
        if(!value)
        {
            // console.log('name',name);
            return;
        }
        if(loc==-1)
        {
            loc=shader.getCgl().gl.getUniformLocation(shader.getProgram(), name);
            CGL.profileShaderGetUniform++;
        }

        shader.getCgl().gl.uniform2f(loc, value[0],value[1]);
        self.needsUpdate=false;
        CGL.profileUniformCount++;
    };

    this.setValue2F=function(v)
    {
        if(!v)return;
        if(!oldValue)
        {
            oldValue=[v[0]-1,1];
            self.needsUpdate=true;
        }
        else
        if( v[0]!=oldValue[0] || v[1]!=oldValue[1])
        {
            oldValue[0]=v[0];
            oldValue[1]=v[1];
            self.needsUpdate=true;
        }

        value=v;
    };


    this.updateValueT=function()
    {
        if(loc==-1)
        {
            loc=shader.getCgl().gl.getUniformLocation(shader.getProgram(), name);
            CGL.profileShaderGetUniform++;
            if(loc==-1) console.log('texture loc unknown!!');
        }
        CGL.profileUniformCount++;
        shader.getCgl().gl.uniform1i(loc, value);
        self.needsUpdate=false;
    };

    this.setValueT=function(v)
    {
        self.needsUpdate=true;
        value=v;
    };

    if(type=='f')
    {
        this.setValue=this.setValueF;
        this.updateValue=this.updateValueF;
    }

    if(type=='4f')
    {
        this.setValue=this.setValue4F;
        this.updateValue=this.updateValue4F;
    }

    if(type=='3f')
    {
        this.setValue=this.setValue3F;
        this.updateValue=this.updateValue3F;
    }

    if(type=='2f')
    {
        this.setValue=this.setValue2F;
        this.updateValue=this.updateValue2F;
    }

    if(type=='t')
    {
        this.setValue=this.setValueT;
        this.updateValue=this.updateValueT;
    }

    if(type=='m4')
    {
        this.setValue=this.setValueM4;
        this.updateValue=this.updateValueM4;
    }

    function updateFromPort()
    {
        self.setValue(port.get());
    }

    if(typeof _value=="object" && _value instanceof CABLES.Port)
    {


        port=_value;
        value=port.get();
        port.onValueChanged=updateFromPort;
    }
    else
    {
        value=_value;
    }
    this.setValue(value);
    self.needsUpdate=true;
};

// ---------------------------------------------------------------------------

CGL.Shader=function(_cgl,_name)
{
    if(!_cgl) throw "shader constructed without cgl";
    var name=_name || 'unknown';

    var self=this;
    var program=null;
    var uniforms=[];
    var defines=[];
    var needsRecompile=true;
    var infoLog='';
    var cgl=_cgl;
    var projMatrixUniform=null;
    var mvMatrixUniform=null;
    var mMatrixUniform=null;
    var vMatrixUniform=null;
    var camPosUniform=null;
    var normalMatrixUniform=null;
    var attrVertexPos = -1;

    this.glPrimitive=null;
    this.offScreenPass=false;
    this.wireframe=false;

    this.getCgl=function()
    {
        return cgl;
    };

    this.define=function(name,value)
    {
        if(!value)value='';
        // for(var i in defines)
        for(var i=0;i<defines.length;i++)
        {
            if(defines[i][0]==name)
            {
                defines[i][1]=value;
                needsRecompile=true;
                return;
            }
        }
        defines.push([name,value]);
        needsRecompile=true;
    };

    this.hasDefine=function(name,value)
    {
        for(var i=0;i<defines.length;i++)
            if(defines[i][0]==name)
                return true;
    };


    this.removeDefine=function(name,value)
    {
        for(var i=0;i<defines.length;i++)
        {
            if(defines[i][0]==name)
            {
                defines.splice(i,1);
                needsRecompile=true;
                return;
            }
        }
    };

    this.getUniform=function(name)
    {
        for(var i=0;i<uniforms.length;i++)
            if(uniforms[i].getName()==name)
                return uniforms[i];
        return null;
    };

    this.removeUniform=function(name)
    {
        for(var i=0;i<uniforms.length;i++)
        {
            if(uniforms[i].getName()==name)
            {
                uniforms.splice(i,1);
            }
        }
        needsRecompile=true;
    };

    this.addUniform=function(uni)
    {
        uniforms.push(uni);
        needsRecompile=true;
    };

    this.getDefaultVertexShader=function()
    {
        return ''
        // .endl()+'{{MODULES_HEAD}}'

        .endl()+'attribute vec3 vPosition;'
        .endl()+'attribute vec2 attrTexCoord;'
        .endl()+'attribute vec3 attrVertNormal;'
        .endl()+'varying vec2 texCoord;'
        .endl()+'varying vec3 norm;'
        .endl()+'uniform mat4 projMatrix;'
        .endl()+'uniform mat4 mvMatrix;'
        // .endl()+'uniform mat4 normalMatrix;'

        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   texCoord=attrTexCoord;'
        .endl()+'   norm=attrVertNormal;'
        // .endl()+'   {{MODULE_VERTEX_POSITION}}'

        .endl()+'   gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);'
        .endl()+'}';
    };

    this.getDefaultFragmentShader=function()
    {
        return ''
        .endl()+'precision highp float;'
        // .endl()+'varying vec3 norm;'
        .endl()+'void main()'
        .endl()+'{'

        .endl()+'   gl_FragColor = vec4(0.5,0.5,0.5,1.0);'
        // '   gl_FragColor = vec4(norm.x,norm.y,1.0,1.0);\n'+
        .endl()+'}';
    };

    this.getErrorFragmentShader=function()
    {
        return ''
        .endl()+'precision mediump float;'
        .endl()+'varying vec3 norm;'
        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   float g=mod(gl_FragCoord.y+gl_FragCoord.x,0.02)*50.0;'
        .endl()+'   if(g>0.5)g=0.4;'
        .endl()+'       else g=0.0;'
        .endl()+'   gl_FragColor = vec4( 1.0, g, 0.0, 1.0);'
        .endl()+'}';
    };

    this.srcVert=this.getDefaultVertexShader();
    this.srcFrag=this.getDefaultFragmentShader();

    this.setSource=function(srcVert,srcFrag)
    {
        this.srcVert=srcVert;
        this.srcFrag=srcFrag;
    };

    this.getAttrVertexPos=function(){return attrVertexPos;};

    this.hasTextureUniforms=function()
    {
        for(var i=0;i<uniforms.length;i++)
        {
            if(uniforms[i].getType()=='t') return true;
        }
        return false;
    };

    this.compile=function()
    {
        CGL.profileShaderCompiles++;
        var definesStr='';
        var i=0;
        for(i=0;i<defines.length;i++)
        {
            definesStr+='#define '+defines[i][0]+' '+defines[i][1]+''.endl();
        }
        for(i=0;i<uniforms.length;i++)
        {
            uniforms[i].needsUpdate=true;
        }

        if(self.hasTextureUniforms()) definesStr+='#define HAS_TEXTURES'.endl();

        // console.log('shader compile...');
        // console.log('has textures: '+self.hasTextureUniforms() );

        var vs=definesStr+self.srcVert;
        var fs=definesStr+self.srcFrag;


        var srcHeadVert='';
        var srcHeadFrag='';
        for(i=0;i<moduleNames.length;i++)
        {
            var srcVert='';
            var srcFrag='';

            for(var j=0;j<modules.length;j++)
            {
                if(modules[j].name==moduleNames[i])
                {
                    srcVert+=modules[j].srcBodyVert || '';
                    srcFrag+=modules[j].srcBodyFrag || '';
                    srcHeadVert+=modules[j].srcHeadVert || '';
                    srcHeadFrag+=modules[j].srcHeadFrag || '';

                    srcVert=srcVert.replace(/{{mod}}/g,modules[j].prefix);
                    srcFrag=srcFrag.replace(/{{mod}}/g,modules[j].prefix);
                    srcHeadVert=srcHeadVert.replace(/{{mod}}/g,modules[j].prefix);
                    srcHeadFrag=srcHeadFrag.replace(/{{mod}}/g,modules[j].prefix);
                }
            }

            vs=vs.replace('{{'+moduleNames[i]+'}}',srcVert);
            fs=fs.replace('{{'+moduleNames[i]+'}}',srcFrag);
        }
        vs=vs.replace('{{MODULES_HEAD}}',srcHeadVert);
        fs=fs.replace('{{MODULES_HEAD}}',srcHeadFrag);


        if(!program)
        {
            program=createProgram(vs,fs, program);
        }
        else
        {
            // self.vshader=createShader(vs, gl.VERTEX_SHADER, self.vshader );
            // self.fshader=createShader(fs, gl.FRAGMENT_SHADER, self.fshader );
            // linkProgram(program);
            program=createProgram(vs,fs, program);

            projMatrixUniform=null;

            for(i=0;i<uniforms.length;i++)
                uniforms[i].resetLoc();
        }

        needsRecompile=false;
    };




    this.bind=function()
    {
        var i=0;
        CGL.MESH.lastShader=this;

        CGL.profileShaderBinds++;

        if(!program || needsRecompile) self.compile();

        if(!projMatrixUniform)
        {
            attrVertexPos = cgl.gl.getAttribLocation(program, 'vPosition');
            projMatrixUniform = cgl.gl.getUniformLocation(program, "projMatrix");
            mvMatrixUniform = cgl.gl.getUniformLocation(program, "mvMatrix");
            vMatrixUniform = cgl.gl.getUniformLocation(program, "viewMatrix");
            mMatrixUniform = cgl.gl.getUniformLocation(program, "modelMatrix");
            camPosUniform = cgl.gl.getUniformLocation(program, "camPos");
            normalMatrixUniform = cgl.gl.getUniformLocation(program, "normalMatrix");
            for(i=0;i<uniforms.length;i++)uniforms[i].needsUpdate=true;
        }

        if(cgl.currentProgram!=program)
        {
            cgl.gl.useProgram(program);
            cgl.currentProgram=program;
        }

        for(i=0;i<uniforms.length;i++)
        {
            if(uniforms[i].needsUpdate)uniforms[i].updateValue();
        }

        // console.log('bind',name);

        cgl.gl.uniformMatrix4fv(projMatrixUniform, false, cgl.pMatrix);
        if(vMatrixUniform)
        {
            cgl.gl.uniformMatrix4fv(vMatrixUniform, false, cgl.vMatrix);
            cgl.gl.uniformMatrix4fv(mMatrixUniform, false, cgl.mvMatrix);

            var m=mat4.create();
            mat4.invert(m,cgl.vMatrix);
            cgl.gl.uniform3f(camPosUniform, m[12],m[13],m[14]);
        }
        else
        {
            var tempmv=mat4.create();
            mat4.mul(tempmv,cgl.vMatrix,cgl.mvMatrix);
            cgl.gl.uniformMatrix4fv(mvMatrixUniform, false, tempmv);
        }

        if(normalMatrixUniform)
        {
            var normalMatrix = mat4.create();
            mat4.invert(normalMatrix,cgl.mvMatrix);
            mat4.transpose(normalMatrix, normalMatrix);

            cgl.gl.uniformMatrix4fv(normalMatrixUniform, false, normalMatrix);
        }
    };

    this.getProgram=function()
    {
        return program;
    };

    var createShader =function(str, type,_shader)
    {

        function getBadLines(infoLog)
        {
            var basLines=[];
            var lines=infoLog.split('\n');
            for(var i in lines)
            {
                var divide=lines[i].split(':');

                if(parseInt(divide[2],10))
                    basLines.push(parseInt( divide[2],10) );
            }
            // console.log('lines ',lines.length);
            return basLines;
        }

        var shader = _shader || cgl.gl.createShader(type);
        cgl.gl.shaderSource(shader, str);
        cgl.gl.compileShader(shader);


        if (!cgl.gl.getShaderParameter(shader, cgl.gl.COMPILE_STATUS))
        {
            console.log('compile status: ');

            if(type==cgl.gl.VERTEX_SHADER)console.log('VERTEX_SHADER');
            if(type==cgl.gl.FRAGMENT_SHADER)console.log('FRAGMENT_SHADER');

            console.warn( cgl.gl.getShaderInfoLog(shader) );

            var infoLog=cgl.gl.getShaderInfoLog(shader);
            var badLines=getBadLines(infoLog);
            var htmlWarning='<div class="shaderErrorCode">';
            var lines = str.match(/^.*((\r\n|\n|\r)|$)/gm);

            for(var i in lines)
            {
                var j=parseInt(i,10)+1;
                var line=j+': '+lines[i];
                console.log(line);

                var isBadLine=false;
                for(var bj in badLines) if(badLines[bj]==j) isBadLine=true;

                if(isBadLine) htmlWarning+='<span class="error">';
                htmlWarning+=line;
                if(isBadLine) htmlWarning+='</span>';
            }

            console.warn( infoLog );

            infoLog=infoLog.replace(/\n/g,'<br/>');

            htmlWarning=infoLog+'<br/>'+htmlWarning+'<br/><br/>';

            if(CABLES.UI) CABLES.UI.MODAL.showError('shader error '+name,htmlWarning);
            else
            {
                console.log('shader error '+name,htmlWarning);
            }

            htmlWarning+='</div>';

            name="errorshader";
            self.setSource(self.getDefaultVertexShader(),self.getErrorFragmentShader());
        }
        else
        {
            // console.log(name+' shader compiled...');
        }
        return shader;
    };

    var linkProgram=function(program)
    {
        cgl.gl.linkProgram(program);

        var infoLog=cgl.gl.getProgramInfoLog(program);
        if(infoLog)
        {
            // console.log(name+' link programinfo: ',cgl.gl.getProgramInfoLog(program));
        }

        if (!cgl.gl.getProgramParameter(program, cgl.gl.LINK_STATUS))
        {
            console.error(name+" shader linking fail...");
            console.log(this.srcFrag);
            console.log(name+' programinfo: ',cgl.gl.getProgramInfoLog(program));
            name="errorshader";
            self.setSource(self.getDefaultVertexShader(),self.getErrorFragmentShader());
        }
        else
        {

        }

        // var error = cgl.gl.getError();
        // if (error == cgl.gl.NO_ERROR )
        // console.log('no error: ',error);
        // else
        //   console.log('get error: ',error);

    };

    var createProgram=function(vstr, fstr)
    {
        var program = cgl.gl.createProgram();
        self.vshader = createShader(vstr, cgl.gl.VERTEX_SHADER);
        self.fshader = createShader(fstr, cgl.gl.FRAGMENT_SHADER);

        cgl.gl.attachShader(program, self.vshader);
        cgl.gl.attachShader(program, self.fshader);

        linkProgram(program);
        return program;
    };

    var moduleNames=[];
    var modules=[];
    var moduleNumId=0;

    this.removeModule=function(mod)
    {
        for(var i=0;i<modules.length;i++)
        {
            if(modules[i].id==mod.id)
            {
                modules.splice(i,1);
                break;
            }
        }
        needsRecompile=true;
    };

    this.addModule=function(mod)
    {

        mod.id=CABLES.generateUUID();
        mod.numId=moduleNumId;
        mod.prefix='mod'+moduleNumId;

        modules.push(mod);
        needsRecompile=true;
        moduleNumId++;

        return mod;
    };

    this.setModules=function(names)
    {
        moduleNames=names;
    };


};
