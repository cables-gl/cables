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



function ip(x0,x1,x2,t)//Bezier 
{
    var r =(x0 * (1-t) * (1-t) + 2 * x1 * (1 - t)* t + x2 * t * t);
    return r;
}


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
        
        
        
        
        var points=[];
        for(var j=diagram.cells[i].halfedges.length-1;j>=0;j--)
        {
            var edge=diagram.cells[i].halfedges[j].edge;
            var smaller=0.8;

            // points.push( (mX+(edge.va.x-mX )*smaller)/100 );
            // points.push( (mY+(edge.va.y-mY )*smaller)/100 );
            // points.push( 0 );

// if(j==0)
{
            points.push( (mX+(edge.vb.x-mX )*smaller)/100 );
            points.push( (mY+(edge.vb.y-mY )*smaller)/100 );
            points.push( 0 );
    
}

    
        }
        
        // points.push(points[3]);
        // points.push(points[4]);
        // points.push(points[5]);

        points.push(0);
        points.push(0);
        points.push(0);


        
        // var subd=35;
        
        // // for(i=3;i<cgl.frameStore.SplinePoints.length-6;i+=3)
        // for(var m=3;m<points.length-6;m+=3)
        // {
        //     for(j=0;j<subd;j++)
        //     {
        //         for(k=0;k<3;k++)
        //         {
        //             var p=ip(
        //                 (points[m+k-3]+points[m+k])/2,
        //                 points[m+k+0],
        //                 (points[m+k+3]+points[m+k+0])/2,
        //                 j/subd
        //                 );


        //             vertices.push(p);
        //         }
        //     }
        // }


        for(var j=0;j<diagram.cells[i].halfedges.length;j++)
        {
            var edge=diagram.cells[i].halfedges[j].edge;
            var smaller=0.9;

            vertices.push( (mX+(edge.va.x-mX )*smaller)/100 );
            vertices.push( (mY+(edge.va.y-mY )*smaller)/100 );
            vertices.push( 0 );
    
            vertices.push( (mX+(edge.vb.x-mX )*smaller)/100 );
            vertices.push( (mY+(edge.vb.y-mY )*smaller)/100 );
            vertices.push( 0 );

            vertices.push( (mX )/100 );
            vertices.push( (mY )/100  );
            vertices.push( 0 );
        }        
    }
    
    // op.log('voro verts:'+vertices.length);
    
    geom.setPointVertices(vertices);
    meshes[0]=new CGL.Mesh(op.patch.cgl,geom);

}


updateGeom();



render.onTriggered=function()
{
    sites[5].x=Math.sin(Date.now()*0.001)*40+0;
    sites[10].x=-1*Math.sin(Date.now()*0.001)*40+0;
    sites[30].x=Math.sin(Date.now()*0.001)*40+0;
    sites[30].x=Math.sin(Date.now()*0.001)*40+0;
    sites[30].x=-1*Math.sin(Date.now()*0.001)*40+0;
    
    sites[15].y=Math.sin(Date.now()*0.001)*40+0;
    sites[20].y=-1*Math.sin(Date.now()*0.001)*40+0;
    sites[22].y=Math.sin(Date.now()*0.001)*40+0;
    sites[25].y=-1*Math.sin(Date.now()*0.001)*40+0;
    voronoi.recycle(diagram);
    updateGeom();
    
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;

    for(var i in meshes)
    {
        meshes[i].render(op.patch.cgl.getShader());
    }
    
    shader.glPrimitive=oldPrim;

};