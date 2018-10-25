var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var slices=op.addInPort(new CABLES.Port(op,"slices",CABLES.OP_PORT_TYPE_VALUE));
var stacks=op.addInPort(new CABLES.Port(op,"stacks",CABLES.OP_PORT_TYPE_VALUE));
var radius=op.addInPort(new CABLES.Port(op,"radius",CABLES.OP_PORT_TYPE_VALUE));
var height=op.addInPort(new CABLES.Port(op,"height",CABLES.OP_PORT_TYPE_VALUE));

var startSlice=op.inValueInt("Start Slice",0);

var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var geomOut=op.addOutPort(new CABLES.Port(op,"geometry",CABLES.OP_PORT_TYPE_OBJECT));


height.set(2);
slices.set(32);
stacks.set(5);
radius.set(1);
geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var mesh=null;
var geom=null;
var i=0,j=0;
var offset=0;

stacks.onValueChanged=updateMesh;
slices.onValueChanged=updateMesh;
radius.onValueChanged=updateMesh;
height.onValueChanged=updateMesh;
startSlice.onValueChanged=updateMesh;

render.onTriggered=function()
{
    if(mesh!==null) mesh.render(cgl.getShader());
    trigger.trigger();
};

function updateMesh()
{
    var nstacks=Math.round(stacks.get());
    var nslices=Math.round(slices.get());
    if(nstacks<2)nstacks=2;
    if(nslices<2)nslices=2;
    var r=radius.get();
    generateCylinder(r,height.get(), nstacks, nslices);
}

updateMesh();

function circleTable(n,halfCircle)
{
    var i;
    /* Table size, the sign of n flips the circle direction */
    var size = Math.abs(n);

    /* Determine the angle between samples */
    var angle = (halfCircle?1:2)*Math.PI/n;// ( n === 0 ) ? 1 : n ;

    /* Allocate memory for n samples, plus duplicate of first entry at the end */
    var sint=[];
    var cost=[];

    /* Compute cos and sin around the circle */
    sint[0] = 0.0;
    cost[0] = 1.0;

    var ss=startSlice.get();
    if(ss<0.0)ss=0;
    if(ss>size-1)ss=size-1;

    for (i=ss; i<size; i++)
    {
        sint[i] = Math.sin(angle*i);
        cost[i] = Math.cos(angle*i);
    }
    
    if (halfCircle)
    {
        sint[size] =  0.0;  /* sin PI */
        cost[size] = -1.0;  /* cos PI */
    }
    else
    {
        /* Last sample is duplicate of the first (sin or cos of 2 PI) */
        sint[size] = sint[0];
        cost[size] = cost[0];
    }
    return {cost:cost,sint:sint};
}

function generateCylinder(radf,height,stacks,slices)
{
    var geom=new CGL.Geometry();

    var table=circleTable(-slices,false);

    var idx=0;
    var z=0;
    var zStep = height / ( ( stacks > 0 ) ? stacks : 1 );


    /* top on Z-axis */
    geom.vertices[0] =  0;
    geom.vertices[1] =  0;
    geom.vertices[2] =  0;
    geom.vertexNormals[0] =  0;
    geom.vertexNormals[1] =  0;
    geom.vertexNormals[2] = -1;
    idx = 3;
    /* other on top (get normals right) */
    for (j=0; j<slices; j++, idx+=3)
    {
        geom.vertices[idx  ] = table.cost[j]*radf;
        geom.vertices[idx+1] = table.sint[j]*radf;
        geom.vertices[idx+2] = z;
        geom.vertexNormals[idx  ] = 0;
        geom.vertexNormals[idx+1] = 0;
        geom.vertexNormals[idx+2] = -1;
    }

    /* each stack */
    for (i=0; i<stacks+1; i++ )
    {
        for (j=0; j<slices; j++, idx+=3)
        {
            geom.vertices[idx  ] = table.cost[j]*radf;
            geom.vertices[idx+1] = table.sint[j]*radf;
            geom.vertices[idx+2] = z;
            geom.vertexNormals[idx  ] = table.cost[j];
            geom.vertexNormals[idx+1] = table.sint[j];
            geom.vertexNormals[idx+2] = 0;
        }

        z += zStep;
    }

    /* other on bottom (get normals right) */
    z -= zStep;
    for (j=0; j<slices; j++, idx+=3)
    {
        geom.vertices[idx  ] = table.cost[j]*radf;
        geom.vertices[idx+1] = table.sint[j]*radf;
        geom.vertices[idx+2] = z;
        geom.vertexNormals[idx  ] = 0;
        geom.vertexNormals[idx+1] = 0;
        geom.vertexNormals[idx+2] = 1;
    }

    /* bottom */
    geom.vertices[idx  ] =  0;
    geom.vertices[idx+1] =  0;
    geom.vertices[idx+2] =  height;
    geom.vertexNormals[idx  ] =  0;
    geom.vertexNormals[idx+1] =  0;
    geom.vertexNormals[idx+2] =  1;


    /* top stack */
    for (j=0, idx=0;  j<slices;  j++, idx+=2)
    {
        geom.verticesIndices[idx  ] = 0;
        geom.verticesIndices[idx+1] = j+1;              /* 0 is top vertex, 1 is first for first stack */
    }
    geom.verticesIndices[idx  ] = 0;                    /* repeat first slice's idx for closing off shape */
    geom.verticesIndices[idx+1] = 1;
    idx+=2;

    /* middle stacks: */
    /* Strip indices are relative to first index belonging to strip, NOT relative to first vertex/normal pair in array */
    for (i=0; i<stacks; i++, idx+=2)
    {
        offset = 1+(i+1)*slices;                /* triangle_strip indices start at 1 (0 is top vertex), and we advance one stack down as we go along */
        for (j=0; j<slices; j++, idx+=2)
        {
            geom.verticesIndices[idx  ] = offset+j;
            geom.verticesIndices[idx+1] = offset+j+slices;
        }
        geom.verticesIndices[idx  ] = offset;               /* repeat first slice's idx for closing off shape */
        geom.verticesIndices[idx+1] = offset+slices;
    }

    /* top stack */
    offset = 1+(stacks+2)*slices;
    for (j=0; j<slices; j++, idx+=2)
    {
        geom.verticesIndices[idx  ] = offset+j;
        geom.verticesIndices[idx+1] = geom.vertices.length/3-1;              /* zero based index, last element in array (bottom vertex)... */
    }

    geom.verticesIndices[idx  ] = offset;
    geom.verticesIndices[idx+1] = geom.vertices.length/3-1;                  /* repeat first slice's idx for closing off shape */

    geomOut.set(geom);
    mesh=new CGL.Mesh(cgl,geom,cgl.gl.TRIANGLE_STRIP);
}

