var cgl=op.patch.cgl;

op.name='VertexDisplacement';
op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var texture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));

op.extrude=op.addInPort(new Port(this,"extrude",OP_PORT_TYPE_VALUE));

var flip=op.addInPort(new Port(this,"flip",OP_PORT_TYPE_VALUE,{display:'bool'}));

var removeZero=op.addInPort(new Port(this,"Ignore Zero Values",OP_PORT_TYPE_VALUE,{display:'bool'}));

var invert=op.addInPort(new Port(this,"invert",OP_PORT_TYPE_VALUE,{display:'bool'}));

var offsetX=op.addInPort(new Port(this,"offset X",OP_PORT_TYPE_VALUE));
var offsetY=op.addInPort(new Port(this,"offset Y",OP_PORT_TYPE_VALUE));


invert.onValueChange(function()
{
    if(shader)
        if(invert.get()) shader.define('HEIGHTMAP_INVERT');
            else shader.removeDefine('HEIGHTMAP_INVERT');
});

op.extrude.onValueChanged=function(){ if(uniExtrude)uniExtrude.setValue(op.extrude.val); };

var meth=op.addInPort(new Port(this,"mode",OP_PORT_TYPE_VALUE,{display:'dropdown',
    values:['mul xyz','add z','add y','sub z']}));
    

removeZero.onValueChanged=updateRemoveZero;

function updateRemoveZero()
{
    if(shader)
        if(removeZero.get()) shader.define('DISPLACE_METH_ADDZ');
            else shader.removeDefine('DISPLACE_METH_ADDZ');
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
    .endl()+'       pos.z += ( {{mod}}_texVal * {{mod}}_extrude);'
    .endl()+'#endif'
    
    .endl()+'#ifdef DISPLACE_METH_ADDY'
    .endl()+'       pos.y += ( {{mod}}_texVal * {{mod}}_extrude);'
    .endl()+'#endif'
    .endl();

var srcHeadFrag=''
    .endl()+'uniform sampler2D {{mod}}_texture;'
    .endl();

var srcBodyFrag=''
    .endl()+'float colHeight=texture2D( {{mod}}_texture, texCoord ).r;'
    .endl()+'col.rgb*=texture2D( {{mod}}_texture, texCoord ).r*0.4;'
    
    // .endl()+'col+=0.0;'

    // .endl()+'col*=texture2D( {{mod}}_texture, texCoord ).r*0.7;'
    // .endl()+'col+=0.3;'


    // .endl()+'   if(colHeight==0.0) col.a=0.0;'
    // .endl()+'#ifdef DISPLACE_REMOVE_ZERO'
    // .endl()+'   if(colHeight==0.0) col.a=0.0;'
    // .endl()+'if(colHeight==0.0)col.a=0.0;'
    // .endl()+'#endif'
    .endl();

var module=null;

function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader=null;
    }
}

op.render.onLinkChanged=removeModule;

op.render.onTriggered=function()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        
        console.log('re init shader module vertexdisplacement')
        
        shader=cgl.getShader();

        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        updateMethod();
        
        if(invert.get()) shader.define('HEIGHTMAP_INVERT');
            else shader.removeDefine('HEIGHTMAP_INVERT');

        uniTexture=new CGL.Uniform(shader,'t',module.prefix+'_texture',4);
        uniExtrude=new CGL.Uniform(shader,'f',module.prefix+'_extrude',op.extrude.val);
        uniOffsetX=new CGL.Uniform(shader,'f',module.prefix+'_offsetX',offsetX);
        uniOffsetY=new CGL.Uniform(shader,'f',module.prefix+'_offsetY',offsetY);

        module=shader.addModule(
            {
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            });

        uniTexture=new CGL.Uniform(shader,'t',module.prefix+'_texture',4);

    }

    if(texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE4);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.get().tex);
    }

    op.trigger.trigger();
};