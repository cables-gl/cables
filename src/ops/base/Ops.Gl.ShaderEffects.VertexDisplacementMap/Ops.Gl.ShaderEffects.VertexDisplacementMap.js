var cgl=op.patch.cgl;

op.name='VertexDisplacement';
op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var texture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));

var extrude=op.inValue("extrude",0.5);//addInPort(new Port(this,"extrude",OP_PORT_TYPE_VALUE));

var flip=op.inValueBool("flip",false);

var removeZero=op.addInPort(new Port(this,"Ignore Zero Values",OP_PORT_TYPE_VALUE,{display:'bool'}));

var invert=op.addInPort(new Port(this,"invert",OP_PORT_TYPE_VALUE,{display:'bool'}));
invert.set(false);
var offsetX=op.addInPort(new Port(this,"offset X",OP_PORT_TYPE_VALUE));
var offsetY=op.addInPort(new Port(this,"offset Y",OP_PORT_TYPE_VALUE));

var colorize=op.addInPort(new Port(this,"colorize",OP_PORT_TYPE_VALUE,{display:'bool'}));
var colorizeAdd=op.addInPort(new Port(this,"colorize add",OP_PORT_TYPE_VALUE,{display:'range'}));
colorize.set(false);

function updateColorize()
{
    if(shader)
        if(colorize.get()) shader.define('HEIGHTMAP_COLORIZE');
            else shader.removeDefine('HEIGHTMAP_COLORIZE');
}

function updateInvert()
{
    if(shader)
        if(invert.get()) shader.define('HEIGHTMAP_INVERT');
            else shader.removeDefine('HEIGHTMAP_INVERT');
}

colorize.onValueChanged=updateColorize;
invert.onValueChanged=updateInvert;

var meth=op.addInPort(new Port(this,"mode",OP_PORT_TYPE_VALUE,{display:'dropdown',
    values:['mul xyz','add z','add y','sub z']}));
    

removeZero.onValueChanged=updateRemoveZero;

function updateRemoveZero()
{
    if(shader)
        if(removeZero.get()) shader.define('DISPLACE_REMOVE_ZERO');
            else shader.removeDefine('DISPLACE_REMOVE_ZERO');
}

var updateMethod=function()
{
    if(shader)
    {
        if(flip.get()) shader.define('FLIPY');
            else shader.removeDefine('FLIPY');

        shader.removeDefine('DISPLACE_METH_MULXYZ');
        shader.removeDefine('DISPLACE_METH_ADDZ');
        shader.removeDefine('DISPLACE_METH_ADDY');

        if(meth.get()=='mul xyz') shader.define('DISPLACE_METH_MULXYZ');
        if(meth.get()=='add z') shader.define('DISPLACE_METH_ADDZ');
        if(meth.get()=='add y') shader.define('DISPLACE_METH_ADDY');
        
        updateRemoveZero();
    }
};

flip.onValueChanged=updateMethod;
meth.onValueChanged=updateMethod;
meth.set('mul xyz');

var shader=null;
var uniExtrude,uniTexture;

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_extrude;'
    .endl()+'uniform sampler2D {{mod}}_texture;'
    .endl()+'uniform float {{mod}}_offsetX;'
    .endl()+'uniform float {{mod}}_offsetY;'

    .endl()+'varying float displHeightMapColor;'
    .endl();

var srcBodyVert=''


    .endl()+'vec2 tc=texCoord;'
    
    .endl()+'#ifdef FLIPY'
    .endl()+'    tc.y=1.0-tc.y;'
    .endl()+'#endif'


    .endl()+'float {{mod}}_texVal=texture2D( {{mod}}_texture, vec2(tc.x+{{mod}}_offsetX,tc.y+{{mod}}_offsetY) ).b;'

    .endl()+'#ifdef HEIGHTMAP_INVERT'
    .endl()+'{{mod}}_texVal=1.0-{{mod}}_texVal;'
    .endl()+'#endif'

    .endl()+'#ifdef DISPLACE_METH_MULXYZ'
    .endl()+'   {{mod}}_texVal+=1.0;'
    .endl()+'   pos.xyz*={{mod}}_texVal * {{mod}}_extrude;'
    .endl()+'#endif'
    
    .endl()+'#ifdef DISPLACE_METH_ADDZ'
    .endl()+'   pos.z+=({{mod}}_texVal * {{mod}}_extrude);'
    .endl()+'#endif'
    
    .endl()+'#ifdef DISPLACE_METH_ADDY'
    .endl()+'   pos.y+=({{mod}}_texVal * {{mod}}_extrude);'
    .endl()+'#endif'

    .endl()+'displHeightMapColor={{mod}}_texVal;'
    
    .endl();

var srcHeadFrag=''
    .endl()+'uniform float {{mod}}_colorizeAdd;'
    .endl()+'varying float displHeightMapColor;'
    .endl()+'uniform sampler2D {{mod}}_texture;'
    .endl()+'varying vec3 vViewPosition;'

    .endl();

var srcBodyFrag=''
    
    .endl()+'#ifdef HEIGHTMAP_COLORIZE'
    .endl()+'   col.rgb*=displHeightMapColor*(1.0-{{mod}}_colorizeAdd);'
    .endl()+'   col+={{mod}}_colorizeAdd;'
    .endl()+'#endif'

    .endl()+'#ifdef DISPLACE_REMOVE_ZERO'
    .endl()+'if(displHeightMapColor==0.0)discard;'
    .endl()+'#endif'
    .endl();


var moduleFrag=null;
var moduleVert=null;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}


var uniTexture=null;
var uniExtrude=null;
var uniOffsetX=null;
var uniOffsetY=null;
var uniColorizeAdd=null;

op.render.onLinkChanged=removeModule;

op.render.onTriggered=function()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        
        console.log('re init shader module vertexdisplacement');

        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        uniTexture=new CGL.Uniform(shader,'t',moduleVert.prefix+'_texture',4);
        uniExtrude=new CGL.Uniform(shader,'f',moduleVert.prefix+'_extrude',extrude);
        uniOffsetX=new CGL.Uniform(shader,'f',moduleVert.prefix+'_offsetX',offsetX);
        uniOffsetY=new CGL.Uniform(shader,'f',moduleVert.prefix+'_offsetY',offsetY);

        moduleFrag=shader.addModule(
            {
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            });
        uniTexture=new CGL.Uniform(shader,'t',moduleFrag.prefix+'_texture',4);
        uniColorizeAdd=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_colorizeAdd',colorizeAdd);

        updateMethod();
        updateInvert();
        updateColorize();
    }

    if(texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE4);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.get().tex);
    }

    op.trigger.trigger();
};