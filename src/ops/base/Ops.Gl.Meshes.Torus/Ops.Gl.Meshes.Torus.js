const
    render=op.inTrigger('render'),
    sides=op.inValue("sides",32),
    rings=op.inValue("rings",32),
    innerRadius=op.inValue("innerRadius",0.5),
    outerRadius=op.inValue("outerRadius",1),
    indraw=op.inBool("Draw",true),
    trigger=op.outTrigger('trigger'),
    geomOut=op.outObject("geometry");

const UP=vec3.fromValues(0,1,0),RIGHT=vec3.fromValues(1,0,0);
var tmpNormal = vec3.create(), tmpVec = vec3.create();

geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var mesh=null;
var geom=null;
var j=0,i=0,idx=0;
var needsUpdate=true;

rings.onChange=
sides.onChange=
innerRadius.onChange=
outerRadius.onChange=function()
{
    needsUpdate=true;
};

render.onTriggered=function()
{
    if(needsUpdate) updateMesh();
    if(indraw.get() && mesh!==null) mesh.render(cgl.getShader());

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
    needsUpdate=false;
}

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
    var t;

    geom=new CGL.Geometry();
    geom.glPrimitive=cgl.gl.TRIANGLE_STRIP;
    geom.tangents = [];
    geom.biTangents = [];

    for( j=0; j<nRings; j++ )
    {
        for( i=0; i<nSides; i++ )
        {
            var offset = 3 * ( j * nSides + i ) ;
            var offset2 = 2 * ( j * nSides + i ) ;

            geom.vertices[offset  ] = table1.cost[j] * ( oradius + table2.cost[i] * iradius );
            geom.vertices[offset+1] = table1.sint[j] * ( oradius + table2.cost[i] * iradius );
            geom.vertices[offset+2] = table2.sint[i] * iradius;
            geom.vertexNormals[offset  ] = tmpNormal[0] = table1.cost[j] * table2.cost[i];
            geom.vertexNormals[offset+1] = tmpNormal[1] = table1.sint[j] * table2.cost[i];
            geom.vertexNormals[offset+2] = tmpNormal[2] = table2.sint[i];

            if (Math.abs(tmpNormal[1])==1) t = RIGHT;
            else t = UP;
            vec3.cross(tmpVec, tmpNormal, t);
            vec3.normalize(tmpVec,tmpVec);
            geom.tangents[offset  ] = tmpVec[0];
            geom.tangents[offset+1] = tmpVec[1];
            geom.tangents[offset+2] = tmpVec[2];
            vec3.cross(tmpVec, tmpVec, tmpNormal);
            geom.biTangents[offset  ] = tmpVec[0];
            geom.biTangents[offset+1] = tmpVec[1];
            geom.biTangents[offset+2] = tmpVec[2];

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

    geomOut.set(null);
    geomOut.set(geom);

    if(!mesh)mesh=new CGL.Mesh(cgl,geom,cgl.gl.TRIANGLE_STRIP);
        else mesh.setGeom(geom);

}