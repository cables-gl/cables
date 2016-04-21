
this.name='BasicMaterial';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.shaderOut=this.addOutPort(new Port(this,"shader",OP_PORT_TYPE_OBJECT));
this.shaderOut.ignoreValueSerialize=true;

var self=this;
var cgl=op.patch.cgl;

this.bindTextures=function()
{
    if(self.texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.texture.val.tex);
    }

    if(self.textureOpacity.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.textureOpacity.val.tex);
    }
};

this.doRender=function()
{
    cgl.setShader(shader);
    shader.bindTextures();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);


    self.trigger.trigger();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.setPreviousShader();
};

var shader=new CGL.Shader(cgl,'BasicMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.bindTextures=this.bindTextures;
this.shaderOut.val=shader;
this.onLoaded=shader.compile;
shader.setSource(attachments.shader_vert,attachments.shader_frag);

this.r=this.addInPort(new Port(this,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
this.r.onValueChanged=function()
{
    if(!self.r.uniform) self.r.uniform=new CGL.Uniform(shader,'f','r',self.r.get());
    else self.r.uniform.setValue(self.r.get());
};

this.g=this.addInPort(new Port(this,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.g.onValueChanged=function()
{
    if(!self.g.uniform) self.g.uniform=new CGL.Uniform(shader,'f','g',self.g.get());
    else self.g.uniform.setValue(self.g.get());
};

this.b=this.addInPort(new Port(this,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.b.onValueChanged=function()
{
    if(!self.b.uniform) self.b.uniform=new CGL.Uniform(shader,'f','b',self.b.get());
    else self.b.uniform.setValue(self.b.get());
};

this.a=this.addInPort(new Port(this,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));
this.a.onValueChanged=function()
{
    if(!self.a.uniform) self.a.uniform=new CGL.Uniform(shader,'f','a',self.a.get());
    else self.a.uniform.setValue(self.a.get());
};

this.r.val=Math.random();
this.g.val=Math.random();
this.b.val=Math.random();
this.a.val=1.0;

this.render.onTriggered=this.doRender;
this.texture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
this.textureUniform=null;

this.texture.onPreviewChanged=function()
{
    if(self.texture.showPreview) self.render.onTriggered=self.texture.val.preview;
    else self.render.onTriggered=self.doRender;

    console.log('show preview!');
};


this.texture.onValueChanged=function()
{
    if(self.texture.get())
    {
        if(self.textureUniform!==null)return;
        shader.removeUniform('tex');
        shader.define('HAS_TEXTURE_DIFFUSE');
        self.textureUniform=new CGL.Uniform(shader,'t','tex',0);
    }
    else
    {
        shader.removeUniform('tex');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        self.textureUniform=null;
    }
};

this.textureOpacity=this.addInPort(new Port(this,"textureOpacity",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
this.textureOpacityUniform=null;

this.textureOpacity.onPreviewChanged=function()
{
    if(self.textureOpacity.showPreview) self.render.onTriggered=self.textureOpacity.val.preview;
    else self.render.onTriggered=self.doRender;

    console.log('show preview!');
};

this.textureOpacity.onValueChanged=function()
{
    if(self.textureOpacity.get())
    {
        if(self.textureOpacityUniform!==null)return;
        console.log('TEXTURE OPACITY ADDED');
        shader.removeUniform('texOpacity');
        shader.define('HAS_TEXTURE_OPACITY');
        self.textureOpacityUniform=new CGL.Uniform(shader,'t','texOpacity',1);
    }
    else
    {
        console.log('TEXTURE OPACITY REMOVED');
        shader.removeUniform('texOpacity');
        shader.removeDefine('HAS_TEXTURE_OPACITY');
        self.textureOpacityUniform=null;
    }
};

this.colorizeTexture=this.addInPort(new Port(this,"colorizeTexture",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.colorizeTexture.val=false;
this.colorizeTexture.onValueChanged=function()
{
    if(self.colorizeTexture.val) shader.define('COLORIZE_TEXTURE');
        else shader.removeDefine('COLORIZE_TEXTURE');
};


this.doBillboard=this.addInPort(new Port(this,"billboard",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.doBillboard.val=false;
this.doBillboard.onValueChanged=function()
{
    if(self.doBillboard.val)
        shader.define('BILLBOARD');
    else
        shader.removeDefine('BILLBOARD');
};

var diffuseRepeatX=this.addInPort(new Port(this,"diffuseRepeatX",OP_PORT_TYPE_VALUE));
var diffuseRepeatY=this.addInPort(new Port(this,"diffuseRepeatY",OP_PORT_TYPE_VALUE));
diffuseRepeatX.set(1);
diffuseRepeatY.set(1);

diffuseRepeatX.onValueChanged=function()
{
    diffuseRepeatXUniform.setValue(diffuseRepeatX.get());
    if(diffuseRepeatY.get()!=1.0 || diffuseRepeatX.get()!=1.0) shader.define('TEXTURE_REPEAT');
        else shader.removeDefine('TEXTURE_REPEAT');
};

diffuseRepeatY.onValueChanged=function()
{
    diffuseRepeatYUniform.setValue(diffuseRepeatY.get());
    if(diffuseRepeatY.get()!=1.0 || diffuseRepeatX.get()!=1.0) shader.define('TEXTURE_REPEAT');
        else shader.removeDefine('TEXTURE_REPEAT');
};

var diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX.get());
var diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY.get());

var preMultipliedAlpha=this.addInPort(new Port(this,"preMultiplied alpha",OP_PORT_TYPE_VALUE,{ display:'bool' }));

{
    var texturedPoints=this.addInPort(new Port(this,"textured points",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    texturedPoints.onValueChanged=function()
    {
        if(texturedPoints.get()) shader.define('TEXTURED_POINTS');
            else shader.removeDefine('TEXTURED_POINTS');
    };
}

this.doRender();