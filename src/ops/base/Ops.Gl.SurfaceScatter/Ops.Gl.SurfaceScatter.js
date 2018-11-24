
op.render=op.inTrigger("render");
var geometry=op.addInPort(new CABLES.Port(op,"geometry",CABLES.OP_PORT_TYPE_OBJECT));
var seed=op.addInPort(new CABLES.Port(op,"random seed",CABLES.OP_PORT_TYPE_VALUE));
var num=op.addInPort(new CABLES.Port(op,"num",CABLES.OP_PORT_TYPE_VALUE));

var rotX=op.inValueBool("Rotate X",true);
var rotY=op.inValueBool("Rotate Y",true);
var rotZ=op.inValueBool("Rotate Z",true);


var trigger=op.outTrigger('trigger');
var index=op.addOutPort(new CABLES.Port(op,"index",CABLES.OP_PORT_TYPE_VALUE));

var outPoints=op.outArray("Points");

num.set(20);
geometry.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var objects=[];


var vec=vec3.create();

function initRandom()
{
    var points=[];
    objects.length=0;

    if(!geometry.get())
    {
        op.uiAttr({'error':'no geometry'});
        return;
    }
    else
    {
        op.uiAttr({'error':null});
    }
    
    Math.randomSeed=seed.get();

    for(var i=0;i<num.get();i++)
    {
        var obj={};
        var geom=geometry.get();
        var faceIndex=Math.floor(geom.verticesIndices.length/3*Math.seededRandom())*3;

        obj.pos=vec3.create();
        obj.norm=vec3.create();

        points.push( geom.vertices[geom.verticesIndices[faceIndex+0]*3+0] );
        points.push( geom.vertices[geom.verticesIndices[faceIndex+0]*3+1] );
        points.push( geom.vertices[geom.verticesIndices[faceIndex+0]*3+2] );

        vec3.set(obj.pos,
            geom.vertices[geom.verticesIndices[faceIndex+0]*3+0],
            geom.vertices[geom.verticesIndices[faceIndex+0]*3+1],
            geom.vertices[geom.verticesIndices[faceIndex+0]*3+2]
            );

        vec3.set(obj.norm,
            geom.vertexNormals[geom.verticesIndices[faceIndex+0]*3+0],
            geom.vertexNormals[geom.verticesIndices[faceIndex+0]*3+1],
            geom.vertexNormals[geom.verticesIndices[faceIndex+0]*3+2]
            );

        if(!rotX.get())obj.norm[0]=0;
        if(!rotY.get())obj.norm[1]=0;
        if(!rotZ.get())obj.norm[2]=0;

        obj.q=quat.create();

        var vm2=vec3.create();
        vec3.set(vm2,0,0,1);
        quat.rotationTo(obj.q,vm2,obj.norm);

        obj.qMat=mat4.create();
        mat4.fromQuat(obj.qMat, obj.q);

        objects.push(obj);
    }

    outPoints.set(points);
}

geometry.onChange=initRandom;
num.onChange=initRandom;
seed.onChange=initRandom;
rotX.onChange==initRandom;
rotY.onChange==initRandom;
rotZ.onChange==initRandom;

op.render.onTriggered=function()
{
    if(geometry.get())
    {
        for(var j=0;j<objects.length;j++)
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, objects[j].pos);

            mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, objects[j].qMat);

            index.set(j);
            trigger.trigger();
            cgl.popModelMatrix();
        }
    }
};

