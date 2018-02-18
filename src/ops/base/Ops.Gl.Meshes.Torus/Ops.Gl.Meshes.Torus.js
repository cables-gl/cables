
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var sides=op.addInPort(new Port(op,"sides",OP_PORT_TYPE_VALUE));
var rings=op.addInPort(new Port(op,"rings",OP_PORT_TYPE_VALUE));
var innerRadius=op.addInPort(new Port(op,"innerRadius",OP_PORT_TYPE_VALUE));
var outerRadius=op.addInPort(new Port(op,"outerRadius",OP_PORT_TYPE_VALUE));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

sides.set(32);
rings.set(32);
innerRadius.set(0.5);
outerRadius.set(1);

geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var mesh=null;
var geom=null;
var j=0,i=0,idx=0;
rings.onValueChanged=updateMesh;
sides.onValueChanged=updateMesh;
innerRadius.onValueChanged=updateMesh;
outerRadius.onValueChanged=updateMesh;

render.onTriggered=function()
{
    if(mesh!==null) mesh.render(cgl.getShader());
    trigger.trigger();
};

function updateMesh()
{
    var nrings=Math.round(rings.get());
    var nsides=Math.round(sides.get());
    if(nrings<2)nrings=2;
    if(nsides<2)nsides=2;
    var r=innerRadius.get();
    var r2=outerRadius.get();
    generateTorus(r,r2, nrings, nsides);
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


function generateTorus(iradius,oradius,nRings,nSides)
{
    var table1=circleTable( nRings,false);
    var table2=circleTable(-nSides,false);

    // if(!geom)
    geom=new CGL.Geometry();
    // geom.clear();

    for( j=0; j<nRings; j++ )
    {
        for( i=0; i<nSides; i++ )
        {
            var offset = 3 * ( j * nSides + i ) ;
            var offset2 = 2 * ( j * nSides + i ) ;

            geom.vertices[offset  ] = table1.cost[j] * ( oradius + table2.cost[i] * iradius );
            geom.vertices[offset+1] = table1.sint[j] * ( oradius + table2.cost[i] * iradius );
            geom.vertices[offset+2] = table2.sint[i] * iradius;
            geom.vertexNormals[offset  ] = table1.cost[j] * table2.cost[i];
            geom.vertexNormals[offset+1] = table1.sint[j] * table2.cost[i];
            geom.vertexNormals[offset+2] = table2.sint[i];
            
            geom.texCoords[offset2] = 0;
            geom.texCoords[offset2+1] = 0;

        }
    }


    for( i=0, idx=0; i<nSides; i++ )
    {
        var ioff = 1;
        if (i==nSides-1) ioff = -i;

        for( j=0; j<nRings; j++, idx+=2 )
        {
            var offset = j * nSides + i;
            geom.verticesIndices[idx  ] = offset;
            geom.verticesIndices[idx+1] = offset + ioff;
        }
        /* repeat first to close off shape */
        geom.verticesIndices[idx  ] = i;
        geom.verticesIndices[idx+1] = i + ioff;
        idx +=2;
    }
    
    //geom.calcNormals({smooth:rue});
    geomOut.set(null);
    geomOut.set(geom);

    if(!mesh)mesh=new CGL.Mesh(cgl,geom,cgl.gl.TRIANGLE_STRIP);
        else mesh.setGeom(geom);

}
