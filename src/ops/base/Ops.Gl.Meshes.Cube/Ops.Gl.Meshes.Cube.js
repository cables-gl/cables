var cgl=this.patch.cgl;

this.name='Cube';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

var center=this.addInPort(new Port(this,"center",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var width=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE));
var height=this.addInPort(new Port(this,"height",OP_PORT_TYPE_VALUE));
var lengt=this.addInPort(new Port(this,"length",OP_PORT_TYPE_VALUE));


var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var mesh=null;
width.set(1);
height.set(1);
lengt.set(1);
center.set(true);

render.onTriggered=function()
{
    if(mesh!==null) mesh.render(cgl.getShader());
    trigger.trigger();
};

var geom=null;
function buildMesh()
{
    if(!geom)geom=new CGL.Geometry();

    var w=width.get();
    var nw=-1*width.get();
    var h=height.get();
    var nh=-1*height.get();
    var l=lengt.get();
    var nl=-1*lengt.get();

    if(!center.get())
    {
        nw=0;
        nh=0;
        nl=0;
    }
    else
    {
        // sides should be *0.5, but this is not done because of backward compatibility... 
        // should build cube.v2...
    }

    geom.vertices = [
    // Front face
    nw, nh,  l,
    w, nh,  l,
    w,  h,  l,
    nw,  h,  l,
    // Back face
    nw, nh, nl,
    nw,  h, nl,
    w,  h, nl,
    w, nh, nl,
    // Top face
    nw,  h, nl,
    nw,  h,  l,
    w,  h,  l,
    w,  h, nl,
    // Bottom face
    nw, nh, nl,
    w, nh, nl,
    w, nh,  l,
    nw, nh,  l,
    // Right face
    w, nh, nl,
    w,  h, nl,
    w,  h,  l,
    w, nh,  l,
    // Left face
    nw, nh, nl,
    nw, nh,  l,
    nw,  h,  l,
    nw,  h, nl
    ];

geom.texCoords = [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ];

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


    geom.verticesIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    mesh=new CGL.Mesh(cgl,geom);

}

width.onValueChanged=buildMesh;
height.onValueChanged=buildMesh;
lengt.onValueChanged=buildMesh;
buildMesh();


