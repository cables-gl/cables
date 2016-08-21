CABLES.Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='MatCapMaterial';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.shaderOut=this.addOutPort(new Port(this,"shader",OP_PORT_TYPE_OBJECT));
this.shaderOut.ignoreValueSerialize=true;

this.texture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
this.textureUniform=null;

this.textureDiffuse=this.addInPort(new Port(this,"diffuse",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
this.textureDiffuseUniform=null;

this.textureNormal=this.addInPort(new Port(this,"normal",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
this.textureNormalUniform=null;

this.normalScale=this.addInPort(new Port(this,"normalScale",OP_PORT_TYPE_VALUE,{display:'range'}));
this.normalScale.val=0.4;
this.normalScaleUniform=null;

this.textureSpec=this.addInPort(new Port(this,"specular",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
this.textureSpecUniform=null;

this.textureSpecMatCap=this.addInPort(new Port(this,"specular matcap",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
this.textureSpecMatCapUniform=null;


this.diffuseRepeatX=this.addInPort(new Port(this,"diffuseRepeatX",OP_PORT_TYPE_VALUE));
this.diffuseRepeatY=this.addInPort(new Port(this,"diffuseRepeatY",OP_PORT_TYPE_VALUE));
this.diffuseRepeatX.val=1.0;
this.diffuseRepeatY.val=1.0;

this.diffuseRepeatX.onValueChanged=function()
{
    self.diffuseRepeatXUniform.setValue(self.diffuseRepeatX.val);
};

this.diffuseRepeatY.onValueChanged=function()
{
    self.diffuseRepeatYUniform.setValue(self.diffuseRepeatY.val);
};


this.calcTangents=this.addInPort(new Port(this,"calc normal tangents",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.calcTangents.onValueChanged=function()
{
    if(self.calcTangents.val) shader.define('CALC_TANGENT');
        else shader.removeDefine('CALC_TANGENT');
};

this.projectCoords=this.addInPort(new Port(this,"projectCoords",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['no','xy','yz','xz']}));
this.projectCoords.val='no';
this.projectCoords.onValueChanged=function()
{
    shader.removeDefine('DO_PROJECT_COORDS_XY');
    shader.removeDefine('DO_PROJECT_COORDS_YZ');
    shader.removeDefine('DO_PROJECT_COORDS_XZ');

    if(self.projectCoords.val=='xy') shader.define('DO_PROJECT_COORDS_XY');
    if(self.projectCoords.val=='yz') shader.define('DO_PROJECT_COORDS_YZ');
    if(self.projectCoords.val=='xz') shader.define('DO_PROJECT_COORDS_XZ');
};

this.normalRepeatX=this.addInPort(new Port(this,"normalRepeatX",OP_PORT_TYPE_VALUE));
this.normalRepeatY=this.addInPort(new Port(this,"normalRepeatY",OP_PORT_TYPE_VALUE));
this.normalRepeatX.val=1.0;
this.normalRepeatY.val=1.0;

this.normalRepeatX.onValueChanged=function()
{
    self.normalRepeatXUniform.setValue(self.normalRepeatX.val);
};

this.normalRepeatY.onValueChanged=function()
{
    self.normalRepeatYUniform.setValue(self.normalRepeatY.val);
};

this.normalScale.onValueChanged=function()
{
    self.normalScaleUniform.setValue(self.normalScale.val*2.0);
};

this.texture.onPreviewChanged=function()
{
    if(self.texture.showPreview) self.render.onTriggered=self.texture.val.preview;
        else self.render.onTriggered=self.doRender;
};

this.textureDiffuse.onPreviewChanged=function()
{
    if(self.textureDiffuse.showPreview) self.render.onTriggered=self.textureDiffuse.val.preview;
        else self.render.onTriggered=self.doRender;
};

this.textureNormal.onPreviewChanged=function()
{
    if(self.textureNormal.showPreview) self.render.onTriggered=self.textureNormal.val.preview;
        else self.render.onTriggered=self.doRender;
};

this.texture.onValueChanged=function()
{
    if(self.texture.get())
    {
        if(self.textureUniform!==null)return;
        shader.removeUniform('tex');
        self.textureUniform=new CGL.Uniform(shader,'t','tex',0);
    }
    else
    {
        shader.removeUniform('tex');
        self.textureUniform=null;
    }
};

this.textureDiffuse.onValueChanged=function()
{
    if(self.textureDiffuse.val)
    {
        if(self.textureDiffuseUniform!==null)return;
        shader.define('HAS_DIFFUSE_TEXTURE');
        shader.removeUniform('texDiffuse');
        self.textureDiffuseUniform=new CGL.Uniform(shader,'t','texDiffuse',1);
    }
    else
    {
        shader.removeDefine('HAS_DIFFUSE_TEXTURE');
        shader.removeUniform('texDiffuse');
        self.textureDiffuseUniform=null;
    }
};



this.textureNormal.onValueChanged=function()
{
    if(self.textureNormal.val)
    {
        if(self.textureNormalUniform!==null)return;
        shader.define('HAS_NORMAL_TEXTURE');
        shader.removeUniform('texNormal');
        self.textureNormalUniform=new CGL.Uniform(shader,'t','texNormal',2);
    }
    else
    {
        shader.removeDefine('HAS_NORMAL_TEXTURE');
        shader.removeUniform('texNormal');
        self.textureNormalUniform=null;
    }
};


function changeSpec()
{
    if(self.textureSpec.val && self.textureSpecMatCap.val)
    {
        if(self.textureSpecUniform!==null)return;
        shader.define('USE_SPECULAR_TEXTURE');
        shader.removeUniform('texSpec');
        shader.removeUniform('texSpecMatCap');
        self.textureSpecUniform=new CGL.Uniform(shader,'t','texSpec',3);
        self.textureSpecMatCapUniform=new CGL.Uniform(shader,'t','texSpecMatCap',4);
    }
    else
    {
        shader.removeDefine('USE_SPECULAR_TEXTURE');
        shader.removeUniform('texSpec');
        shader.removeUniform('texSpecMatCap');
        self.textureSpecUniform=null;
        self.textureSpecMatCapUniform=null;
    }

}

this.textureSpec.onValueChanged=changeSpec;
this.textureSpecMatCap.onValueChanged=changeSpec;


function bindTextures()
{
    if(self.texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.texture.get().tex);
    }

    if(self.textureDiffuse.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.textureDiffuse.val.tex);
    }

    if(self.textureNormal.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE2);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.textureNormal.val.tex);
    }

    if(self.textureSpec.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE3);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.textureSpec.val.tex);
    }
    if(self.textureSpecMatCap.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE4);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.textureSpecMatCap.val.tex);
    }

};




this.doRender=function()
{
    bindTextures();
    cgl.setShader(shader);
    

    self.trigger.trigger();
    cgl.setPreviousShader();
};

var srcVert=''
    .endl()+'{{MODULES_HEAD}}'
    .endl()+'precision highp float;'
    .endl()+'attribute vec3 vPosition;'
    .endl()+'attribute vec2 attrTexCoord;'
    .endl()+'attribute vec3 attrVertNormal;'

    .endl()+'#ifdef HAS_NORMAL_TEXTURE'
    .endl()+'   attribute vec3 attrTangent;'
    .endl()+'   attribute vec3 attrBiTangent;'

    .endl()+'   varying vec3 vBiTangent;'
    .endl()+'   varying vec3 vTangent;'
    .endl()+'#endif'

    .endl()+'varying vec2 texCoord;'
    .endl()+'varying vec3 norm;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 modelMatrix;'
    .endl()+'uniform mat4 viewMatrix;'
    .endl()+'uniform mat4 normalMatrix;'
    .endl()+'varying vec2 vNorm;'

    .endl()+'varying vec3 e;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'    texCoord=attrTexCoord;'
    .endl()+'    norm=attrVertNormal;'

    .endl()+'    #ifdef HAS_NORMAL_TEXTURE'
    .endl()+'        vTangent=attrTangent;'
    .endl()+'        vBiTangent=attrBiTangent;'
    .endl()+'    #endif'

    .endl()+'    vec4 pos = vec4( vPosition, 1. );'

    .endl()+'    {{MODULE_VERTEX_POSITION}}'
    .endl()+'    mat4 mvMatrix= viewMatrix * modelMatrix;'
    .endl()+'    e = normalize( vec3( mvMatrix * pos ) );'
    .endl()+'    vec3 n = normalize( mat3(normalMatrix) * norm );'

    .endl()+'    vec3 r = reflect( e, n );'
    .endl()+'    float m = 2. * sqrt( '
    .endl()+'        pow(r.x, 2.0)+'
    .endl()+'        pow(r.y, 2.0)+'
    .endl()+'        pow(r.z + 1.0, 2.0)'
    .endl()+'    );'
    .endl()+'    vNorm = r.xy / m + 0.5;'

    .endl()+'   #ifdef DO_PROJECT_COORDS_XY'
    .endl()+'       texCoord=(projMatrix * mvMatrix*pos).xy*0.1;'
    .endl()+'   #endif'

    .endl()+'   #ifdef DO_PROJECT_COORDS_YZ'
    .endl()+'       texCoord=(projMatrix * mvMatrix*pos).yz*0.1;'
    .endl()+'   #endif'

    .endl()+'   #ifdef DO_PROJECT_COORDS_XZ'
    .endl()+'       texCoord=(projMatrix * mvMatrix*pos).xz*0.1;'
    .endl()+'   #endif'

    .endl()+'    gl_Position = projMatrix * mvMatrix * pos;'

    .endl()+'}';


var srcFrag=''
    .endl()+'precision highp float;'

    .endl()+'{{MODULES_HEAD}}'

    .endl()+'varying vec3 norm;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'varying vec2 vNorm;'

    .endl()+'uniform float diffuseRepeatX;'
    .endl()+'uniform float diffuseRepeatY;'


    .endl()+'#ifdef HAS_DIFFUSE_TEXTURE'
    .endl()+'   uniform sampler2D texDiffuse;'
    .endl()+'#endif'

    .endl()+'#ifdef USE_SPECULAR_TEXTURE'
    .endl()+'   uniform sampler2D texSpec;'
    .endl()+'   uniform sampler2D texSpecMatCap;'
    .endl()+'#endif'


    .endl()+'#ifdef HAS_NORMAL_TEXTURE'
    .endl()+'   varying vec3 vBiTangent;'
    .endl()+'   varying vec3 vTangent;'

    .endl()+'   uniform sampler2D texNormal;'
    .endl()+'   uniform mat4 normalMatrix;'
    .endl()+'   uniform float normalScale;'
    .endl()+'   uniform float normalRepeatX;'
    .endl()+'   uniform float normalRepeatY;'
    .endl()+'   varying vec3 e;'
    .endl()+'   vec2 vNormt;'
    .endl()+'#endif'

    .endl()+''
    .endl()+'void main()'
    .endl()+'{'

    .endl()+'   vec2 vnOrig=vNorm;'
    .endl()+'   vec2 vn=vNorm;'

    .endl()+'   #ifdef HAS_TEXTURES'
    .endl()+'       vec2 texCoords=texCoord;'
    .endl()+'       {{MODULE_BEGIN_FRAG}}'
    .endl()+'   #endif'


    .endl()+'   #ifdef HAS_NORMAL_TEXTURE'
    .endl()+'       vec3 tnorm=texture2D( texNormal, vec2(texCoord.x*normalRepeatX,texCoord.y*normalRepeatY) ).xyz * 2.0 - 1.0;'

    .endl()+'       tnorm = normalize(tnorm*normalScale);'

    .endl()+'       vec3 tangent;'
    .endl()+'       vec3 binormal;'

    .endl()+'       #ifdef CALC_TANGENT'
    .endl()+'           vec3 c1 = cross(norm, vec3(0.0, 0.0, 1.0));'
    // .endl()+'           vec3 c2 = cross(norm, vec3(0.0, 1.0, 0.0));'
    // .endl()+'           if(length(c1)>length(c2)) tangent = c2;'
    // .endl()+'               else tangent = c1;'
    .endl()+'           tangent = c1;'
    .endl()+'           tangent = normalize(tangent);'
    .endl()+'           binormal = cross(norm, tangent);'
    .endl()+'           binormal = normalize(binormal);'
    .endl()+'       #endif'

    .endl()+'       #ifndef CALC_TANGENT'
    .endl()+'           tangent=normalize(vTangent);'
    // .endl()+'           tangent.y*=-13.0;'
    // .endl()+'           binormal=vBiTangent*norm;'
    // .endl()+'           binormal.z*=-1.0;'
    // .endl()+'           binormal=normalize(binormal);'
    .endl()+'           binormal=normalize( cross( normalize(norm), normalize(vBiTangent) )   );'
        // vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );

    .endl()+'       #endif'

    .endl()+'       tnorm=normalize(tangent*tnorm.x + binormal*tnorm.y + norm*tnorm.z);'

    .endl()+'       vec3 n = normalize( mat3(normalMatrix) * (norm+tnorm*normalScale) );'

    .endl()+'       vec3 r = reflect( e, n );'
    .endl()+'       float m = 2. * sqrt( '
    .endl()+'           pow(r.x, 2.0)+'
    .endl()+'           pow(r.y, 2.0)+'
    .endl()+'           pow(r.z + 1.0, 2.0)'
    .endl()+'       );'
    .endl()+'       vn = (r.xy / m + 0.5);'

    .endl()+'       vn.t=clamp(vn.t, 0.0, 1.0);'
    .endl()+'       vn.s=clamp(vn.s, 0.0, 1.0);'
    .endl()+'    #endif'

    .endl()+'    vec4 col = texture2D( tex, vn );'

    // .endl()+'   float bias=0.1;'
    // .endl()+'    if(vn.s>1.0-bias || vn.t>1.0-bias || vn.s<bias || vn.t<bias)' //col.rgb=vec3(0.0,1.0,0.0);
    // .endl()+'    {;'
    // .endl()+'       col = texture2D( tex, vnOrig );'

    // .endl()+'    };'


    .endl()+'    #ifdef HAS_DIFFUSE_TEXTURE'
    .endl()+'       col = col*texture2D( texDiffuse, vec2(texCoords.x*diffuseRepeatX,texCoords.y*diffuseRepeatY));'
    .endl()+'    #endif'

    .endl()+'    #ifdef USE_SPECULAR_TEXTURE'
    .endl()+'       vec4 spec = texture2D( texSpecMatCap, vn );'
    .endl()+'       spec*= texture2D( texSpec, vec2(texCoords.x*diffuseRepeatX,texCoords.y*diffuseRepeatY) );'
    .endl()+'       col+=spec;'
    .endl()+'    #endif'

    .endl()+'    {{MODULE_COLOR}}'

    // .endl()+'    col.xy=vn;'
    // .endl()+'    col.r=0.0;'
    // .endl()+'    col.g=0.0;'
    // .endl()+'    col.b=0.0;'

    // .endl()+'    if()col.rgb=vec3(1.0,0.0,0.0);'

    // .endl()+'    col.rgb=vec3(length(vn),0.0,0.0);'


    .endl()+'    gl_FragColor = col;'
    .endl()+''
    .endl()+'}';

var shader=new CGL.Shader(cgl,'MatCapMaterial');

shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);


shader.bindTextures=bindTextures;
this.shaderOut.val=shader;
this.onLoaded=shader.compile;
shader.setSource(srcVert,srcFrag);
this.normalScaleUniform=new CGL.Uniform(shader,'f','normalScale',self.normalScale.val);
this.normalRepeatXUniform=new CGL.Uniform(shader,'f','normalRepeatX',self.normalRepeatX.val);
this.normalRepeatYUniform=new CGL.Uniform(shader,'f','normalRepeatY',self.normalRepeatY.val);

this.diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',self.diffuseRepeatX.val);
this.diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',self.diffuseRepeatY.val);

this.render.onTriggered=this.doRender;
this.calcTangents.set(true);
this.doRender();