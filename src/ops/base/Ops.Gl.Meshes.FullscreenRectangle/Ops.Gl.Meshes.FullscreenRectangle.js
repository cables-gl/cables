op.name='fullscreen rectangle';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var centerInCanvas=op.addInPort(new Port(op,"Center in Canvas",OP_PORT_TYPE_VALUE,{display:'bool'}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var flipY=op.inValueBool("Flip Y");
var cgl=op.patch.cgl;
var mesh=null;
var geom=new CGL.Geometry("fullscreen rectangle");
var x=0,y=0,z=0,w=0,h=0;
// op.onResize=rebuild;


centerInCanvas.onValueChanged=rebuild;
flipY.onValueChanged=rebuild;

render.onTriggered=function()
{
    if(
      cgl.getViewPort()[2]!=w ||
      cgl.getViewPort()[3]!=h ) 
      {
          rebuild();
      }

    cgl.pushPMatrix();
    mat4.identity(cgl.pMatrix);
    mat4.ortho(cgl.pMatrix, 0, w, h, 0, -10.0, 1000);

    cgl.pushMvMatrix();
    mat4.identity(cgl.mvMatrix);

    cgl.pushViewMatrix();
    mat4.identity(cgl.vMatrix);

    if(centerInCanvas.get())
    {
        var x=0;
        var y=0;
        if(w<cgl.canvasWidth) x=(cgl.canvasWidth-w)/2;
        if(h<cgl.canvasHeight) y=(cgl.canvasHeight-h)/2;

        cgl.setViewPort(x,y,w,h);
    }

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
    if(currentViewPort[2]==w && currentViewPort[3]==h)return;

    var xx=0,xy=0;

    w=currentViewPort[2];
    h=currentViewPort[3];

    geom.vertices = new Float32Array([
         xx+w, xy+h,  0.0,
         xx,   xy+h,  0.0,
         xx+w, xy,    0.0,
         xx,   xy,    0.0
    ]);

    if(flipY.get())
        geom.texCoords = new Float32Array([
             1.0, 0.0,
             0.0, 0.0,
             1.0, 1.0,
             0.0, 1.0
        ]);
    
    else
        geom.texCoords = new Float32Array([
             1.0, 1.0,
             0.0, 1.0,
             1.0, 0.0,
             0.0, 0.0
        ]);

    geom.verticesIndices = new Float32Array([
        0, 1, 2,
        3, 1, 2
    ]);

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);
}
