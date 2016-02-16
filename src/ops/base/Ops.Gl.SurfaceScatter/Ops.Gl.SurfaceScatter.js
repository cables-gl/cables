Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='SurfaceScatter';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var geometry=this.addInPort(new Port(this,"geometry",OP_PORT_TYPE_OBJECT));
geometry.ignoreValueSerialize=true;

var num=this.addInPort(new Port(this,"num",OP_PORT_TYPE_VALUE));
num.set(20);

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.x=this.addOutPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
this.y=this.addOutPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
this.z=this.addOutPort(new Port(this,"z",OP_PORT_TYPE_VALUE));
this.index=this.addOutPort(new Port(this,"index",OP_PORT_TYPE_VALUE));


var indices=[];
var vec=vec3.create();

function initRandom()
{
    if(!geometry.get())
    {
        indices.length=0;
        return;
    }
    for(var i=0;i<num.get();i++)
    {
        indices[i]=parseInt(Math.floor(Math.random()*geometry.get().vertices.length),10);
        
    }
}

geometry.onValueChanged=initRandom;
num.onValueChanged=initRandom;


this.render.onTriggered=function()
{
    if(geometry.get())
    {

        // for(var i=0;i<geometry.val.vertices.length;i+=3)
        for(var j=0;j<num.get();j++)
        {
            var i=indices[j];
            // vec3.set(vec, 
            //     geometry.get().vertices[i+0],
            //     geometry.get().vertices[i+1],
            //     geometry.get().vertices[i+2]);
            self.x.set(geometry.val.vertices[i+0]);
            self.y.set(geometry.val.vertices[i+1]);
            self.z.set(geometry.val.vertices[i+2]);
            self.index.set(j);
            // cgl.pushMvMatrix();
            // mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
            self.trigger.trigger();
            // cgl.popMvMatrix();
        }
    }
};

