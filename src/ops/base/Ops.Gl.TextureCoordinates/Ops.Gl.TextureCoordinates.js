op.name="TextureCoordinates";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var geometry=op.addInPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

var mul=op.addInPort(new Port(op,"Length",OP_PORT_TYPE_VALUE));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var outGeom=op.outObject("geom result");

mul.set(0.1);

geometry.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var buffer = cgl.gl.createBuffer();

geometry.onChange=rebuild;
mul.onChange=rebuild;

var tempVec=vec3.create();
var geom=null;
function rebuild()
{

    if(!geometry.get())return;
geom=geometry.get().copy();

    console.log("tex coords calc!");
    
    geom.texCoords=new Float32Array(geom.verticesIndices.length/3*2);
    
    for(var i=0;i<geom.verticesIndices.length;i+=3)
    {
        for(var j=0;j<3;j++)
        {
            vec3.normalize(tempVec,[
                geom.vertexNormals[ geom.verticesIndices[i]*3+0 ],
                geom.vertexNormals[ geom.verticesIndices[i]*3+1 ],
                geom.vertexNormals[ geom.verticesIndices[i]*3+2 ]]);

            geom.texCoords[ geom.verticesIndices[i]*2+0 ]=(tempVec[0]+1)/2;
            geom.texCoords[ geom.verticesIndices[i]*2+1 ]=(tempVec[1]+1)/2;
            
            // geom.texCoords[ geom.verticesIndices[i]*3+0 ]=0;
                // (geom.vertexNormals[ geom.verticesIndices[i+2] ]+1);
            // geom.texCoords[ geom.verticesIndices[i+2] ]=geom.vertexNormals[ geom.verticesIndices[i+2] ];
        }

    }
    
    console.log(geom.texCoords);
outGeom.set(geom);
    
}

render.onTriggered=function()
{
    trigger.trigger();
};

