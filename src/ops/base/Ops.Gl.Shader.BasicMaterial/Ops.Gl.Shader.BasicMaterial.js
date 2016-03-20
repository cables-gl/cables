var self=this;
var cgl=self.patch.cgl;

this.name='BasicMaterial';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION) );
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.shaderOut=this.addOutPort(new Port(this,"shader",OP_PORT_TYPE_OBJECT));
this.shaderOut.ignoreValueSerialize=true;

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

var srcVert=''
    .endl()+'{{MODULES_HEAD}}'
    .endl()+'attribute vec3 vPosition;'
    .endl()+'attribute vec2 attrTexCoord;'

    .endl()+'#ifdef INSTANCING'
    .endl()+'   attribute mat4 instMat;'
    .endl()+'#endif'
    
    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'    varying vec2 texCoord;'
    .endl()+'    #ifdef TEXTURE_REPEAT'
    .endl()+'        uniform float diffuseRepeatX;'
    .endl()+'        uniform float diffuseRepeatY;'
    .endl()+'    #endif'
    .endl()+'#endif'

    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'    #ifdef HAS_TEXTURES'
    .endl()+'        texCoord=attrTexCoord;'
    .endl()+'        #ifdef TEXTURE_REPEAT'
    .endl()+'            texCoord.s*=diffuseRepeatX;'
    .endl()+'            texCoord.t*=diffuseRepeatY;'
    .endl()+'        #endif'
    .endl()+'   #endif'

    .endl()+'    vec4 pos = vec4( vPosition, 1. );'

    .endl()+'{{MODULE_VERTEX_POSITION}}'

    .endl()+'#ifdef BILLBOARD'
    .endl()+'   vec3 position=vPosition;'

    .endl()+"   gl_Position = projMatrix * mvMatrix * vec4(( "
    .endl()+"       position.x * vec3("
    .endl()+"           mvMatrix[0][0],"
    .endl()+"           mvMatrix[1][0], "
    .endl()+"           mvMatrix[2][0] ) +"
    .endl()+"       position.y * vec3("
    .endl()+"           mvMatrix[0][1],"
    .endl()+"           mvMatrix[1][1], "
    .endl()+"           mvMatrix[2][1]) ), 1.0);"
    .endl()+'#endif '

    .endl()+'#ifdef INSTANCING'
    .endl()+'   pos=instMat*pos;'
    .endl()+'#endif'

    .endl()+"#ifndef BILLBOARD"
    .endl()+'    gl_Position = projMatrix * mvMatrix * pos;'
    .endl()+'#endif '
    .endl()+'}';

var srcFrag=''

    .endl()+'precision highp float;'


    .endl()+'{{MODULES_HEAD}}'
    .endl()+'#ifdef HAS_TEXTURES'

    .endl()+'   varying vec2 texCoord;'
    .endl()+'   #ifdef HAS_TEXTURE_DIFFUSE'
    .endl()+'       uniform sampler2D tex;'
    .endl()+'   #endif'
    .endl()+'   #ifdef HAS_TEXTURE_OPACITY'
    .endl()+'       uniform sampler2D texOpacity;'
    .endl()+'   #endif'
    .endl()+'#endif'
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'

    .endl()+'#ifdef HAS_TEXTURES'
    .endl()+'   vec2 texCoords=texCoord;'
    .endl()+'#endif'

    .endl()+'{{MODULE_BEGIN_FRAG}}'


    .endl()+'   vec4 col=vec4(r,g,b,a);'
    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'      #ifdef HAS_TEXTURE_DIFFUSE'

    .endl()+'           #ifdef TEXTURED_POINTS'
    .endl()+'               col=texture2D(tex,vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y)));'    .endl()+'      #endif'
    .endl()+'           #ifndef TEXTURED_POINTS'
    .endl()+'               col=texture2D(tex,vec2(texCoord.x,(1.0-texCoord.y)));'
    .endl()+'           #endif'

    // .endl()+'           col=texture2D(tex,vec2(texCoords.x*1.0,(1.0-texCoords.y)*1.0));'
    .endl()+'           #ifdef COLORIZE_TEXTURE'
    .endl()+'               col.r*=r;'
    .endl()+'               col.g*=g;'
    .endl()+'               col.b*=b;'
    .endl()+'           #endif'
    .endl()+'      #endif'
    .endl()+'      #ifdef HAS_TEXTURE_OPACITY'
    .endl()+'          col.a*=texture2D(texOpacity,texCoords).g;'
    .endl()+'       #endif'
    .endl()+'       col.a*=a;'
    .endl()+'   #endif'
    .endl()+'{{MODULE_COLOR}}'

    .endl()+'   gl_FragColor = col;'
    .endl()+'}';


var shader=new CGL.Shader(cgl,'BasicMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.bindTextures=this.bindTextures;
this.shaderOut.val=shader;
this.onLoaded=shader.compile;
shader.setSource(srcVert,srcFrag);

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