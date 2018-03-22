var SORT_RANDOM="Random";
var SORT_X="X Axis";
var SORT_Y="Y Axis";
var SORT_Z="Z Axis";
var SORT_NONE="None";

var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));
var sorting=op.inValueSelect("Sort",[SORT_RANDOM,SORT_X,SORT_Y,SORT_Z,SORT_NONE],SORT_X);
var reverse=op.inValueBool("Reverse",false);

var outGeom=op.outObject("Result");

reverse.onChange=update;
geometry.onChange=update;
sorting.onChange=update;

function shuffleArray(a)
{
    var arr=[];
    for (var i=0;i<a.length;i++) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        arr[i - 1] = arr[j];
        arr[j] = x;
    }
    return arr;
}

function update()
{
    if(geometry.get())
    {
        var geom=geometry.get();
        var faces=[];
        faces.length=geom.verticesIndices.length/3;

        for(var i=0;i<geom.verticesIndices.length;i+=3)
        {
            var face=[0,0,0];
            face[0]=geom.verticesIndices[i+0];
            face[1]=geom.verticesIndices[i+1];
            face[2]=geom.verticesIndices[i+2];
            faces[i/3]=face;
        }

        if(sorting.get()==SORT_RANDOM)
        {
            faces=shuffleArray(faces);    
        }
        else
        if(sorting.get()==SORT_Y)
        {
            faces.sort(function(a,b)
            {
                var avgA=0;
                avgA+=geom.vertices[a[0]*3+1];
                avgA+=geom.vertices[a[1]*3+1];
                avgA+=geom.vertices[a[2]*3+1];
                avgA/=3;

                var avgB=0;
                avgB+=geom.vertices[b[0]*3+1];
                avgB+=geom.vertices[b[1]*3+1];
                avgB+=geom.vertices[b[2]*3+1];
                avgB/=3;

                return avgA-avgB;
            });
        }
        else
        if(sorting.get()==SORT_X )
        {
            faces.sort(function(a,b)
            {
                var avgA=0;
                avgA+=geom.vertices[a[0]*3+0];
                avgA+=geom.vertices[a[1]*3+0];
                avgA+=geom.vertices[a[2]*3+0];
                avgA/=3;

                var avgB=0;
                avgB+=geom.vertices[b[0]*3+0];
                avgB+=geom.vertices[b[1]*3+0];
                avgB+=geom.vertices[b[2]*3+0];
                avgB/=3;

                return avgA-avgB;
            });
        }
        else
        if(sorting.get()==SORT_Z)
        {
            faces.sort(function(a,b)
            {
                var avgA=0;
                avgA+=geom.vertices[a[0]*3+2];
                avgA+=geom.vertices[a[1]*3+2];
                avgA+=geom.vertices[a[2]*3+2];
                avgA/=3;

                var avgB=0;
                avgB+=geom.vertices[b[0]*3+2];
                avgB+=geom.vertices[b[1]*3+2];
                avgB+=geom.vertices[b[2]*3+2];
                avgB/=3;

                return avgA-avgB;
            });
        }
        else
        {
            if(sorting.get()!=SORT_NONE) console.error("No sorting found",sorting.get());
        }

        var newGeom=new CGL.Geometry();
        var newVerts=[];
        var newFaces=[];
        var newNormals=[];
        var newTexCoords=[];

        if(reverse.get())
        {
            faces=faces.reverse(); 
        }

        faces=[].concat.apply([], faces);

        for(var i=0;i<faces.length;i+=3)
        {
            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ faces[i+0]*3+0] );
            newVerts.push( geom.vertices[ faces[i+0]*3+1] );
            newVerts.push( geom.vertices[ faces[i+0]*3+2] );
            newNormals.push( geom.vertexNormals[ faces[i+0]*3+0] );
            newNormals.push( geom.vertexNormals[ faces[i+0]*3+1] );
            newNormals.push( geom.vertexNormals[ faces[i+0]*3+2] );
            newTexCoords.push( geom.texCoords[ faces[i+0]*2+0] );
            newTexCoords.push( geom.texCoords[ faces[i+0]*2+1] );

            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ faces[i+1]*3+0] );
            newVerts.push( geom.vertices[ faces[i+1]*3+1] );
            newVerts.push( geom.vertices[ faces[i+1]*3+2] );
            newNormals.push( geom.vertexNormals[ faces[i+1]*3+0] );
            newNormals.push( geom.vertexNormals[ faces[i+1]*3+1] );
            newNormals.push( geom.vertexNormals[ faces[i+1]*3+2] );
            newTexCoords.push( geom.texCoords[ faces[i+1]*2+0] );
            newTexCoords.push( geom.texCoords[ faces[i+1]*2+1] );

            newFaces.push( newVerts.length/3 );
            newVerts.push( geom.vertices[ faces[i+2]*3+0] );
            newVerts.push( geom.vertices[ faces[i+2]*3+1] );
            newVerts.push( geom.vertices[ faces[i+2]*3+2] );
            newNormals.push( geom.vertexNormals[ faces[i+2]*3+0] );
            newNormals.push( geom.vertexNormals[ faces[i+2]*3+1] );
            newNormals.push( geom.vertexNormals[ faces[i+2]*3+2] );
            newTexCoords.push( geom.texCoords[ faces[i+2]*2+0] );
            newTexCoords.push( geom.texCoords[ faces[i+2]*2+1] );
        }

        newGeom.vertices=newVerts;
        newGeom.vertexNormals=newNormals;
        newGeom.verticesIndices=newFaces;
        newGeom.texCoords=newTexCoords;

        outGeom.set(newGeom);
    }
}


