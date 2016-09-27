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

slices.onValueChanged=updateMesh;
stacks.onValueChanged=updateMesh;
radius.onValueChanged=updateMesh;

render.onTriggered=function()
{
    if(mesh!==null) mesh.render(cgl.getShader());
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

    for (i=1; i<size; i++)
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

    var geom=new CGL.Geometry();
    var nVert = slices*(stacks-1)+2;

    /* precompute values on unit circle */
    var table1=circleTable(-slices,false);
    var table2=circleTable(stacks,true);

    /* Allocate vertex and normal buffers, bail out if memory allocation fails */
    geom.vertices=[];
    geom.vertexNormals=[];
    geom.texCoords=[];

    /* top */
    geom.vertices[0] = 0;
    geom.vertices[1] = 0;
    geom.vertices[2] = radius;
    geom.vertexNormals[0] = 0;
    geom.vertexNormals[1] = 0;
    geom.vertexNormals[2] = 1;

    geom.texCoords[0] = 0;
    geom.texCoords[1] = 0;

    idx = 3;

    /* each stack */
    for( i=1; i<stacks; i++ )
    {
        for( j=0; j<slices; j++, idx+=3 )
        {
            x = table1.cost[j]*table2.sint[i];
            y = table1.sint[j]*table2.sint[i];
            z = table2.cost[i];

            geom.vertices[idx  ] = x*radius;
            geom.vertices[idx+1] = y*radius;
            geom.vertices[idx+2] = z*radius;

            geom.vertexNormals[idx  ] = x;
            geom.vertexNormals[idx+1] = y;
            geom.vertexNormals[idx+2] = z;

            geom.texCoords[idx/3*2  ] = (j)/(slices-1);
            geom.texCoords[idx/3*2+1] = (i-1)/(stacks-2);
            
            // console.log(geom.texCoords[idx/3*2+1  ]);
        }
    }

    /* bottom */
    geom.vertices[idx  ] =  0;
    geom.vertices[idx+1] =  0;
    geom.vertices[idx+2] = -radius;
    geom.vertexNormals[idx  ] =  0;
    geom.vertexNormals[idx+1] =  0;
    geom.vertexNormals[idx+2] = -1;

    geom.texCoords[(idx+3)/3*2] = 1;
    geom.texCoords[(idx+3)/3*2+1] = 1;

    // indices

    var offset=0;

    for (j=0, idx=0;  j<slices;  j++, idx+=2)
    {
        geom.verticesIndices[idx  ] = j+1;              /* 0 is top vertex, 1 is first for first stack */
        geom.verticesIndices[idx+1] = 0;
    }
    geom.verticesIndices[idx  ] = 1;                    /* repeat first slice's idx for closing off shape */
    geom.verticesIndices[idx+1] = 0;
    idx+=2;

    /* middle stacks: */
    /* Strip indices are relative to first index belonging to strip, NOT relative to first vertex/normal pair in array */
    for (i=0; i<stacks-2; i++, idx+=2)
    {
        offset = 1+i*slices;                    /* triangle_strip indices start at 1 (0 is top vertex), and we advance one stack down as we go along */
        for (j=0; j<slices; j++, idx+=2)
        {
            geom.verticesIndices[idx  ] = offset+j+slices;
            geom.verticesIndices[idx+1] = offset+j;
        }
        geom.verticesIndices[idx  ] = offset+slices;        /* repeat first slice's idx for closing off shape */
        geom.verticesIndices[idx+1] = offset;
    }

    /* bottom stack */
    offset = 1+(stacks-2)*slices;               /* triangle_strip indices start at 1 (0 is top vertex), and we advance one stack down as we go along */
    for (j=0; j<slices; j++, idx+=2)
    {
        geom.verticesIndices[idx  ] = nVert-1;              /* zero based index, last element in array (bottom vertex)... */
        geom.verticesIndices[idx+1] = offset+j;
    }
    geom.verticesIndices[idx  ] = nVert-1;                  /* repeat first slice's idx for closing off shape */
    geom.verticesIndices[idx+1] = offset;

    geomOut.set(geom);

    mesh=new CGL.Mesh(cgl,geom,cgl.gl.TRIANGLE_STRIP);
}
