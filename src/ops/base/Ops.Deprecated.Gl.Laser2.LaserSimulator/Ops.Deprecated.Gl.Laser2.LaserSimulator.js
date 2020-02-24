op.name="LaserSimulator";

var exec=op.inTrigger("Render");
var inPacket=op.inObject("Packet");
var next=op.outTrigger("Next");

var lineBuff=new Float32Array(6);


var cgl=op.patch.cgl;
var geom=new CGL.Geometry("lasersim");
geom.vertices=[0,0,0,0,0,0,0,0,0];

var mesh=new CGL.Mesh(cgl,geom);
var buff=new Float32Array(6);

var simShader=null;

var uniR=null;
var uniG=null;
var uniB=null;

function drawLine(x,y,x2,y2)
{
    buff[0]=x;
    buff[1]=y;
    buff[2]=0;

    buff[3]=x2;
    buff[4]=y2;
    buff[5]=0;

    var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);

    CGL.MESH.lastMesh=null;
    CGL.MESH.lastShader=null;
    // attr.numItems=3;
    // else attr.numItems=Math.min(numPoints,buff.length/3);

    mesh.render(simShader);
}

function setColor(r,g,b)
{
    if(!simShader)
    {
        simShader=new CGL.Shader(cgl,'lasersimmaterial');

        simShader.setSource(
            attachments.lasersim_vert,
            attachments.lasersim_frag);

        simShader.glPrimitive=cgl.gl.LINES;

        uniR=new CGL.Uniform(simShader,'f','r',0);
        uniG=new CGL.Uniform(simShader,'f','g',0);
        uniB=new CGL.Uniform(simShader,'f','b',0);
    }

    if(r==0 && g==0 && b==0)
    {
        uniR.setValue( 0.2 );
        uniG.setValue( 0.2 );
        uniB.setValue( 0.99 );
    }
    else
    {
        uniR.setValue( r);
        uniG.setValue( g);
        uniB.setValue( b);
    }
}

exec.onTriggered=function()
{
    var p=inPacket.get();
    if(!p)return;

    var div=1000;
    cgl.pushShader(simShader);

    // console.log("---------------",p.points.length/2);


    for(var i=0;i<(p.points.length/2)-1;i++)
    {
        setColor(
            p.colors[(i*3)+0]/255,
            p.colors[(i*3)+1]/255,
            p.colors[(i*3)+2]/255
            );

        // console.log(
        //     p.points[(i*2)+0]/div,
        //     p.points[(i*2)+1]/div,
        //     p.points[(i*2)+2]/div );

        drawLine(
            p.points[(i*2)+0]/div,
            p.points[(i*2)+1]/div,
            p.points[(i*2)+2]/div,
            p.points[(i*2)+3]/div
            );

    }


    cgl.popShader();

};




