CABLES.Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='VertexDisplacementMap';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.texture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));
this.extrude=this.addInPort(new Port(this,"extrude",OP_PORT_TYPE_VALUE));

this.extrude.onValueChanged=function(){ if(uniExtrude)uniExtrude.setValue(self.extrude.val); };

var meth=this.addInPort(new Port(this,"mode",OP_PORT_TYPE_VALUE,{display:'dropdown',
    values:['mul xyz','add z','sub z']}));
var updateMethod=function()
{
    if(shader)
    {
    shader.removeDefine('DISPLACE_METH_MULXYZ');
    shader.removeDefine('DISPLACE_METH_ADDZ');

    if(meth.get()=='mul xyz') shader.define('DISPLACE_METH_MULXYZ');
    if(meth.get()=='add z') shader.define('DISPLACE_METH_ADDZ');
    console.log('hallo',meth.get());
        
    }
};
meth.onValueChange(updateMethod);
meth.set('mul xyz');

var shader=null;
var uniExtrude,uniTexture;

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_extrude;'
    .endl()+'uniform sampler2D {{mod}}_texture;'
    .endl();

var srcBodyVert=''
    .endl()+'float {{mod}}_texVal=texture2D( {{mod}}_texture, texCoord ).b;'

    .endl()+'#ifdef DISPLACE_METH_MULXYZ'
    .endl()+'   {{mod}}_texVal+=1.0;'
    .endl()+'   pos.xyz*={{mod}}_texVal * {{mod}}_extrude;'
    .endl()+'#endif'
    
    .endl()+'#ifdef DISPLACE_METH_ADDZ'
    .endl()+'       pos.z += ( {{mod}}_texVal * {{mod}}_extrude);'
    .endl()+'#endif'


    .endl();


var srcHeadFrag=''
    .endl()+'uniform sampler2D {{mod}}_texture;'
    .endl();

var srcBodyFrag=''
    .endl()+'col=texture2D( {{mod}}_texture, texCoord );'
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

this.render.onLinkChanged=removeModule;

this.render.onTriggered=function()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();

        shader=cgl.getShader();

        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        updateMethod();
        
        uniTexture=new CGL.Uniform(shader,'t',module.prefix+'_texture',4);
        uniExtrude=new CGL.Uniform(shader,'f',module.prefix+'_extrude',self.extrude.val);

        // module=shader.addModule(
        //     {
        //         name:'MODULE_COLOR',
        //         srcHeadFrag:srcHeadFrag,
        //         srcBodyFrag:srcBodyFrag
        //     });

        // uniTexture=new CGL.Uniform(shader,'t',module.prefix+'_texture',4);

    }

    if(self.texture.val)
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE4);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, self.texture.val.tex);
    }

    self.trigger.trigger();
};