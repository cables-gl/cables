op.name="SplineMesh";
var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));

var thickness=op.addInPort(new Port(op,"Thickness",OP_PORT_TYPE_VALUE));
var test=op.addInPort(new Port(op,"test",OP_PORT_TYPE_VALUE));

var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;

var points=[];
var rectPoints=[];

var geom=new CGL.Geometry();
var mesh=null;
var cgl=op.patch.cgl;

render.onTriggered=function()
{
    if(mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};
var verts=[];
var tc=[];
var indices=[];
var norms=[];
rebuild();

thickness.onValueChanged=rebuild;
test.onValueChanged=rebuild;
    

function rebuild()
{
    verts.length=0;
    tc.length=0;
    indices.length=0;
    norms.length=0;

    if(points.length===0)
    for(var i=0;i<4;i++)
    {
        points.push(Math.random()*2-1);
        points.push(Math.random()*2-1);
        points.push(0);
    }

    var count=0;

    var lastPA=null;
    var lastPB=null;
    
    rectPoints.length=points.length/3*18;
    
    var vecRot=vec3.create();

    for(var p=0;p<points.length;p+=3)
    {
        var vecA=vec3.create();
        var vecB=vec3.create();
        var vecC=vec3.create();
        var vecD=vec3.create();

        var vStart=vec3.create();
        var vEnd=vec3.create();
        var q=quat.create();
        
        vec3.set(vStart,points[p+0],points[p+1],points[p+2]);
        vec3.set(vEnd  ,points[p+3]-points[p+0],
        points[p+4]-points[p+1],
        points[p+5]-points[p+2]);

        vec3.normalize(vEnd,vEnd);
        quat.rotationTo(q,[1,0,0],vEnd);

        vec3.set(vecRot, 1,0,0);

        quat.rotateZ(q, q, Math.PI/2);

        vec3.transformQuat(vecRot,vecRot,q);

        var m=thickness.get()/2;

        var index=p/3*18;


        rectPoints[index+0 ]=points[p+0]+vecRot[0]*m;
        rectPoints[index+1 ]=points[p+1]+vecRot[1]*m;
        rectPoints[index+2 ]=points[p+2]+vecRot[2]*m;
        
        rectPoints[index+3 ]=points[p+0]+vecRot[0]*-m;
        rectPoints[index+4 ]=points[p+1]+vecRot[1]*-m;
        rectPoints[index+5 ]=points[p+2]+vecRot[2]*-m;

        rectPoints[index+6 ]=points[p+3]+vecRot[0]*m;
        rectPoints[index+7 ]=points[p+4]+vecRot[1]*m;
        rectPoints[index+8 ]=points[p+5]+vecRot[2]*m;

        rectPoints[index+9 ]=points[p+3]+vecRot[0]*-m;
        rectPoints[index+10]=points[p+4]+vecRot[1]*-m;
        rectPoints[index+11]=points[p+5]+vecRot[2]*-m;


        rectPoints[index+12 ]=points[p+0]+vecRot[0]*-m;
        rectPoints[index+13]=points[p+1]+vecRot[1]*-m;
        rectPoints[index+14 ]=points[p+2]+vecRot[2]*-m;

        rectPoints[index+15 ]=points[p+3]+vecRot[0]*m;
        rectPoints[index+16 ]=points[p+4]+vecRot[1]*m;
        rectPoints[index+17 ]=points[p+5]+vecRot[2]*m;








    }

    
    console.log(rectPoints);
    for(var i=0;i<rectPoints.length;i++)
    {
        tc.push(0);
        tc.push(0);
    }
    
    verts=rectPoints;
    
    count=0;
    for(var i=0;i<rectPoints.length;i+=3)
    {
        indices.push(count);
        count++;
    }

    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    geom.vertexNormals=norms;

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
}
