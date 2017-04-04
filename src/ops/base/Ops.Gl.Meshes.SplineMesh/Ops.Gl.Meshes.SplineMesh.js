op.name="SplineMesh";

var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));
var thick=op.inValue("Thickness");
var inStart=op.inValueSlider("Start");
var inLength=op.inValueSlider("Length",1);
var calcNormals=op.inValueBool("Calculate Normals",false);
var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize=true;

var inPoints=op.inArray('points');

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
        mesh._bufVertexAttrib.startItem=Math.floor( inStart.get()*(geom.vertices.length/18))*6;
        mesh._bufVertexAttrib.numItems=Math.floor( Math.min(1,inLength.get()+inStart.get()) * (geom.vertices.length/3)); // OK
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
    var index=0;

function linesToGeom(points,options)
{
    // todo: optimize: do not create new arrays if length is the same - use existing geom arrays ...
    if(!geom)geom=new CGL.Geometry();

    var norms=[];
    var i=0;

    options=options||{};
    options.thickness=options.thickness||0.1;
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

    var count=0;
    var lastPA=null;
    var lastPB=null;

    var verts=geom.vertices;
    var tc=geom.texCoords;
    var indices=geom.verticesIndices;
    if(points.length/3*18 !=verts.length ) 
    {
        op.log('resize verts');
        verts=new Float32Array( (points.length/3*18 ) );
        tc=new Float32Array( (points.length/3*12) );
        // make a better buffer for not resizing all the time...
    }
    // if(tc.length!=points.length/3*12) 
    // if(indices.length!=points.length*2) indices=new Uint16Array(points.length*2);


    // var indices=new Float32Array(points.length/3);

    // verts.length=points.length/3*18;
    // indices.length=points.length/3;
    // tc.length=points.length/3*12;

    index=0;

    var indexTc=0;
    var lastC=null;
    var lastD=null;

    for(var p=0;p<points.length;p+=3)
    {
        vec3.set(vStart,
            points[p+0],
            points[p+1],
            points[p+2]);

        vec3.set(vEnd,
            points[p+3]-points[p+0],
            points[p+4]-points[p+1],
            points[p+5]-points[p+2]);

        vec3.normalize(vEnd,vEnd);
        quat.rotationTo(q,[1,0,0],vEnd);

        vec3.set(vecRot, 1,0,0);

        quat.rotateZ(q, q, Math.PI/2);

        vec3.transformQuat(vecRot,vecRot,q);

        var m=options.thickness/2;

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

        vec3.set(vecC,
            points[p+3]+vecRot[0]*m,
            points[p+4]+vecRot[1]*m,
            points[p+5]+vecRot[2]*m);

        vec3.set(vecD,
            points[p+3]+vecRot[0]*-m,
            points[p+4]+vecRot[1]*-m,
            points[p+5]+vecRot[2]*-m);

        // a
        verts[index++]=vecA[0];
        verts[index++]=vecA[1];
        verts[index++]=vecA[2];

        tc[indexTc++]=p/points.length;
        tc[indexTc++]=0;

        // b
        verts[index++]=vecB[0];
        verts[index++]=vecB[1];
        verts[index++]=vecB[2];

        tc[indexTc++]=p/points.length;
        tc[indexTc++]=0;

        // c
        verts[index++]=vecC[0];
        verts[index++]=vecC[1];
        verts[index++]=vecC[2];

        tc[indexTc++]=p/points.length;
        tc[indexTc++]=0;

        // d
        verts[index++]=vecD[0];
        verts[index++]=vecD[1];
        verts[index++]=vecD[2];

        tc[indexTc++]=p/points.length;
        tc[indexTc++]=0;

        // c
        verts[index++]=vecC[0];
        verts[index++]=vecC[1];
        verts[index++]=vecC[2];

        tc[indexTc++]=p/points.length;
        tc[indexTc++]=0;

        // b
        verts[index++]=vecB[0];
        verts[index++]=vecB[1];
        verts[index++]=vecB[2];

        tc[indexTc++]=p/points.length;
        tc[indexTc++]=0;

        if(!lastC)
        {
            lastC=vec3.create();
            lastD=vec3.create();
        }

        vec3.copy(lastC,vecC);
        vec3.copy(lastD,vecD);


    }

    // verts=verts;

    // for(i=0;i<indices.length;i++) indices[i]=i;

    geom.vertices=verts;
    geom.texCoords=tc;
    // geom.verticesIndices=indices;


}

function doRebuild()
{
    var points=inPoints.get()||[];
    if(!points.length)return;

    linesToGeom(points,
        {
            "thickness":thick.get(),
        });

    if(!mesh) 
    {
        mesh=new CGL.Mesh(cgl,geom);
        op.log("rebuild");
    }

    geomOut.set(null);
    geomOut.set(geom);

    mesh.addVertexNumbers=true;
    // mesh.setGeom(geom);
    
    
    var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,geom.vertices,3);
    attr.numItems=index/3;

    var attr2=mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,geom.texCoords,2);
    attr2.numItems=(index/3);

    mesh._setVertexNumbers();

    if(calcNormals.get())geom.calculateNormals({forceZUp:true});

    needsBuild=false;
}
