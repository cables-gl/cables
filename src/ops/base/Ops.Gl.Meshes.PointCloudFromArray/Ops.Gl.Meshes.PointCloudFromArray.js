
const
    exe=op.inTrigger("exe"),
    arr=op.inArray("Array"),
    numPoints=op.inValueInt("Num Points"),
    outGeom=op.outObject("Geometry"),
    pTexCoordRand=op.inValueBool("Scramble Texcoords",true),
    seed=op.inValue("Seed");

const cgl=op.patch.cgl;

pTexCoordRand.onChange=updateRandTexCoords;
seed.onChange=arr.onChange=reset;
numPoints.onChange=updateNumVerts;

var hasError=false;

exe.onTriggered=doRender;

var mesh=null;
const geom=new CGL.Geometry("pointcloudfromarray");
var texCoords=[];
var needsRebuild=true;

function doRender()
{
    if(CABLES.UI)
    {
        var shader=cgl.getShader();
        if(shader && shader.glPrimitive!=cgl.gl.POINTS)
        {
            if(!hasError)
            {
                op.uiAttr( { 'warning': 'using a Material not made for point rendering. maybe use pointMaterial.' } );
                hasError=true;
            }
            return;
        }
        if(hasError)
        {
            op.uiAttr({'warning':null});
            hasError=false;
        }
    }

    if(needsRebuild || !mesh)rebuild();
    if(mesh) mesh.render(cgl.getShader());
}

function reset()
{
    needsRebuild=true;
}

function updateRandTexCoords()
{
    if(!pTexCoordRand.get()) seed.setUiAttribs({hidePort:true,greyout:true});
        else seed.setUiAttribs({hidePort:false,greyout:false});
    needsRebuild=true;
}

function updateNumVerts()
{
    if(mesh)
    {
        mesh.setNumVertices( Math.min(geom.vertices.length/3,numPoints.get()));
        if(numPoints.get()==0)mesh.setNumVertices(geom.vertices.length/3);
    }
}

function rebuild()
{
    var verts=arr.get();
    if(!verts)return;

    geom.clear();
    var num=verts.length/3;
    num=Math.abs(Math.floor(num));

    if(!texCoords || texCoords.length!=num*2) texCoords.length=num*2;//=new Float32Array(num*2);

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
        geom.setPointVertices(verts);
        geom.setTexCoords(texCoords);
        geom.verticesIndices=[];

        if(mesh)mesh.dispose();
        mesh=new CGL.Mesh(cgl,geom,cgl.gl.POINTS);

        mesh.addVertexNumbers=true;
        mesh.setGeom(geom);
        outGeom.set(geom);
    }

    updateNumVerts();
    needsRebuild=false;
}
