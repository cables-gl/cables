op.name='fullscreen rectangle';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var mesh=null;
var geom=new CGL.Geometry();
var x=0,y=0,z=0,w=0;
op.onResize=rebuild;

render.onTriggered=function()
{
    if(
      cgl.getViewPort()[2]!=w ||
      cgl.getViewPort()[3]!=h ) rebuild();

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);
    mat4.ortho(cgl.pMatrix, 0, w, h, 0, -10.0, 1000);

    cgl.pushMvMatrix();
    mat4.identity(cgl.mvMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    mesh.render(cgl.getShader());

    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

    cgl.popPMatrix();
    cgl.popMvMatrix();
    cgl.popViewMatrix();

    trigger.trigger();
};


function rebuild()
{
    var currentViewPort=cgl.getViewPort().slice();

    x=currentViewPort[0];
    y=currentViewPort[1];
    w=currentViewPort[2];
    h=currentViewPort[3];

    var xx=0,xy=0;
    geom.vertices = [
         xx+w, xy+h,  0.0,
         xx,   xy+h,  0.0,
         xx+w, xy,    0.0,
         xx,   xy,    0.0
    ];

    geom.texCoords = [
         1.0, 1.0,
         0.0, 1.0,
         1.0, 0.0,
         0.0, 0.0
    ];

    geom.verticesIndices = [
        0, 1, 2,
        3, 1, 2
    ];

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);
}