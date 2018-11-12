var render=op.inTrigger("Render");
var inDiagram=op.inObject("Diagram");
var next=op.outTrigger("Next");
var pIgnoreBorderCells=op.inValueBool("Ignore Border Cells",false);

var needsGeomUpdate=false;
var verts=null;
var indices=new Uint16Array();
var needsUpdate=false;

inDiagram.ignoreValueSerialize=true;

var cgl=op.patch.cgl;

var geom=new CGL.Geometry("voronoilines");
geom.vertices=[0,0,0,0,0,0,0,0,0];
var mesh=new CGL.Mesh(cgl,geom);

var tc=new Float32Array(200);
for(var i=0;i<50;i++)
{
    tc[i*4+0]=(i/14)%1;
    tc[i*4+1]=0.5;
    tc[i*4+2]=(i/14)%1;
    tc[i*4+3]=0.5;
}


function drawLine(buff,num)
{
    var shader=cgl.getShader();

    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINES;//_STRIP;
    var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);
    mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,tc,2);

    attr.numItems=num;

    mesh.render(shader);
    shader.glPrimitive=oldPrim;

}

var verts=new Float32Array(99);

function updateGeom()
{
    // if(!sites)return;
    var voro=inDiagram.get();
    if(!voro)return;
    needsGeomUpdate=false;
    
    var sites=voro.sites;
    var diagram=voro.diagram;
    var w=voro.width;
    var h=voro.height;


    // todo delete unalloc old mesh objects
    // meshes.length=0;
    needsUpdate=false;


    var invertFill=true;
    var ignoreBorderCells=pIgnoreBorderCells.get();

    for (var ic = 0; ic < sites.length; ic++)
    {
        var count=0;
        var vid=sites[ic].voronoiId;

        // if(ic==0)console.log(sites[ic]);

        var cell = diagram.cells[vid];
        if(!cell)return;

        // if(ic==0) console.log(cell);

        var mX=0;
        var mY=0;
        var check=0;
        
        var minDist=9999999;
        var ignoreCell=false;

        if(ignoreBorderCells)    
        {
            for(var j=0;j<cell.halfedges.length;j++)
            {
                var edge=cell.halfedges[j].edge;
                if(Math.abs(edge.va.x)>=w/2)ignoreCell=true;
                if(Math.abs(edge.vb.x)>=w/2)ignoreCell=true;
                if(Math.abs(edge.va.y)>=h/2)ignoreCell=true;
                if(Math.abs(edge.vb.y)>=h/2)ignoreCell=true;
            }
        }

        var scale=1;

        var time=op.patch.freeTimer.get();
        var canceled=false;

        if(!ignoreCell)
        {
            for(var j=0;j<cell.halfedges.length;j++)
            {
                var edge=cell.halfedges[j].edge;

                var addX=0.0;
                var addY=0;
                
            	var xd = edge.vb.x-edge.va.x;
            	var yd = edge.vb.y-edge.va.y;
            	
                if( !Math.abs(xd*xd + yd*yd) >0.41 )canceled=true;

                verts[count++]=edge.va.x;
                verts[count++]=edge.va.y;
                verts[count++]=0;

                verts[count++]=edge.vb.x;
                verts[count++]=edge.vb.y;
                verts[count++]=0;
            }
        }
        
        if(!canceled)drawLine(verts,count/3);

    }
}




render.onTriggered=function()
{
    updateGeom();

    next.trigger();

};