op.name="ForceFieldSimulationParticles";


var render=op.inFunction("render");


var resetButton=op.inFunctionButton("Reset");

var inSize=op.inValue("Size",3);

var opacity=op.inValueSlider("Opacity",1);
var pointSize=op.inValue("PointSize",1);
var numPoints=op.inValue("Particles",10000);



var cgl=op.patch.cgl;

var bufferB=null;
var verts=null;

var geom=null;

var mesh=null;
var buffB=null;

numPoints.onChange=reset;
inSize.onChange=reset;
resetButton.onTriggered=reset;

var id=CABLES.generateUUID();

function reset()
{
    verts=new Float32Array(Math.floor(numPoints.get())*3);
    bufferB=new Float32Array(Math.floor(numPoints.get())*3);

    var size=inSize.get();
    for(var i=0;i<verts.length;i+=3)
    {
        verts[i+0]=(Math.random()-0.5)*size;
        verts[i+1]=(Math.random()-0.5)*size;
        verts[i+2]=(Math.random()-0.5)*size;
        // verts[i+2]=0.0;

        bufferB[i+0]=(Math.random()-0.5)*size;
        bufferB[i+1]=(Math.random()-0.5)*size;
        bufferB[i+2]=(Math.random()-0.5)*size;
        // bufferB[i+2]=0.0;
    }

    geom=new CGL.Geometry();
    geom.setPointVertices(verts);

    if(!mesh) mesh =new CGL.Mesh(cgl,geom,cgl.gl.POINTS);
    mesh.addVertexNumbers=true;
    mesh.setGeom(geom);

    buffB = cgl.gl.createBuffer();
    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffB);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, bufferB, cgl.gl.DYNAMIC_COPY);
    buffB.itemSize = 3;
    buffB.numItems = bufferB.length/3;
    mesh.setAttribute("rndpos",bufferB,3);

    if(feebackOutpos)feebackOutpos.buffer=buffB;
}

reset();


// shader...

var frag=''
    .endl()+'precision highp float;'
    .endl()+'out vec4 color;'
    .endl()+'in vec3 col;'

    .endl()+'uniform float a;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   color=vec4(1.0,1.0,1.0,a);'
    .endl()+'}';


var shader=new CGL.Shader(cgl,'MinimalMaterial');
shader.transformFeedbackVaryings=true;
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.glslVersion=300;//"#version 300 es";

shader.setSource(attachments.flowfield_vert,frag);

var uniOpacity=new CGL.Uniform(shader,'f','a',opacity);
var uniPointSize=new CGL.Uniform(shader,'f','pointSize',pointSize);
var uniTime=new CGL.Uniform(shader,'f','time',0);


var numForces=0;
var forceUniforms=[];

var firstTime=true;

var feebackOutpos=shader.addFeedback("outPos");
feebackOutpos.buffer=buffB;

render.onTriggered=function()
{
    cgl.setShader(shader);

 uniTime.setValue(op.patch.freeTimer.get());

    // console.log("force field forces",CABLES.forceFieldForces.length);

    for(var i=0;i<CABLES.forceFieldForces.length;i++)
    {
        var force=CABLES.forceFieldForces[i];
        if(!force.hasOwnProperty(id+"uniRange"))
        {
            force[id+'uniRange']=new CGL.Uniform(shader,'f','forces['+i+'].range',force.range);
            force[id+'uniAttraction']=new CGL.Uniform(shader,'f','forces['+i+'].attraction',force.attraction);
            force[id+'uniAngle']=new CGL.Uniform(shader,'f','forces['+i+'].angle',force.angle);
            force[id+'uniPos']=new CGL.Uniform(shader,'3f','forces['+i+'].pos',force.pos);
        }
        else
        {
            force[id+'uniRange'].setValue(force.range);
            force[id+'uniAttraction'].setValue(force.attraction);
            force[id+'uniAngle'].setValue(force.angle);
            force[id+'uniPos'].setValue(force.pos);
        }
    }


    if(mesh) mesh.render(cgl.getShader());
    cgl.setPreviousShader();

    var t=mesh._bufVertices;
    mesh._bufVertices=feebackOutpos.buffer;
    feebackOutpos.buffer=t;
};
