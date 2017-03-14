op.name="Line";

var render=op.inFunction("Render");
var x1=op.inValue("X 1");
var y1=op.inValue("Y 1");
var z1=op.inValue("Z 1");

var x2=op.inValue("X 2");
var y2=op.inValue("Y 2");
var z2=op.inValue("Z 2");

var next=op.outFunction("Next");

var cgl=op.patch.cgl;

var geom=new CGL.Geometry("simplespline");
geom.vertices=[0,0,0,0,0,0,0,0,0];
var mesh=new CGL.Mesh(cgl,geom);
var buff=new Float32Array();

var changed=false;

x1.onChange=function(){ geom.vertices[0]=x1.get(); changed=true; };
y1.onChange=function(){ geom.vertices[1]=y1.get(); changed=true; };
z1.onChange=function(){ geom.vertices[2]=z1.get(); changed=true; };

x2.onChange=function(){ geom.vertices[3]=x2.get(); changed=true; };
y2.onChange=function(){ geom.vertices[4]=y2.get(); changed=true; };
z2.onChange=function(){ geom.vertices[5]=z2.get(); changed=true; };



render.onTriggered=function()
{
    if(op.instanced(render))return;

    if(changed)
    {
        mesh.updateVertices(geom);
        changed=false;
    }
    
    var shader=cgl.getShader();
    
    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINES;
    // mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);
    
    mesh.render(shader);
    
    shader.glPrimitive=oldPrim;
    
    
    next.trigger();
    
};