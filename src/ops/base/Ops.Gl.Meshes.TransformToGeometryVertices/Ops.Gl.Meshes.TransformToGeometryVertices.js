op.name='TransformToGeometryVertices';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var geometry=op.addInPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));


var modulo=op.inValue("modulo",1);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var x=op.addOutPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var y=op.addOutPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
var z=op.addOutPort(new Port(op,"z",OP_PORT_TYPE_VALUE));
var index=op.addOutPort(new Port(op,"index",OP_PORT_TYPE_VALUE));

geometry.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var vec=[0,0,0];

render.onTriggered=function()
{
    if(geometry.get())
    {
        for(var i=0;i<geometry.get().vertices.length;i+=3)
        {
            if(i/3 % modulo.get()==0)
            {
            vec3.set(vec, geometry.get().vertices[i+0],geometry.get().vertices[i+1],geometry.get().vertices[i+2]);
            x.set(geometry.get().vertices[i+0]);
            y.set(geometry.get().vertices[i+1]);
            z.set(geometry.get().vertices[i+2]);
            index.set(i);
            cgl.pushMvMatrix();
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
            trigger.trigger();
            cgl.popMvMatrix();
                
            }
        }
    }
};

