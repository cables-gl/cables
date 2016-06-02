this.name="Laser Preview";

this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var laserArray=this.addInPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=this.patch.cgl;

var mesh=null;
var geom=new CGL.Geometry();
var verts=[];
var indices=[];
var vertsColors=[];

var counter=0;

function render()
{
    if(!laserArray.get())return;
    geom.clear();

    var stride=6;

var n=(laserArray.get().length )/stride*3;
    verts.length=n;
    vertsColors.length=(laserArray.get().length)/stride*4;
    indices.length=verts.length;

    var lastR=255;
    var lastG=255;
    var lastB=255;

    // counter+=100;
    // if(counter>laserArray.get().length)counter=0;

    for(var i=0;i<laserArray.get().length;i+=stride)
    {
        var ind=(i)/stride;
        verts[ind*3+0]=laserArray.get()[i+0];
        verts[ind*3+1]=laserArray.get()[i+1];
        verts[ind*3+2]=laserArray.get()[i+2];
        
        vertsColors[ind*4+0]=(laserArray.get()[i+3])/250;
        vertsColors[ind*4+1]=(laserArray.get()[i+4])/250;
        vertsColors[ind*4+2]=(laserArray.get()[i+5])/250;
        vertsColors[ind*4+3]=1;

        indices[ind]=ind;

        if(i==10)
        {
            // console.log( laserArray.get()[i+0], laserArray.get()[i+1] );
        }

        var vec=vec3.create();
        vec3.set(vec,laserArray.get()[i+0],laserArray.get()[i+1],0);
        cgl.pushMvMatrix();

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec );
        trigger.trigger();

        cgl.popMvMatrix();
    }

    geom.vertices=verts;
    geom.vertexColors=vertsColors;
    geom.verticesIndices=indices;

    if(!mesh) mesh=new CGL.Mesh(cgl,geom,cgl.gl.LINE_STRIP);
    mesh.setGeom(geom);

    if(mesh) mesh.render(cgl.getShader());

}

this.render.onTriggered=render;
