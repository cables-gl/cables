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
    for(var i=0;i<7;i++)
    {
        points.push(Math.random()*2-1);
        points.push(Math.random()*2-1);
        points.push(Math.random()*2-1);
    }

    var count=0;

    var lastPA=null;
    var lastPB=null;
    
    rectPoints.length=points.length/3*18+18;
    
    var vecRot=vec3.create();
    var lastC=null;
    var lastD=null;

    var vecA=vec3.create();
    var vecB=vec3.create();
    var vecC=vec3.create();
    var vecD=vec3.create();
    var index=0;

    for(var p=0;p<points.length;p+=3)
    {

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



        
        vec3.set(vecA,
            points[p+0]+vecRot[0]*m,
            points[p+1]+vecRot[1]*m,
            points[p+2]+vecRot[2]*m);
        
        vec3.set(vecB,
            points[p+0]+vecRot[0]*-m,
            points[p+1]+vecRot[1]*-m,
            points[p+2]+vecRot[2]*-m);

        vec3.set(vecC,
            points[p+3]+vecRot[0]*m,
            points[p+4]+vecRot[1]*m,
            points[p+5]+vecRot[2]*m);

        vec3.set(vecD,
            points[p+3]+vecRot[0]*-m,
            points[p+4]+vecRot[1]*-m,
            points[p+5]+vecRot[2]*-m);

        // a
        rectPoints[index++ ]=vecA[0];
        rectPoints[index++ ]=vecA[1];
        rectPoints[index++ ]=vecA[2];

        // b
        rectPoints[index++ ]=vecB[0];
        rectPoints[index++ ]=vecB[1];
        rectPoints[index++ ]=vecB[2];

        // c
        rectPoints[index++ ]=vecC[0];
        rectPoints[index++ ]=vecC[1];
        rectPoints[index++ ]=vecC[2];

        // d
        rectPoints[index++ ]=vecD[0];
        rectPoints[index++]=vecD[1];
        rectPoints[index++]=vecD[2];

        // c
        rectPoints[index++ ]=vecC[0];
        rectPoints[index++ ]=vecC[1];
        rectPoints[index++ ]=vecC[2];

        // b
        rectPoints[index++]=vecB[0];
        rectPoints[index++]=vecB[1];
        rectPoints[index++]=vecB[2];
        
        if(lastC)
        {
            
        rectPoints[index++]=vecA[0];
        rectPoints[index++]=vecA[1];
        rectPoints[index++]=vecA[2];
            
        rectPoints[index++]=vecB[0];
        rectPoints[index++]=vecB[1];
        rectPoints[index++]=vecB[2];
            
        rectPoints[index++]=lastC[0];
        rectPoints[index++]=lastC[1];
        rectPoints[index++]=lastC[2];
        


        rectPoints[index++]=lastD[0];
        rectPoints[index++]=lastD[1];
        rectPoints[index++]=lastD[2];
        
        rectPoints[index++]=vecA[0];
        rectPoints[index++]=vecA[1];
        rectPoints[index++]=vecA[2];
            
        rectPoints[index++]=vecB[0];
        rectPoints[index++]=vecB[1];
        rectPoints[index++]=vecB[2];
            

            
        }
        else
        {
            lastC=vec3.create();
            lastD=vec3.create();
        }
        
        lastC[0]=vecC[0];
        lastC[1]=vecC[1];
        lastC[2]=vecC[2];

        lastD[0]=vecD[0];
        lastD[1]=vecD[1];
        lastD[2]=vecD[2];


    }
    
    verts=rectPoints;
    
    console.log(rectPoints);
    for(var i=0;i<rectPoints.length;i++)
    {
        tc.push(0);
        tc.push(0);
    }
    
    
    count=0;
    for(var i=0;i<rectPoints.length;i+=3)
    {
        indices.push(count);
        count++;
    }

    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    
    geom.calculateNormals({forceZUp:false});

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
}
