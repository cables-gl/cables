op.name="SplineMesh";

var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));
var thick=op.inValue("Thickness");
var inStart=op.inValueSlider("Start");
var inLength=op.inValueSlider("Length",1);
var calcNormals=op.inValueBool("Calculate Normals",false);
var inStrip=op.inValueBool("Line Strip",true);

var inPoints=op.inArray('points');
var inNumPoints=op.inValue("Num Points",0);

var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize=true;

var geom=new CGL.Geometry("splinemesh");
var cgl=op.patch.cgl;

var mesh=null;
var geom=null;
var needsBuild=true;

inPoints.onChange=rebuild;
thick.onChange=rebuild;

render.onTriggered=function()
{
    if(needsBuild)doRebuild();
    if(inLength.get()===0)return;

    if(mesh)
    {
        // mesh._bufVertexAttrib.startItem=Math.floor( 
        //     inStart.get()*(geom.vertices.length/18))*6;
        // mesh._bufVertexAttrib.numItems=Math.floor( 
        //     Math.min(1,inLength.get()+inStart.get()) * (geom.vertices.length/3)
        //     ); // OK

        mesh._bufVertexAttrib.startItem=Math.floor( 
            inStart.get()*(index/18))*6;
        mesh._bufVertexAttrib.numItems=Math.floor( 
            Math.min(1,inLength.get()+inStart.get()) * (index/3)
            ); // OK


        mesh.render(cgl.getShader());

    }
    trigger.trigger();
};

function rebuild()
{
    needsBuild=true;
}

var vecRot=vec3.create();
var vecA=vec3.create();
var vecB=vec3.create();
var vecC=vec3.create();
var vecD=vec3.create();
var vStart=vec3.create();
var vEnd=vec3.create();
var q=quat.create();
var vecRotation=vec3.create();
vec3.set(vecRotation, 1,1,0);
var vecX=[1,0,0];


var index=0;

