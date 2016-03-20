var cgl=this.patch.cgl;
this.name='clonedmesh';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
// var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var geom=this.addInPort(new Port(this,"geom",OP_PORT_TYPE_OBJECT));
geom.ignoreValueSerialize=true;

var transformations=this.addInPort(new Port(this,"transformations",OP_PORT_TYPE_VALUE));

var mesh=null;
var shader=null;

function prepare()
{
    // if(trigger.isLinked()) trigger.trigger();
    if(geom.get())
    {
        // console.log('prepare instances!!');
        var num=transformations.get().length;
        var arrs = [].concat.apply([], transformations.get());
        var matrices = new Float32Array(arrs);
    
        mesh=new CGL.Mesh(cgl,geom.get());
        mesh.numInstances=num;
        mesh.addAttribute('instMat',matrices,16);

        console.log(num+' instances !');
    }
}

render.onTriggered=function()
{
    if(mesh)
    {
        if(shader!=cgl.getShader())
        {
            shader=cgl.getShader();
            shader.define('INSTANCING');    
        }
        mesh.render(shader);
    }
    else
    {
        prepare();    
    }
};

