const exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
const arr=op.inArray("Array");
const seed=op.inValue("Seed");
const numPoints=op.inValueInt("Num Points");
const outGeom=op.outObject("Geometry");
const pTexCoordRand=op.inValueBool("Scramble Texcoords",true);

const cgl=op.patch.cgl;


seed.onChange=reset;
arr.onChange=reset;
numPoints.onChange=updateNumVerts;

var hasError=false;

exe.onTriggered=doRender;

var mesh=null;
var geom=new CGL.Geometry("pointcloudfromarray");
var texCoords=[];



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
    
    if(mesh) mesh.render(cgl.getShader());
}


function updateNumVerts()
{
    if(mesh) mesh.setNumVertices(numPoints.get());
}

function reset()
{
    var verts=arr.get();
    if(!verts)return;

    var num=verts.length/3;
    num=Math.abs(Math.floor(num));

    if(!texCoords || texCoords.length!=num*2) texCoords.length=num*2;//=new Float32Array(num*2);

    var changed=false;

    var rndTc=pTexCoordRand.get();
    Math.randomSeed=seed.get();
    
    // console.log(num);

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
    
    // console.log(texCoords);
    
    
    if(changed)
    {
        geom.setPointVertices(verts);
        geom.setTexCoords(texCoords);


        
        if(!mesh)mesh=new CGL.Mesh(cgl,geom,cgl.gl.POINTS);

        mesh.addVertexNumbers=true;
        mesh.setGeom(geom);
        outGeom.set(geom);
    }
    
    // if(verts instanceof Float32Array)
    {
        // mesh.getAttribute(CGL.SHADERVAR_VERTEX_POSITION).numItems=numPoints.get();
        
        // var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,verts,3);
        // attr.numItems=numPoints.get();
    }
    
    updateNumVerts();

}

