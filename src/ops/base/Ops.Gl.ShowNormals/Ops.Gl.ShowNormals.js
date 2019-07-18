const
    render=op.inTrigger('render'),
    geometry=op.inObject("geometry"),
    mul=op.inValueFloat("Length",0.1),
    trigger=op.outTrigger('trigger'),
    dropdown = op.inSwitch("Vectors", ["Normals", "Tangents", "Bitangents"], "Normals");
geometry.ignoreValueSerialize=true;

const cgl=op.patch.cgl;
var buffer = cgl.gl.createBuffer();

geometry.onChange=rebuild;
mul.onChange=rebuild;
dropdown.onChange = rebuild;
const geom=new CGL.Geometry("shownormals");
geom.vertices=[0,0,0,0,0,0,0,0,0];

var mesh=new CGL.Mesh(cgl,geom);

function rebuild()
{
    var points=[];
    var tc=[];
    var segments=4;
    var i=0;
    var geom=geometry.get();

    if(geom && geom.vertices)
    {
        for(var i=0;i<geom.vertices.length;i+=3)
        {
            points.push(geom.vertices[i+0]);
            points.push(geom.vertices[i+1]);
            points.push(geom.vertices[i+2]);

            tc.push(0,1);
            tc.push(0,1);
            if (dropdown.get() === "Normals") {
            points.push(geom.vertices[i+0]+geom.vertexNormals[i+0]*mul.get());
            points.push(geom.vertices[i+1]+geom.vertexNormals[i+1]*mul.get());
            points.push(geom.vertices[i+2]+geom.vertexNormals[i+2]*mul.get());
            }
            
            if(dropdown.get() === "Tangents") {
                points.push(geom.vertices[i+0]+geom.tangents[i+0]*mul.get());
                points.push(geom.vertices[i+1]+geom.tangents[i+1]*mul.get());
                points.push(geom.vertices[i+2]+geom.tangents[i+2]*mul.get());
            }
            if(dropdown.get() === "Bitangents") {
                points.push(geom.vertices[i+0]+geom.biTangents[i+0]*mul.get());
                points.push(geom.vertices[i+1]+geom.biTangents[i+1]*mul.get());
                points.push(geom.vertices[i+2]+geom.biTangents[i+2]*mul.get());
            }
        }

        var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,points,3);
        attr.numItems=points.length/3;
        mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,tc,2);
    }
}

render.onTriggered=function()
{
    if(geometry.get())
    {
        var shader=cgl.getShader();
        if(!shader)return;

        var oldPrim=shader.glPrimitive;
        shader.glPrimitive=cgl.gl.LINES;

        if(mesh) mesh.render(shader);

        shader.glPrimitive=oldPrim;

        trigger.trigger();
    }
};

