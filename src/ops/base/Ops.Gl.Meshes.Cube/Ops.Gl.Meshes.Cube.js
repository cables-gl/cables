const
    render=op.inTrigger('render'),
    width=op.inValue('width',1),
    height=op.inValue('height',1),
    lengt=op.inValue('length',1),
    center=op.inValueBool('center',true),
    active=op.inValueBool('Active',true),
    mapping=op.inSwitch("Mapping",['Default','Cube','Cube Biased'],'Default'),
    trigger=op.outTrigger('trigger'),
    geomOut=op.outObject("geometry");

const cgl=op.patch.cgl;

op.setPortGroup("Geometry",[width,height,lengt]);

var geom=null;
var mesh=null;

mapping.onChange=buildMesh;
width.onChange=buildMesh;
height.onChange=buildMesh;
lengt.onChange=buildMesh;
center.onChange=buildMesh;

buildMesh();


render.onTriggered=function()
{
    if(active.get() && mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

op.preRender=function()
{
    buildMesh();
    mesh.render(cgl.getShader());
};

function buildMesh()
{
    if(!geom)geom=new CGL.Geometry("cubemesh");
    geom.clear();

    var x=width.get();
    var nx=-1*width.get();
    var y=lengt.get();
    var ny=-1*lengt.get();
    var z=height.get();
    var nz=-1*height.get();

    if(!center.get())
    {
        nx=0;
        ny=0;
        nz=0;
    }
    else
    {
        x*=0.5;
        nx*=0.5;
        y*=0.5;
        ny*=0.5;
        z*=0.5;
        nz*=0.5;
    }

    if(mapping.get()=="Cube" || mapping.get()=="Cube Biased")
        geom.vertices = [
            // Front face
            nx, ny,  z,
            x, ny,  z,
            x,  y,  z,
            nx,  y,  z,
            // Back face
            nx, ny, nz,
            x,  ny, nz,
            x,  y, nz,
            nx, y, nz,
            // Top face
            nx,  y, nz,
            x,  y,  nz,
            x,  y,  z,
            nx,  y, z,
            // Bottom face
            nx, ny, nz,
            x, ny, nz,
            x, ny,  z,
            nx, ny,  z,
            // Right face
            x, ny, nz,
            x, ny, z,
            x,  y, z,
            x, y, nz,
            // zeft face
            nx, ny, nz,
            nx, ny,  z,
            nx,  y,  z,
            nx,  y, nz
            ];

    else
        geom.vertices = [
            // Front face
            nx, ny,  z,
            x, ny,  z,
            x,  y,  z,
            nx,  y,  z,
            // Back face
            nx, ny, nz,
            nx,  y, nz,
            x,  y, nz,
            x, ny, nz,
            // Top face
            nx,  y, nz,
            nx,  y,  z,
            x,  y,  z,
            x,  y, nz,
            // Bottom face
            nx, ny, nz,
            x, ny, nz,
            x, ny,  z,
            nx, ny,  z,
            // Right face
            x, ny, nz,
            x,  y, nz,
            x,  y,  z,
            x, ny,  z,
            // zeft face
            nx, ny, nz,
            nx, ny,  z,
            nx,  y,  z,
            nx,  y, nz
            ];

    if(mapping.get()=="Cube" || mapping.get()=="Cube Biased")
    {
        const sx=0.25;
        const sy=1/3;
        var bias=0.0;
        if(mapping.get()=="Cube Biased")bias=0.01;
        geom.setTexCoords( [
              // Front face   Z+
              sx+bias, sy*2-bias,
              sx*2-bias, sy*2-bias,
              sx*2-bias, sy+bias,
              sx+bias, sy+bias,
              // Back face Z-
              sx*4-bias, sy*2-bias,
              sx*3+bias, sy*2-bias,
              sx*3+bias, sy+bias,
              sx*4-bias, sy+bias,
              // Top face
              sx+bias, 0+bias,
              sx*2-bias, 0+bias,
              sx*2-bias, sy*1-bias,
              sx+bias, sy*1-bias,
              // Bottom face
              sx+bias, sy*2+bias,
              sx*2-bias, sy*2+bias,
              sx*2-bias, sy*3-bias,
              sx+bias, sy*3-bias,
              // Right face
              sx*0+bias, sy+bias,
              sx*1-bias, sy+bias,
              sx*1-bias, sy*2-bias,
              sx*0+bias, sy*2-bias,
              // Left face
              sx*2+bias, sy+bias,
              sx*3-bias, sy+bias,
              sx*3-bias, sy*2-bias,
              sx*2+bias, sy*2-bias,
            ]);

    }

    else
        geom.setTexCoords( [
              // Front face
              0.0, 1.0,
              1.0, 1.0,
              1.0, 0.0,
              0.0, 0.0,
              // Back face
              1.0, 1.0,
              1.0, 0.0,
              0.0, 0.0,
              0.0, 1.0,
              // Top face
              0.0, 0.0,
              0.0, 1.0,
              1.0, 1.0,
              1.0, 0.0,
              // Bottom face
              1.0, 0.0,
              0.0, 0.0,
              0.0, 1.0,
              1.0, 1.0,
              // Right face
              1.0, 1.0,
              1.0, 0.0,
              0.0, 0.0,
              0.0, 1.0,
              // Left face
              0.0, 1.0,
              1.0, 1.0,
              1.0, 0.0,
              0.0, 0.0,
            ]);

    geom.vertexNormals = [
        // Front face
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // Back face
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // Top face
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // Bottom face
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // Right face
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // Left face
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
    ];
    geom.tangents = [
        // front face
        -1,0,0, -1,0,0, -1,0,0, -1,0,0,
        // back face
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        // top face
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        // bottom face
        -1,0,0, -1,0,0, -1,0,0, -1,0,0,
        // right face
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        // left face
        0,0,1, 0,0,1, 0,0,1, 0,0,1
    ];
    geom.biTangents = [
        // front face
        0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
        // back face
        0,1,0, 0,1,0, 0,1,0, 0,1,0,
        // top face
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        // bottom face
        0,0,1, 0,0,1, 0,0,1, 0,0,1,
        // right face
        0,1,0, 0,1,0, 0,1,0, 0,1,0,
        // left face
        0,1,0, 0,1,0, 0,1,0, 0,1,0
    ];

    geom.verticesIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    if(mesh)mesh.dispose();
    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);
}


op.onDelete=function()
{
    if(mesh)mesh.dispose();
};

