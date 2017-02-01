op.name="SplineFromArray";

var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));

var inIndex=op.inValue("index");
var inOffset=op.inValue("offset");

var inPoints=op.inArray("points");




var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));


var cgl=op.patch.cgl;
var splines=[];


var Spline=function()
{
    this.mesh=null;
    this.points=[];
    this.geom=new CGL.Geometry("splinefromarray");
    this.oldLength=0;
};


inPoints.onChange=function()
{
    var indx=Math.floor(inIndex.get());
    var pointArr=inPoints.get();
    if(!pointArr)return;
    if(indx<0)return;
    if(!splines[indx])
    {
        splines[indx]=new Spline();
    }
    bufferData(splines[indx],pointArr);
};



render.onTriggered=function()
{
    var indx=Math.floor(inIndex.get());
    if(indx>=splines.length)return;
    if(!splines[indx].mesh)return;
    var shader=cgl.getShader();
    if(!shader)return;
    cgl.pushMvMatrix();
    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINE_STRIP;
    // shader.glPrimitive=cgl.gl.POINTS;
    cgl.gl.lineWidth(14);
        
    // for(var i=0;i<splines.length;i++)
        splines[indx].mesh.render(shader);

    shader.glPrimitive=oldPrim;

    cgl.popMvMatrix();

};



function bufferData(spline,pointArr)
{
    if(!pointArr || pointArr.length==0)return;
    if(!spline.geom)
    {
        spline.geom=new CGL.Geometry("splinefromarray");
        // spline.geom.setPointVertices(pointArr);
    }
    if(!spline.mesh) 
    {
        spline.mesh=new CGL.Mesh(cgl, spline.geom);
    }
    else
    {

    }
        spline.geom.vertices=pointArr;
        spline.mesh.updateVertices(spline.geom);

}