op.name="voronoitest2";

var meshes=[];

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var voronoi = new Voronoi();
var bbox = {xl: -140, xr: 140, yt: -80, yb: 80}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
var sites=[];
for(var i=0;i<34;i++)
{
    sites.push(
        {
           x:Math.random()*200-100,
           y:Math.random()*200-100,
        });
}

for(var i=0;i<20;i++)
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
    meshes.length=1;

    var geom=new CGL.Geometry();
    var vertices=[];

    
    for(var i=0;i<diagram.cells.length;i++)
    {
        
        var mX=0;
        var mY=0;
        for(var j=0;j<diagram.cells[i].halfedges.length;j++)
        {
            var edge=diagram.cells[i].halfedges[j].edge;
            mX+=edge.va.x;
            mY+=edge.va.y;
            mX+=edge.vb.x;
            mY+=edge.vb.y;
        }
        
        mX/=(diagram.cells[i].halfedges.length*2);
        mY/=(diagram.cells[i].halfedges.length*2);
        
        for(var j=0;j<diagram.cells[i].halfedges.length;j++)
        {
            var edge=diagram.cells[i].halfedges[j].edge;
            
            vertices.push( (mX+(edge.va.x-mX )*0.9)/100 );
            vertices.push( (mY+(edge.va.y-mY )*0.9)/100 );
            vertices.push( 0 );
    
            vertices.push( (mX+(edge.vb.x-mX )*0.9)/100 );
            vertices.push( (mY+(edge.vb.y-mY )*0.9)/100 );
            vertices.push( 0 );

            vertices.push( (mX )/100 );
            vertices.push( (mY )/100  );
            vertices.push( 0 );
        }        
    }
    
    // op.log('voro verts:'+vertices.length);
    
    geom.setPointVertices(vertices);
meshes[0]=new CGL.Mesh(op.patch.cgl,geom);
    
    // diagram = voronoi.compute(sites, bbox);

    // if(meshes.length!=diagram.edges.length)
    // {
    //     console.log('resize mesh array!!!');
    //     meshes.length=diagram.edges.length;
    // }
    
    // for(var i=0;i<diagram.edges.length;i++)
    // {
    //     var edge=diagram.edges[i];
        
    //     if(edge.rSite && edge.lSite && (edge.lSite.voronoiId==11 || edge.rSite.voronoiId==11))
    //     {
    //         var geom;
    //         if(meshes[i] && meshes[i].geom)geom=meshes[i].geom;
    //         else geom=new CGL.Geometry();
    //         var vertices=geom.vertices;
    //         vertices.length=diagram.edges.length*2*3;

    //         vertices[i*2*3+0]=(edge.va.x )/100;
    //         vertices[i*2*3+1]=(edge.va.y )/100 ;
    //         vertices[i*2*3+2]=0;
    
    //         vertices[i*2*3+3]=(edge.vb.x )/100 ;
    //         vertices[i*2*3+4]=(edge.vb.y )/100 ;
    //         vertices[i*2*3+5]=0;
    
    //         geom.setPointVertices(vertices);
    //         if(!meshes[i])meshes[i]=new CGL.Mesh(op.patch.cgl,geom);
    //             else meshes[i].setGeom(geom);
    //         }
    // }
}


updateGeom();



render.onTriggered=function()
{
    sites[5].x=Math.sin(Date.now()*0.001)*40+0;
    sites[10].x=Math.sin(Date.now()*0.001)*40+0;
    sites[15].y=Math.sin(Date.now()*0.001)*40+0;
    sites[20].y=Math.sin(Date.now()*0.001)*40+0;
    sites[22].y=Math.sin(Date.now()*0.001)*40+0;
    sites[25].y=Math.sin(Date.now()*0.001)*40+0;
    updateGeom();

    
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;

    // shader.glPrimitive=cgl.gl.LINES;

// var i=1;
    for(var i in meshes)
    {
        meshes[i].render(op.patch.cgl.getShader());
    }
    
    shader.glPrimitive=oldPrim;

};