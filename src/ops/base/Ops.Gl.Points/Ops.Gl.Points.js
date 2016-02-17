var self=this;
var cgl=self.patch.cgl;

this.name='Points';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.pointSize=this.addInPort(new Port(this,"pointSize"));




var shader=null;
var module=null;

this.render.onTriggered=function()
{
    
    // cgl.gl.enable(cgl.gl.POINT_SMOOTH);

    if(cgl.getShader()!=shader)
    {
        if(shader && module)
        {
            shader.removeModule(module);
            shader=null;
        }

        shader=cgl.getShader();
        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:'',
                srcBodyVert:'gl_PointSize = 2.0;'
            });

    }

    cgl.points=true;
    self.trigger.trigger();
    cgl.points=false;

};

this.pointSize.val=5;
