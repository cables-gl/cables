var self=this;
var cgl=this.patch.cgl;

this.name='Torus';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.sides=this.addInPort(new Port(this,"sides",OP_PORT_TYPE_VALUE));
this.sides.set(32);
this.rings=this.addInPort(new Port(this,"rings",OP_PORT_TYPE_VALUE));
this.rings.set(32);
this.innerRadius=this.addInPort(new Port(this,"innerRadius",OP_PORT_TYPE_VALUE));
this.innerRadius.set(0.5);
this.outerRadius=this.addInPort(new Port(this,"outerRadius",OP_PORT_TYPE_VALUE));
this.outerRadius.set(1);

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var geomOut=this.addOutPort(new Port(this,"geometry",OP_PORT_TYPE_OBJECT));

var mesh=null;
var geom=null;

this.render.onTriggered=function()
{
    if(mesh!==null) mesh.render(cgl.getShader());
    self.trigger.trigger();
};

function updateMesh()
{
    var rings=Math.round(self.rings.get());
    var sides=Math.round(self.sides.get());
    if(rings<2)rings=2;
    if(sides<2)sides=2;
    var r=self.innerRadius.get();
    var r2=self.outerRadius.get();
    generateTorus(r,r2, rings, sides);
}

this.rings.onValueChanged=updateMesh;
this.sides.onValueChanged=updateMesh;
this.innerRadius.onValueChanged=updateMesh;

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

    if(!geom)geom=new CGL.Geometry();

    for( j=0; j<nRings; j++ )
    {
        for( i=0; i<nSides; i++ )
        {
            var offset = 3 * ( j * nSides + i ) ;

            geom.vertices[offset  ] = table1.cost[j] * ( oradius + table2.cost[i] * iradius ) ;
            geom.vertices[offset+1] = table1.sint[j] * ( oradius + table2.cost[i] * iradius ) ;
            geom.vertices[offset+2] = table2.sint[i] * iradius  ;
            geom.vertexNormals[offset  ] = table1.cost[j] * table2.cost[i] ;
            geom.vertexNormals[offset+1] = table1.sint[j] * table2.cost[i] ;
            geom.vertexNormals[offset+2] = table2.sint[i] ;
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
    geomOut.set(geom);

    mesh=new CGL.Mesh(cgl,geom,cgl.gl.TRIANGLE_STRIP);

}
