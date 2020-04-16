const
    render=op.inTrigger("Render"),
    inActive=op.inBool("Active",true),
    next=op.outTrigger("Next");

const num=100;

const cgl=op.patch.cgl;
var mesh=null;

const shader=new CGL.Shader(cgl,"gridMaterial");
shader.setSource(attachments.grid_vert,attachments.grid_frag);



function init()
{
    var geomVertical=new CGL.Geometry();

    const space=1.0;
    var l=space*num/2;

    var tc=[];

    for(var i=-num/2;i<num/2+1;i++)
    {
        geomVertical.vertices.push(-l);
        geomVertical.vertices.push(0);
        geomVertical.vertices.push(i*space);

        geomVertical.vertices.push(l);
        geomVertical.vertices.push(0);
        geomVertical.vertices.push(i*space);

        geomVertical.vertices.push(i*space);
        geomVertical.vertices.push(0);
        geomVertical.vertices.push(-l);

        geomVertical.vertices.push(i*space);
        geomVertical.vertices.push(0);
        geomVertical.vertices.push(l);

        if(i==0)
        {
            tc.push(0,1);
            tc.push(0,1);
            tc.push(0,0.5);
            tc.push(0,0.5);

        }
        else
        {
            tc.push(0,0);
            tc.push(0,0);
            tc.push(0,0);
            tc.push(0,0);
        }
    }

    geomVertical.vertices.push(0);
    geomVertical.vertices.push(0.001);
    geomVertical.vertices.push(0);

    geomVertical.vertices.push(0);
    geomVertical.vertices.push(10);
    geomVertical.vertices.push(0);

    for(var i=0;i<=10;i++)
    {
        geomVertical.vertices.push(-0.25);
        geomVertical.vertices.push(i);
        geomVertical.vertices.push(0);

        geomVertical.vertices.push(0.25);
        geomVertical.vertices.push(i);
        geomVertical.vertices.push(0);
    }

    geomVertical.setTexCoords(tc);
    geomVertical.calculateNormals();

    if(!mesh) mesh=new CGL.Mesh(cgl,geomVertical);
    else mesh.setGeom(geomVertical);
}


render.onTriggered=function()
{
    if(!mesh)init();
    // var shader=cgl.getShader();
    cgl.pushShader(shader);
    if(!shader)return;

    var oldPrim=shader.glPrimitive;

    shader.glPrimitive=cgl.gl.LINES;


    if(inActive.get()) mesh.render(shader);
    cgl.popShader();

    shader.glPrimitive=oldPrim;

    next.trigger();
};

