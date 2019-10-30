const
    render=op.inTrigger('Render'),
    width=op.inValueFloat("Width",1),
    height=op.inValueFloat("Height",1),
    thickness=op.inValueFloat("Thickness",-0.1),
    pivotX=op.inValueSelect("pivot x",["center","left","right"],"center"),
    pivotY=op.inValueSelect("pivot y",["center","top","bottom"],"center"),

    trigger=op.outTrigger('trigger'),
    geomOut=op.outObject("Geometry"),

    drawTop=op.inValueBool("Draw Top",true),
    drawBottom=op.inValueBool("Draw Bottom",true),
    drawLeft=op.inValueBool("Draw Left",true),
    drawRight=op.inValueBool("Draw Right",true);

const cgl=op.patch.cgl;
var mesh=null;
var geom=new CGL.Geometry();
geom.tangents = [];
geom.biTangents = [];

geomOut.ignoreValueSerialize=true;

width.onChange=
    pivotX.onChange=
    pivotY.onChange=
    height.onChange=
    thickness.onChange=
    drawTop.onChange=
    drawBottom.onChange=
    drawLeft.onChange=
    drawRight.onChange=create;

create();

render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    trigger.trigger();
};


function create()
{
    var w=width.get();
    var h=height.get();
    var x=-w/2;
    var y=-h/2;
    var th=thickness.get();//*Math.min(height.get(),width.get())*-0.5;

    if(pivotX.get()=='right') x=-w;
    else if(pivotX.get()=='left') x=0;

    if(pivotY.get()=='top') y=-w;
    else if(pivotY.get()=='bottom') y=0;

    geom.vertices.length=0;
    geom.vertices.push(
        x,y,0,
        x+w,y,0,
        x+w,y+h,0,
        x,y+h,0,
        x-th,y-th,0,
        x+w+th,y-th,0,
        x+w+th,y+h+th,0,
        x-th,y+h+th,0
    );

    if(geom.vertexNormals.length===0) geom.vertexNormals.push( 0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1);
    if(geom.tangents.length===0)      geom.tangents.push(      1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0);
    if(geom.biTangents.length===0)    geom.biTangents.push(    0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0);

    if (geom.verticesIndices)geom.verticesIndices.length=0;
    else geom.verticesIndices = [];

    if(drawBottom.get()) geom.verticesIndices.push( 0, 1, 4 ,  1, 5, 4);
    if(drawRight.get())geom.verticesIndices.push( 1, 2, 5,  5, 2, 6);
    if(drawTop.get())geom.verticesIndices.push( 7, 6, 3,  6, 2, 3);
    if(drawLeft.get())geom.verticesIndices.push( 0, 4, 3,  4, 7, 3);

    if(geom.texCoords.length===0)
    {
        geom.texCoords=new Float32Array();
        for(var i=0, j=0;i<geom.vertices.length;i+=3, j+=2)
        {
            geom.texCoords[j]=geom.vertices[i+0]/w-0.5;
            geom.texCoords[j]=geom.vertices[i+1]/h-0.5;
        }
    }

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
    else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);
}

