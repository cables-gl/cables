op.name="PointCloudFromArray";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var arr=op.inArray("Array");
var seed=op.inValue("Seed");

var pTexCoordRand=op.inValueBool("Scramble Texcoords");

var cgl=op.patch.cgl;


function doRender()
{
    if(mesh) mesh.render(cgl.getShader());
}

exe.onTriggered=doRender;

var mesh=null;
var geom=null;

function reset()
{
    
    var verts=arr.get();
    if(!verts)return;
    // if(!geom)
    geom=new CGL.Geometry();
    
    var num=verts.length/3;
    var texCoords=[];
    var vertColors=[];
    texCoords.length=num*2;
    var changed=false;
    
    
    var rndTc=pTexCoordRand.get();

Math.randomSeed=seed.get();
    for(var i=0;i<num;i++)
    {
        

        if(geom.vertices[i*3]!=verts[i*3] ||
            geom.vertices[i*3+1]!=verts[i*3+1] ||
            geom.vertices[i*3+2]!=verts[i*3+2])
        {
            if(rndTc)
            {
                texCoords[i*2]=Math.seededRandom();
                texCoords[i*2+1]=Math.seededRandom();

            }
            else
            {
                texCoords[i*2]=i/num;
                texCoords[i*2+1]=i/num;
            }
            changed=true;
        }
    }
    
    if(changed)
    {
        geom.clear();
        geom.setPointVertices(verts);
        geom.texCoords=texCoords;
        
        if(!mesh)mesh =new CGL.Mesh(cgl,geom,cgl.gl.POINTS);
            else mesh.setGeom(geom);
        mesh.addVertexNumbers=true;
        mesh.setGeom(geom);
    }
}

arr.onChange=reset;


