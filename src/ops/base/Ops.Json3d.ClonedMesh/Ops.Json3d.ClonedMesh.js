var cgl=this.patch.cgl;
this.name='clonedmesh';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
// var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var geom=this.addInPort(new Port(this,"geom",OP_PORT_TYPE_OBJECT));
geom.ignoreValueSerialize=true;

var transformations=this.addInPort(new Port(this,"transformations",OP_PORT_TYPE_VALUE));

var mesh=null;
var shader=null;

var srcHeadVert=''
    .endl()+'uniform float do_instancing;'
    .endl()+'#ifdef INSTANCING'
    .endl()+'   attribute mat4 instMat;'
    .endl()+'#endif'
    
    .endl();

var srcBodyVert=''

    .endl()+'#ifdef INSTANCING'
    .endl()+'   if( do_instancing==1.0 ) '
    .endl()+'       pos=instMat*pos;'
    .endl()+'#endif'
    .endl();


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

var uniDoInstancing=null;
render.onTriggered=function()
{
    if(mesh)
    {
        if(cgl.getShader() && cgl.getShader()!=shader)
        {
            if(shader && module)
            {
                shader.removeModule(module);
                shader=null;
            }
    
            shader=cgl.getShader();
            
            if(!shader.hasDefine('INSTANCING'))
            {
                module=shader.addModule(
                    {
                        name: 'MODULE_VERTEX_POSITION',
                        srcHeadVert: srcHeadVert,
                        srcBodyVert: srcBodyVert
                    });
        
                shader.define('INSTANCING');    
                uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
            }
            else
            {
                uniDoInstancing=shader.getUniform('do_instancing')
            }
        }

        uniDoInstancing.setValue(1);
        
        mesh.render(shader);
        
        uniDoInstancing.setValue(0);
        
    }
    else
    {
        prepare();    
    }
};
