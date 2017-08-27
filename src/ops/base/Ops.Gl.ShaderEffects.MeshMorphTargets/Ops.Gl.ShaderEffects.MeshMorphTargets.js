CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='MeshMorphTargets';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.geometry0=this.addInPort(new Port(this,"geometry 0",OP_PORT_TYPE_OBJECT));
this.geometry1=this.addInPort(new Port(this,"geometry 1",OP_PORT_TYPE_OBJECT));

this.fade=this.addInPort(new Port(this,"fade",OP_PORT_TYPE_VALUE,{display:'range'}));
this.fade.onValueChanged=function(){ if(uniFade)uniFade.setValue(self.fade.val); };

var geom=null;
var mesh=null;
var shader=null;
var uniFade;

var srcHeadVert=''
    .endl()+'IN vec3 attrMorphTargetA;'
    .endl()+'uniform float {{mod}}_fade;'
    .endl();

var srcBodyVert=''
    .endl()+'   pos = vec4( vPosition*{{mod}}_fade+attrMorphTargetA*(1.0-{{mod}}_fade), 1. );'
    .endl();

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
    if(!mesh)return;


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

        console.log('morph module inited');
    
        uniFade=new CGL.Uniform(shader,'f',module.prefix+'_fade',self.fade.val);
    }

    mesh.render(cgl.getShader());
};

function rebuild()
{
    if(self.geometry0.val && self.geometry1.val)
    {
        console.log('self.geometry0.val',self.geometry0.val);
        var g=self.geometry0.val;
        var geom=JSON.parse(JSON.stringify(g));

        console.log('g',geom);

        geom.morphTargets[0]=JSON.parse(JSON.stringify( self.geometry1.val.vertices ));

        console.log('geom.morphTargets[0].length',self.geometry0.val.vertices.length);
        console.log('geom.morphTargets[0].length',self.geometry1.val.vertices.length);

        mesh=new CGL.Mesh(cgl,geom);
    }
    else
    {
        mesh=null;
    }
}

this.geometry0.onValueChanged=rebuild;
this.geometry1.onValueChanged=rebuild;