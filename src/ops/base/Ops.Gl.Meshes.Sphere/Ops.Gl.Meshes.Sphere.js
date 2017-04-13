// ported from freeglut fg_geometry.c

op.name='Sphere';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var stacks=op.addInPort(new Port(op,"stacks",OP_PORT_TYPE_VALUE));
var slices=op.addInPort(new Port(op,"slices",OP_PORT_TYPE_VALUE));
var radius=op.addInPort(new Port(op,"radius",OP_PORT_TYPE_VALUE));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

stacks.set(16);
slices.set(16);
radius.set(1);
geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var mesh=null;
var geom=null;
var geomVertices=[];
var geomVertexNormals=[];
var geomTexCoords=[];
var geomVerticesIndices=[];


slices.onValueChanged=function(){ mesh=null; };
stacks.onValueChanged=function(){ mesh=null; };
radius.onValueChanged=function(){ mesh=null; };

render.onTriggered=function()
{
    if(mesh!==null) mesh.render(cgl.getShader());
    else updateMesh();
    
    trigger.trigger();
};

function updateMesh()
{
    var nslices=Math.round(slices.get());
    var nstacks=Math.round(stacks.get());
    if(nslices<1)nslices=1;
    if(nstacks<1)nstacks=1;
    var r=radius.get();
    
    generateSphere(r, nslices, nstacks);
}

// updateMesh();

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

    for (i=0; i<size; i++)
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

function generateSphere(radius, slices, stacks) //, GLfloat **vertices, GLfloat **normals, int* nVert
{
    var i,j;
    var idx = 0;    /* idx into vertex/normal buffer */
    var x,y,z;

    var geom=new CGL.Geometry("sphere");

    /* precompute values on unit circle */
    var table1=circleTable(-slices,false);
    var table2=circleTable(stacks,true);

    /* Allocate vertex and normal buffers, bail out if memory allocation fails */
    geom.clear();
    geomVertices=[];
    geomVertexNormals=[];
    geomTexCoords=[];
    geomVerticesIndices=[];

    /* top */
    geomVertices[0] = 0;
    geomVertices[1] = 0;
    geomVertices[2] = radius;
    geomVertexNormals[0] = 0;
    geomVertexNormals[1] = 0;
    geomVertexNormals[2] = 1;

    geomTexCoords[0] = 0;
    geomTexCoords[1] = 0;

    idx = 3;

    /* each stack */
    for( i=1; i<stacks; i++ )
    {
        for( j=0; j<=slices; j++, idx+=3 )
        {
            x = table1.cost[j]*table2.sint[i];
            y = table1.sint[j]*table2.sint[i];
            z = table2.cost[i];

            geomVertices[idx  ] = x*radius;
            geomVertices[idx+1] = y*radius;
            geomVertices[idx+2] = z*radius;

            geomVertexNormals[idx  ] = x;
            geomVertexNormals[idx+1] = y;
            geomVertexNormals[idx+2] = z;

            geomTexCoords[idx/3*2  ] = (j)/(slices);
            geomTexCoords[idx/3*2+1] = (i-1)/(stacks-2);
            
            // op.log(geomTexCoords[idx/3*2+1  ]);
        }
    }

    /* bottom */
    geomVertices[idx  ] =  0;
    geomVertices[idx+1] =  0;
    geomVertices[idx+2] = -radius;
    geomVertexNormals[idx  ] =  0;
    geomVertexNormals[idx+1] =  0;
    geomVertexNormals[idx+2] = -1;

    geomTexCoords[(idx+3)/3*2] = 1;
    geomTexCoords[(idx+3)/3*2+1] = 1;

    // indices

    var offset=0;

    for (j=0, idx=0;  j<=slices;  j++, idx+=2)
    {
        geomVerticesIndices[idx  ] = j+1;              /* 0 is top vertex, 1 is first for first stack */
        geomVerticesIndices[idx+1] = 0;
    }
    geomVerticesIndices[idx  ] = 1;                    /* repeat first slice's idx for closing off shape */
    geomVerticesIndices[idx+1] = 0;

    var nVert=geomVertices.length/3;

    /* middle stacks: */
    /* Strip indices are relative to first index belonging to strip, NOT relative to first vertex/normal pair in array */
    for (i=0; i<stacks-1; i++, idx+=2)
    {
        offset = 1+i*slices;                    /* triangle_strip indices start at 1 (0 is top vertex), and we advance one stack down as we go along */
        for (j=0; j<slices; j++, idx+=2)
        {
            geomVerticesIndices[idx  ] = offset+j+slices;
            geomVerticesIndices[idx+1] = offset+j;
        }
        geomVerticesIndices[idx  ] = offset+slices;        /* repeat first slice's idx for closing off shape */
        geomVerticesIndices[idx+1] = offset;
    }

    /* bottom stack */
    offset = 1+(stacks-2)*slices;               /* triangle_strip indices start at 1 (0 is top vertex), and we advance one stack down as we go along */
    for (j=0; j<slices; j++, idx+=2)
    {
        geomVerticesIndices[idx  ] = nVert-1;              /* zero based index, last element in array (bottom vertex)... */
        geomVerticesIndices[idx+1] = offset+j;
    }
    geomVerticesIndices[idx  ] = nVert-1;                  /* repeat first slice's idx for closing off shape */
    geomVerticesIndices[idx+1] = offset;

    geom.vertices=geomVertices;
    geom.vertexNormals=geomVertexNormals;
    geom.texCoords=geomTexCoords;
    geom.verticesIndices=geomVerticesIndices;

    geomOut.set(geom);

    mesh=new CGL.Mesh(cgl,geom,cgl.gl.TRIANGLE_STRIP);
}