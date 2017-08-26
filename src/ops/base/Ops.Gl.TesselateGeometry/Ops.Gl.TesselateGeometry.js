op.name="TesselateGeometry";

var inGeom=op.inObject("Geometry");
var inTimes=op.inValueInt("Iterations");
var outGeom=op.outObject("Result");
var outVertices=op.outValue("Num Vertices");

inGeom.onChange=update;
inTimes.onChange=update;

function tesselate(vertices, x1,y1,z1, x2,y2,z2,  x3,y3,z3)
{

    vertices.push( x1 );
    vertices.push( y1 );
    vertices.push( z1 );

    vertices.push( (x1+x2)/2 );
    vertices.push( (y1+y2)/2 );
    vertices.push( (z1+z2)/2 );

    vertices.push( (x1+x3)/2 );
    vertices.push( (y1+y3)/2 );
    vertices.push( (z1+z3)/2 );

    // --

    vertices.push( (x1+x2)/2 );
    vertices.push( (y1+y2)/2 );
    vertices.push( (z1+z2)/2 );

    vertices.push( x2 );
    vertices.push( y2 );
    vertices.push( z2 );

    vertices.push( (x2+x3)/2 );
    vertices.push( (y2+y3)/2 );
    vertices.push( (z2+z3)/2 );

    // --
    
    vertices.push( (x2+x3)/2 );
    vertices.push( (y2+y3)/2 );
    vertices.push( (z2+z3)/2 );
    
    vertices.push( x3 );
    vertices.push( y3 );
    vertices.push( z3 );

    vertices.push( (x1+x3)/2 );
    vertices.push( (y1+y3)/2 );
    vertices.push( (z1+z3)/2 );

    // --

    vertices.push( (x1+x2)/2 );
    vertices.push( (y1+y2)/2 );
    vertices.push( (z1+z2)/2 );
    
    vertices.push( (x2+x3)/2 );
    vertices.push( (y2+y3)/2 );
    vertices.push( (z2+z3)/2 );
    
    vertices.push( (x1+x3)/2 );
    vertices.push( (y1+y3)/2 );
    vertices.push( (z1+z3)/2 );






    // var cx=(x1 + x2 + x3) / 3;
    // var cy=(y1 + y2 + y3) / 3;
    // var cz=(z1 + z2 + z3) / 3;

    // vertices.push( x1 );
    // vertices.push( y1 );
    // vertices.push( z1 );
    
    // vertices.push( x2 );
    // vertices.push( y2 );
    // vertices.push( z2 );

    // vertices.push( cx );
    // vertices.push( cy );
    // vertices.push( cz );

    // // --

    // vertices.push( x2 );
    // vertices.push( y2 );
    // vertices.push( z2 );
    
    // vertices.push( x3 );
    // vertices.push( y3 );
    // vertices.push( z3 );

    // vertices.push( cx );
    // vertices.push( cy );
    // vertices.push( cz );


    // // --

    // vertices.push( x3 );
    // vertices.push( y3 );
    // vertices.push( z3 );

    // vertices.push( x1 );
    // vertices.push( y1 );
    // vertices.push( z1 );

    // vertices.push( cx );
    // vertices.push( cy );
    // vertices.push( cz );

}


function tesselateGeom(oldGeom)
{
    var geom=new CGL.Geometry();
    var vertices=[];
    
    if(oldGeom.verticesIndices.length>0)
    {
        for(var i=0;i<oldGeom.verticesIndices.length;i+=3)
        {
            var x1=oldGeom.vertices[oldGeom.verticesIndices[i+0]*3+0];
            var y1=oldGeom.vertices[oldGeom.verticesIndices[i+0]*3+1];
            var z1=oldGeom.vertices[oldGeom.verticesIndices[i+0]*3+2];
    
            var x2=oldGeom.vertices[oldGeom.verticesIndices[i+1]*3+0];
            var y2=oldGeom.vertices[oldGeom.verticesIndices[i+1]*3+1];
            var z2=oldGeom.vertices[oldGeom.verticesIndices[i+1]*3+2];
    
            var x3=oldGeom.vertices[oldGeom.verticesIndices[i+2]*3+0];
            var y3=oldGeom.vertices[oldGeom.verticesIndices[i+2]*3+1];
            var z3=oldGeom.vertices[oldGeom.verticesIndices[i+2]*3+2];
    
            tesselate(vertices, x1,y1,z1, x2,y2,z2, x3,y3,z3);
        }
    }
    else
    {
        if(oldGeom.vertices.length>0)
        {
            for(var i=0;i<oldGeom.vertices.length;i+=9)
            {
                tesselate(vertices,
                    oldGeom.vertices[i+0],
                    oldGeom.vertices[i+1],
                    oldGeom.vertices[i+2],
                    
                    oldGeom.vertices[i+3],
                    oldGeom.vertices[i+4],
                    oldGeom.vertices[i+5],
                    
                    oldGeom.vertices[i+6],
                    oldGeom.vertices[i+7],
                    oldGeom.vertices[i+8]
                );

            }
        }
    }
    
    geom.setVertices(vertices);
    return geom;
    
}

function update()
{
    var geom=inGeom.get();
    if(!geom)return;
    
    for(var i=0;i<inTimes.get();i++)
    {
        geom=tesselateGeom(geom);
    }

    outVertices.set(geom.vertices.length/3);
    
    outGeom.set(null);
    outGeom.set(geom);

}


