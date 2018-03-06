
var notation=op.inValueString("Receipt","djmeD");

var outGeom=op.outObject("Geometry");


var obj={};

var faces=[];
var vertices=[];
var vertexColors=[];

notation.onChange=buildMesh;
buildMesh();

function getCellVertices(cellArr)
{
    
    var verts=[];
    for(var i=0;i<cellArr.length;i++)
    {
        verts.push( obj.positions[cellArr[i]] );
    }
    return verts;
}


function addFace(verts)
{
    var colR=Math.random();
    var colG=Math.random();
    var colB=Math.random();
    
    if(verts.length==3)
    {
        for(var i=0;i<verts.length;i++)
        {
            vertices.push(verts[i][0],verts[i][1],verts[i][2]);
            
            var index=vertices.length/3-1;
            faces.push(index);
            vertexColors.push(colR,colG,colB);
        }
        
    }
    else
    if(verts.length==4)
    {

        for(var i=0;i<verts.length;i++)
        {
            vertices.push(verts[i][0],verts[i][1],verts[i][2]);
            vertexColors.push(colR,colG,colB);
        }
        
        var index=vertices.length/3-4;
        faces.push(index);
        faces.push(index+1);
        faces.push(index+2);

        faces.push(index+2);
        faces.push(index+3);
        faces.push(index+0);

    }
    else
    {
        var avgX=0;
        var avgY=0;
        var avgZ=0;

        for(var i=0;i<verts.length;i++)
        {
            avgX+=verts[i][0];
            avgY+=verts[i][1];
            avgZ+=verts[i][2];
        }
        avgX/=verts.length;
        avgY/=verts.length;
        avgZ/=verts.length;

        vertices.push(avgX,avgY,avgZ);
        vertexColors.push(colR,colG,colB);

        var index=vertices.length/3-1;

        for(var i=0;i<verts.length;i++)
        {
            vertices.push(verts[i][0],verts[i][1],verts[i][2]);
            vertexColors.push(colR,colG,colB);
        }
        
        var indexEnd=vertices.length/3-1;
        
        for(var i=index;i<indexEnd;i++)
        {
            faces.push(index);
            faces.push(i);
            faces.push(i+1);
        }

        faces.push(index);
        faces.push(indexEnd);
        faces.push(index+1);



        
        


        // console.log('verts.length',verts.length);
        // return;
        
    }

    
}

function buildMesh()
{
    obj={};
    
    faces=[];
    vertices=[];
    vertexColors=[];
    var geom=new CGL.Geometry();

    try
    {
        obj=conwayhart(String(notation.get()));
    }
    catch(ex)
    {
        console.log(ex);
        return;
    }

    for(var i=0;i<obj.cells.length;i++)
    {
        var verts=getCellVertices(obj.cells[i]);
        addFace(verts,geom);
    }

    geom.vertices=vertices;
    geom.verticesIndices=faces;
    geom.vertexColors=vertexColors;
    geom.calculateNormals();

    outGeom.set(null);
    outGeom.set(geom);
    
}
