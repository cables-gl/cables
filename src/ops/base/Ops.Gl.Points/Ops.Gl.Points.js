var self=this;
var cgl=self.patch.cgl;

this.name='Points';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var pointSize=this.addInPort(new Port(this,"pointSize"));
pointSize.set(2);
var shader=null;
var module=null;
var uniPointSize=null;

pointSize.onValueChanged=function()
{
    if(uniPointSize)uniPointSize.setValue(pointSize.get());
};

this.render.onTriggered=function()
{
    var oldPrim=0;
    if(cgl.getShader()!=shader)
    {
        if(shader && module)
        {
            shader.removeModule(module);
            shader=null;
        }

        shader=cgl.getShader();
        oldPrim=shader.glPrimitive;
        shader.glPrimitive=cgl.gl.POINTS;
        
        var srcHeadVert=''
            .endl()+'uniform float {{mod}}_size;'
            .endl();

        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:'gl_PointSize = {{mod}}_size;'
            });

        uniPointSize=new CGL.Uniform(shader,'f',module.prefix+'_size',pointSize.get());

    }

    // cgl.points=true;
    self.trigger.trigger();
    
    shader.glPrimitive=0;
    // cgl.points=false;

};



function updateResolution()
{
}
this.onResize=updateResolution;


pointSize.set(2);
