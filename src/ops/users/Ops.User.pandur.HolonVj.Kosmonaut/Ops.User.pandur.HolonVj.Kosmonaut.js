op.name="Kosmonaut";

var outGeom=this.addOutPort(new Port(this,"geom",OP_PORT_TYPE_OBJECT));
var outGeom2=this.addOutPort(new Port(this,"geom2",OP_PORT_TYPE_OBJECT));

var meshes=[];
var lines=
    [
        [274,435,298.667,449,322.334,435,322,407.333,298.667,393,274.333,408,274,435],
        [279.667,419,280,415,281.667,411.333,284.333,407.667,287,405.333,291.333,403.333,295.333,402,299.75,401.375,305.041,402.958,310.125,405.375,313,407.875,314.375,409.875,316.625,414,318.125,419.5,317.625,424.875,316.375,429.5,313.5,433.375,309.75,437.25,305.375,439.375,301.5,440.5,296.125,440.375,291.125,439.625,287.333,437.334,283.667,434,281.333,431,279.667,426.334,279.333,423.667,286.667,423.667,295.125,437.125,300.625,437.125,291.75,422,301.5,405.25,295.5,404.75,287.375,419,279.667,419]
    ];

function avg(which)
{
    var avgX=0,avgY=0;
    
    for(var j=0;j<lines[which].length;j+=2)
    {
        avgX+=lines[which][j];
        avgY+=lines[which][j+1];
    }
    avgX/=lines[which].length;
    avgY/=lines[which].length;
    return [avgX,avgY];
}

meshes.length=0;
outGeom.set(null);
outGeom2.set(null);

var avgXY=[];
var avg1=avg(0);
var avg2=avg(1);
avgXY=[ (avg1[0]+avg2[0])/2, (avg1[1]+avg2[1])/2 ];


for(var i=0;i<lines.length;i++)
{
    var indices=[];
    var vertices=[];
    var count=0;

    for(var j=0;j<lines[i].length;j+=2)
    {
        vertices.push( (lines[i][j]-avgXY[0]*2)*0.1 );
        vertices.push( (lines[i][j+1]-avgXY[1]*2)*-0.1 );
        vertices.push( 0 );
        indices.push(count);
        count++;
    }

    var geom=new CGL.Geometry();
    geom.vertices=vertices;
    geom.verticesIndices=indices;
    var mesh=new CGL.Mesh(op.patch.cgl,geom);
    meshes.push(mesh);

    if(i===0) outGeom.set(geom);
    if(i===1) outGeom2.set(geom);
}
