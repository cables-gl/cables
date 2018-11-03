const render=op.inTrigger("Render");
const x1=op.inValue("X 1");
const y1=op.inValue("Y 1");
const z1=op.inValue("Z 1");

const x2=op.inValue("X 2",1);
const y2=op.inValue("Y 2",1);
const z2=op.inValue("Z 2",1);

const next=op.outTrigger("Next");

const cgl=op.patch.cgl;

const geom=new CGL.Geometry("simplespline");
geom.vertices=[x1.get(),y1.get(),z1.get(),x2.get(),y2.get(),x2.get()];
const mesh=new CGL.Mesh(cgl,geom,cgl.gl.LINES);

var changed=true;

x1.onChange=function(){ geom.vertices[0]=x1.get(); changed=true; };
y1.onChange=function(){ geom.vertices[1]=y1.get(); changed=true; };
z1.onChange=function(){ geom.vertices[2]=z1.get(); changed=true; };

x2.onChange=function(){ geom.vertices[3]=x2.get(); changed=true; };
y2.onChange=function(){ geom.vertices[4]=y2.get(); changed=true; };
z2.onChange=function(){ geom.vertices[5]=z2.get(); changed=true; };

render.onTriggered=function()
{
    if(changed)
    {
        mesh.updateVertices(geom);
        changed=false;
    }

    var shader=cgl.getShader();
    mesh.render(shader);
    next.trigger();
};