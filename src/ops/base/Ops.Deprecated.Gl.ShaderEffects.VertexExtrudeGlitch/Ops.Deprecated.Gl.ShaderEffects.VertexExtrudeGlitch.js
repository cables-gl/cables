//Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='VertexExtrudeGlitch';
this.render=this.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

this.min=this.addInPort(new CABLES.Port(this,"min",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
this.max=this.addInPort(new CABLES.Port(this,"max",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
this.width=this.addInPort(new CABLES.Port(this,"width",CABLES.OP_PORT_TYPE_VALUE,{display:'range'}));
this.extrude=this.addInPort(new CABLES.Port(this,"extrude",CABLES.OP_PORT_TYPE_VALUE));

this.min.onChange=function(){ if(uniMin)uniMin.setValue(self.min.val); };
this.max.onChange=function(){ if(uniMax)uniMax.setValue(self.max.val); };
this.width.onChange=function(){ if(uniWidth)uniWidth.setValue(self.width.val); };
this.extrude.onChange=function(){ if(uniExtrude)uniExtrude.setValue(self.extrude.val); };

var shader=null;
var uniMin;
var uniMax;
var uniWidth;
var uniExtrude;

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_x;'
    .endl()+'uniform float {{mod}}_y;'
    .endl()+'uniform float {{mod}}_width;'
    .endl()+'uniform float {{mod}}_extrude;'
    .endl();

var srcBodyVert=''
    .endl()+'   if(texCoord.x>{{mod}}_x && texCoord.x<{{mod}}_x+{{mod}}_width && texCoord.y>{{mod}}_y && texCoord.y<{{mod}}_y+{{mod}}_width) texCoord.xyz*={{mod}}_extrude;'
    .endl();

var module=null;

function removeModule()
{
    // console.log('remove module?',shader,module);

    if(shader && module)
    {
        shader.removeModule(module);
        shader=null;
        // console.log('remove module!');
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

        uniMin=new CGL.Uniform(shader,'f',module.prefix+'_x',self.min.val);
        uniMax=new CGL.Uniform(shader,'f',module.prefix+'_y',self.max.val);
        uniWidth=new CGL.Uniform(shader,'f',module.prefix+'_width',self.width.val);
        uniExtrude=new CGL.Uniform(shader,'f',module.prefix+'_extrude',self.extrude.val);

    }

    self.trigger.trigger();
};