function linesToGeom(points,options)
{
    if(!geom)
    {
        geom=new CGL.Geometry();
        op.log("new geom");
    }

    var norms=[];
    var i=0;


    points=points||[];

    if(points.length===0)
    {
        for(i=0;i<8;i++)
        {
            points.push(Math.random()*2-1);
            points.push(Math.random()*2-1);
            points.push(0);
        }
    }

    var numPoints=points.length;
    if(inNumPoints.get()!==0)numPoints=(inNumPoints.get()-1)*3;

    var count=0;
    var lastPA=null;
    var lastPB=null;

    if(numPoints/3*18 >geom.vertices.length ) 
    {
        op.log('resize verts');
        geom.vertices=new Float32Array( (numPoints/3*18 ) );
        tc=new Float32Array( (numPoints/3*12) );
        // make a better buffer for not resizing all the time...
    }

    index=0;

    var indexTc=0;
    var lastC=null;
    var lastD=null;


    var m=(thick.get()||0.1)/2;
    var ppl=p/numPoints;
    var pi2=Math.PI/4;
    
    var strip=inStrip.get();

    var it=3;
    if(!strip)it=6;

    for(var p=0;p<numPoints;p+=it)
    {
        vec3.set(vStart,
            points[p+0],
            points[p+1],
            points[p+2]);

        // vec3.set(vEnd,
        //     points[p+3]-points[p+0],
        //     points[p+4]-points[p+1],
        //     points[p+5]-points[p+2]);
        vec3.set(vEnd,
            points[p+3],
            points[p+4],
            points[p+5]);

        // vec3.normalize(vEnd,vEnd);
        // vec3.normalize(vStart,vStart);
        
        var vv=vec3.create();
        vv[0]=vStart[0]-vEnd[0];
        vv[1]=vStart[1]-vEnd[1];
        vv[2]=vStart[2]-vEnd[2];
        
        vec3.normalize(vv,vv);
        

        quat.rotationTo(q,vecX,vv);

        quat.rotateZ(q, q, pi2);

        vec3.transformQuat(vecRot,vecRotation,q);

        if(strip)
        {
            if(lastC)
            {
                vec3.copy(vecA,lastC);
                vec3.copy(vecB,lastD);
            }
            else
            {
                vec3.set(vecA,
                    points[p+0]+vecRot[0]*m,
                    points[p+1]+vecRot[1]*m,
                    points[p+2]+vecRot[2]*m);
    
                vec3.set(vecB,
                    points[p+0]+vecRot[0]*-m,
                    points[p+1]+vecRot[1]*-m,
                    points[p+2]+vecRot[2]*-m);
            }
        }
        else
        {
            vec3.set(vecA,
                points[p+0]+vecRot[0]*m,
                points[p+1]+vecRot[1]*m,
                points[p+2]+vecRot[2]*m);
    
            vec3.set(vecB,
                points[p+0]+vecRot[0]*-m,
                points[p+1]+vecRot[1]*-m,
                points[p+2]+vecRot[2]*-m);
        }

        vec3.set(vecC,
            points[p+3]+vecRot[0]*m,
            points[p+4]+vecRot[1]*m,
            points[p+5]+vecRot[2]*m);

        vec3.set(vecD,
            points[p+3]+vecRot[0]*-m,
            points[p+4]+vecRot[1]*-m,
            points[p+5]+vecRot[2]*-m);

        // a
        geom.vertices[index++]=vecA[0];
        geom.vertices[index++]=vecA[1];
        geom.vertices[index++]=vecA[2];

        geom.texCoords[indexTc++]=ppl;
        geom.texCoords[indexTc++]=0;

        // b
        geom.vertices[index++]=vecB[0];
        geom.vertices[index++]=vecB[1];
        geom.vertices[index++]=vecB[2];

        geom.texCoords[indexTc++]=ppl;
        geom.texCoords[indexTc++]=0;

        // c
        geom.vertices[index++]=vecC[0];
        geom.vertices[index++]=vecC[1];
        geom.vertices[index++]=vecC[2];

        geom.texCoords[indexTc++]=ppl;
        geom.texCoords[indexTc++]=0;

        // d
        geom.vertices[index++]=vecD[0];
        geom.vertices[index++]=vecD[1];
        geom.vertices[index++]=vecD[2];

        geom.texCoords[indexTc++]=ppl;
        geom.texCoords[indexTc++]=0;

        // c
        geom.vertices[index++]=vecC[0];
        geom.vertices[index++]=vecC[1];
        geom.vertices[index++]=vecC[2];

        geom.texCoords[indexTc++]=ppl;
        geom.texCoords[indexTc++]=0;

        // b
        geom.vertices[index++]=vecB[0];
        geom.vertices[index++]=vecB[1];
        geom.vertices[index++]=vecB[2];

        geom.texCoords[indexTc++]=ppl;
        geom.texCoords[indexTc++]=0;

        if(!lastC)
        {
            lastC=vec3.create();
            lastD=vec3.create();
        }
    
        if(strip)
        {
            vec3.copy(lastC,vecC);
            vec3.copy(lastD,vecD);
        }
    }

    // geom.vertices=geom.vertices;

    // for(i=0;i<indices.length;i++) indices[i]=i;

    geom.vertices=geom.vertices;
    geom.texCoords=tc;
    // geom.verticesIndices=indices;


}

function doRebuild()
{
    var points=inPoints.get()||[];
    if(!points.length)return;

    linesToGeom(points);

    if(!mesh) 
    {
        mesh=new CGL.Mesh(cgl,geom);
        op.log("rebuild");
    }

    geomOut.set(null);
    geomOut.set(geom);

    // mesh.addVertexNumbers=true;

    var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,geom.vertices,3);
    attr.numItems=index/3;

    var attr2=mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,geom.texCoords,2);
    attr2.numItems=(index/3);

    // mesh._setVertexNumbers();

    if(calcNormals.get())geom.calculateNormals({forceZUp:true});

    needsBuild=false;
}
