CABLES.Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='TextureShiftGlitch';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.pos=this.addInPort(new Port(this,"pos",OP_PORT_TYPE_VALUE,{display:'range'}));
this.height=this.addInPort(new Port(this,"height",OP_PORT_TYPE_VALUE,{display:'range'}));
this.width=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE,{display:'range'}));
this.extrude=this.addInPort(new Port(this,"extrude",OP_PORT_TYPE_VALUE));

this.pos.onValueChanged=function(){ if(unipos)unipos.setValue(self.pos.val); };
this.height.onValueChanged=function(){ if(uniheight)uniheight.setValue(self.height.val); };
this.width.onValueChanged=function(){ if(uniWidth)uniWidth.setValue(self.width.val); };

var shader=null;
var unipos;
var uniheight;
var uniWidth;

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_pos;'
    .endl()+'uniform float {{mod}}_height;'
    .endl()+'uniform float {{mod}}_width;'
    .endl();

var srcBodyVert=''

    .endl()+'   if( texCoords.y > {{mod}}_pos - {{mod}}_height*0.5 && texCoords.y<{{mod}}_pos+{{mod}}_height*0.5) texCoords.x+={{mod}}_width; '
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
                name:'MODULE_BEGIN_FRAG',
                srcHeadFrag:srcHeadVert,
                srcBodyFrag:srcBodyVert
            });

        unipos=new CGL.Uniform(shader,'f',module.prefix+'_pos',self.pos.val);
        uniheight=new CGL.Uniform(shader,'f',module.prefix+'_height',self.height.val);
        uniWidth=new CGL.Uniform(shader,'f',module.prefix+'_width',self.width.val);
    }

    self.trigger.trigger();
};

