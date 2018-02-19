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
var vec=vec3.create();

render.onTriggered=function()
{
    var geom=geometry.get();
    if(geom)
    {
        var leng=geom.vertices.length;
        for(var i=0;i<leng;i+=3)
        {
            if(i/3 % modulo.get()==0)
            {
                vec3.set(vec, geom.vertices[i+0],geom.vertices[i+1],geom.vertices[i+2]);
                x.set(geom.vertices[i+0]);
                y.set(geom.vertices[i+1]);
                z.set(geom.vertices[i+2]);
                index.set(i);
                cgl.pushMvMatrix();
                mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
                trigger.trigger();
                cgl.popMvMatrix();
            }
        }
    }
};

