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

function render()
{
    if(!laserArray.get())return;
    geom.clear();

    verts.length=laserArray.get().length/5*3;
    vertsColors.length=laserArray.get().length/5*4;
    indices.length=verts.length;
    // console.log(laserObj.get().length);
    // console.log(laserObj.get()[6] );

    var lastR=255;
    var lastG=255;
    var lastB=255;


    for(var i=0;i<laserArray.get().length;i+=5)
    {
        verts[i/5*3+0]=laserArray.get()[i+0];
        verts[i/5*3+1]=laserArray.get()[i+1];
        verts[i/5*3+2]=0;
        
        vertsColors[i/5*4+0]=(laserArray.get()[i+2])/255;
        vertsColors[i/5*4+1]=(laserArray.get()[i+3])/255;
        vertsColors[i/5*4+2]=(laserArray.get()[i+4])/255;
        vertsColors[i/5*4+3]=1;

        indices[i/5]=i/5;
    

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

    // for(var i=0;i<indices.length;i++)indices[i]=i;
    // for(var i i)
    // verts.push( c*stepColumn    - meshWidth/2 );
    // verts.push( r*stepRow       - meshHeight/2 );
    // verts.push( h );
    geom.vertices=verts;
    geom.vertexColors=vertsColors;
    
    // geom.texCoords=tc;
    geom.verticesIndices=indices;
    // geom.calcNormals();

    if(!mesh) mesh=new CGL.Mesh(cgl,geom,cgl.gl.LINE_STRIP);
    mesh.setGeom(geom);
    
    // mesh=new CGL.Mesh(cgl,geom,cgl.gl.TRIANGLE_STRIP);

    if(mesh) mesh.render(cgl.getShader());
    // trigger.trigger();
    

}

this.render.onTriggered=render;
