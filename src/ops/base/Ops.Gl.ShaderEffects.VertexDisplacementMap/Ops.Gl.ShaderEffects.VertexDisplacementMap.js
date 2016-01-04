CABLES.Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='VertexDisplacementMap';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.texture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));
this.extrude=this.addInPort(new Port(this,"extrude",OP_PORT_TYPE_VALUE));

this.extrude.onValueChanged=function(){ if(uniExtrude)uniExtrude.setValue(self.extrude.val); };

var shader=null;
var uniExtrude,uniTexture;

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_extrude;'
    .endl()+'uniform sampler2D {{mod}}_texture;'
    .endl();

var srcBodyVert=''
    .endl()+'float {{mod}}_texVal=texture2D( {{mod}}_texture, texCoord ).b+1.0;'
    // .endl()+'pos.y+={{mod}}_texVal * {{mod}}_extrude;'
    .endl()+'pos.xyz*={{mod}}_texVal * {{mod}}_extrude;'

    // .endl()+'norm=normalize(norm+normalize(pos.xyz));'


    // .endl()+'vec3 tangent;'
    // .endl()+'vec3 binormal;'
    // .endl()+'vec3 c1 = cross(norm, vec3(0.0, 0.0, 1.0));'
    // .endl()+'vec3 c2 = cross(norm, vec3(0.0, 1.0, 0.0));'
    // .endl()+'if(length(c1)>length(c2)) tangent = c1;'
    // .endl()+'    else tangent = c2;'
    // .endl()+'tangent = normalize(tangent);'
    // .endl()+'binormal = cross(norm, tangent);'
    // .endl()+'binormal = normalize(binormal);'
    // .endl()+'vec3 normpos = normalize(pos.xyz);'

    // .endl()+'norm=normalize(tangent*normpos.x + binormal*normpos.y + norm*normpos.z);'


    // .endl()+'norm.y+={{mod}}_texVal * {{mod}}_extrude;'
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