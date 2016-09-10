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
