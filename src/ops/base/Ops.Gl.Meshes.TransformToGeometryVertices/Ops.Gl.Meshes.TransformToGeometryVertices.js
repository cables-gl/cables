Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='TransformToGeometryVertices';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.geometry=this.addInPort(new Port(this,"geometry",OP_PORT_TYPE_OBJECT));
this.geometry.ignoreValueSerialize=true;

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.x=this.addOutPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
this.y=this.addOutPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
this.z=this.addOutPort(new Port(this,"z",OP_PORT_TYPE_VALUE));
this.index=this.addOutPort(new Port(this,"index",OP_PORT_TYPE_VALUE));


var vec=[0,0,0];
this.render.onTriggered=function()
{
    if(self.geometry.val)
    {

        for(var i=0;i<self.geometry.val.vertices.length;i+=3)
        {
            vec3.set(vec, self.geometry.val.vertices[i+0],self.geometry.val.vertices[i+1],self.geometry.val.vertices[i+2]);
            self.x.val=self.geometry.val.vertices[i+0];
            self.y.val=self.geometry.val.vertices[i+1];
            self.z.val=self.geometry.val.vertices[i+2];
            self.index.val=i;
            cgl.pushMvMatrix();
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
            self.trigger.trigger();
            cgl.popMvMatrix();
        }
    }
};

