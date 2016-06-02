op.name="Cables";


var outGeom=this.addOutPort(new Port(this,"geom",OP_PORT_TYPE_OBJECT));
var outGeom2=this.addOutPort(new Port(this,"geom2",OP_PORT_TYPE_OBJECT));

var meshes=[];
var lines=
    [
        [190,547,191,532.5,196.5,509.5,206.5,489,220,469,233,456.5,237.279,452.745,240.435,449.975,238.143,444.715,235,437.5,233.5,423.5,235,411.5,238.5,397,245.5,384.5,257,372,273.5,362.5,287,358,303,358,316.5,361,328,365.5,338.029,373.186,341.928,375.784,346.244,372.157,353,364.5,364,351,372.5,336.5,377,321.5,380,306.5,381.102,298.782,381.5,295.5,383.5,294.5,392,294,400.217,294.003,402.5,295.5,405.019,299.157,404,309,402,321,399,332,396,342,390.5,353,384.5,361.5,378.5,371,370.5,381,365,386,358.895,392.863,355.699,395.408,357.048,398.986,359.5,405.5,360.5,416,360.5,427,359,436.5,356,446.5,350,457.5,341,466.5,333.5,474,320,480.5,308.5,484,294.5,485.5,280,483,268,478,260.5,473.5,254.987,469.047,250.5,473,242.5,481,234.5,489,229,497,224,505.5,219.5,514.5,216.5,524.5,214,533.5,213.923,544.288,212.5,546.5,208.947,549.056,201,549,194.804,549.053,190,547],
        [264,444,258,432.5,258,417,260.5,405,267,394.5,278,386,291.5,381.5,303.5,382.5,315,385.5,324,392,331.5,401,336.5,411,338,426,334,437,328.5,447,321,453.5,311,459,297.51,461.38,284.5,459.5,271.5,452.5,264,444]
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
