op.name="voronoitest";

var meshes=[];

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var voronoi = new Voronoi();
var bbox = {xl: -140, xr: 140, yt: -140, yb: 140}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
var sites=[];
for(var i=0;i<34;i++)
{
    sites.push(
        {
           x:Math.random()*200-100,
           y:Math.random()*200-100,
        });
}

for(var i=0;i<40;i++)
{
    sites.push(
        {
           x:Math.random()*40-20,
           y:Math.random()*40-20,
        });
}

var diagram = voronoi.compute(sites, bbox);

console.log(diagram);

var cgl=op.patch.cgl;





function updateGeom()
{
    diagram = voronoi.compute(sites, bbox);

    if(meshes.length!=diagram.edges.length)
    {
        console.log('resize mesh array!!!');
        meshes.length=diagram.edges.length;
    }
    
    for(var i=0;i<diagram.edges.length;i++)
    {
        var geom;
        if(meshes[i] && meshes[i].geom)geom=meshes[i].geom;
        else geom=new CGL.Geometry();
        var vertices=geom.vertices;
        vertices.length=diagram.edges.length*2*3;
    
        var edge=diagram.edges[i];

        vertices[i*2*3+0]=(edge.va.x )/100;
        vertices[i*2*3+1]=(edge.va.y )/100 ;
        vertices[i*2*3+2]=0;

        vertices[i*2*3+3]=(edge.vb.x )/100 ;
        vertices[i*2*3+4]=(edge.vb.y )/100 ;
        vertices[i*2*3+5]=0;

        geom.setPointVertices(vertices);
        if(!meshes[i])meshes[i]=new CGL.Mesh(op.patch.cgl,geom);
            else meshes[i].setGeom(geom);

    }
}


updateGeom();

render.onTriggered=function()
{
    sites[10].x+=0.5;
    // updateGeom();
    
    
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;

    shader.glPrimitive=cgl.gl.LINES;

// var i=1;
    for(var i in meshes)
    {
        meshes[i].render(op.patch.cgl.getShader());
    }
    
    shader.glPrimitive=oldPrim;

};