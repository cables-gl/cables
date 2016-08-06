op.name="voronoitest2";
var v=op.addInPort(new Port(op,"parameter",OP_PORT_TYPE_VALUE,{display:"string"}));


var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var voronoi = new Voronoi();
var bbox = {xl: -140, xr: 140, yt: -80, yb: 80}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
var sites=[];
for(var i=0;i<75;i++)
{
    sites.push(
        {
           x:Math.random()*200-100,
           y:Math.random()*200-100,
        });
}

for(var i=0;i<10;i++)
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
var meshes=[];
var geoms=[];
var checksums=[];

    var points=[];
    var points2=[];
    
    points2.length=1000;
    points.length=1000;
    var vertices=[];
    var texCoords=[];


var firsttime=true;
function updateGeom()
{
    
    diagram = voronoi.compute(sites, bbox);
    // meshes.length=1;

    // var geom=new CGL.Geometry();
    var countMeshUpdates=0;

// console.log(sites[0].voronoiId );
    
    for (var ic = 0; ic < sites.length; ic++)
    {
        // for(var i=0;i<diagram.cells.length;i++)
        {
            
            var vid=sites[ic].voronoiId;
            vertices.length=0;
            
            var cell = diagram.cells[vid];
            // var cell = diagram.cells[i];
    
            var mX=0;
            var mY=0;
            var check=0;
            for(var j=0;j<cell.halfedges.length;j++)
            {
                var edge=cell.halfedges[j].edge;
                mX+=edge.va.x;
                mY+=edge.va.y;
                mX+=edge.vb.x;
                mY+=edge.vb.y;
                check+=edge.vb.y+edge.vb.x+edge.va.y+edge.va.x;
            }
            
            if(checksums[vid] && checksums[vid]==check)continue;

            checksums[vid]=check;
            
            countMeshUpdates++;
            
            mX/=(cell.halfedges.length*2);
            mY/=(cell.halfedges.length*2);
    
            var pointsLength=cell.halfedges.length*3+9;
            var j=0;
            for(j=0;j<cell.halfedges.length;j++)
            {
                var lastedge=null;
                var edge=cell.halfedges[j];
                var ep=edge.getEndpoint();

                if(firsttime)console.log( ep );

                points[j*3+0]=( ( (ep.x-mX))/100 );
                points[j*3+1]=( ( (ep.y-mY))/100 );
                points[j*3+2]=( 0 );
            }
            
            points[j*3+0]=points[0];
            points[j*3+1]=points[1];
            points[j*3+2]=points[2];
            points[j*3+3]=points[3];
            points[j*3+4]=points[4];
            points[j*3+5]=points[5];
            points[j*3+6]=points[6];
            points[j*3+7]=points[7];
            points[j*3+8]=points[8];
            
            // points.push(points[0]);
            // points.push(points[1]);
            // points.push(points[2]);
    
            // points.push(points[3]);
            // points.push(points[4]);
            // points.push(points[5]);
    
            // points.push(points[6]);
            // points.push(points[7]);
            // points.push(points[8]);

            firsttime=false;

            
//             var subd=2;
//             // points2.length=points.length;
//             var counter=0;
//             var c=0;
// // console.log('b  l ',points.length);
//             for(var m=3;m<pointsLength-6;m+=3)
//             {
//                 for(j=0;j<subd;j++)
//                 {
//                     counter++;
//                     if(counter%2===0)
//                         for(k=0;k<3;k++)
//                         {
//                             var p=ip(
//                                 (points[m+k-3]+points[m+k])/2,
//                                 points[m+k+0],
//                                 (points[m+k+3]+points[m+k+0])/2,
//                                 j/subd
//                                 );

//                             if(k==0) points2[c]=p+mX/100;
//                             if(k==1) points2[c]=p+mY/100;
//                             c++;
//                         }
//                 }
//             }
            
//             points2[c+0]=points2[0];
//             points2[c+1]=points2[1];
//             points2[c+2]=points2[2];
//             points2[c+3]=points2[3];
//             points2[c+4]=points2[4];
//             points2[c+5]=points2[5];
//             points2[c+6]=points2[6];
//             points2[c+7]=points2[7];
//             points2[c+8]=points2[8];

            points2=points;

            var subd=8;
            vertices.length=pointsLength*(subd-1);

            vertices[0]=(mX/100);
            vertices[1]=(mY/100);
            vertices[2]=0;

// console.log('p2l',points2.length);

            var c=0;
            for(var m=3;m<pointsLength-3;m+=3)
            {
                for(j=0;j<subd;j++)
                {
                    for(k=0;k<3;k++)
                    {
                        var p=ip(
                            (points2[m+k-3]+points2[m+k])/2,
                            points2[m+k+0],
                            (points2[m+k+3]+points2[m+k+0])/2,
                            j/subd
                            );
                            
                        if(k==0) vertices[c]=p*0.86+mX/100;
                            else if(k==1) vertices[c]=p*0.86+mY/100;
                                else vertices[c]=p;
                        c++;

                    }
                }
            }
            // console.log('vl',vertices.length);
    
            
            var rnd=Math.random();
            texCoords.length=vertices.length/3*2;
            for(var m=0;m<texCoords.length;m++)texCoords[m]=ic/sites.length;
            
            if(!geoms[vid])geoms[vid]=new CGL.Geometry();
            geoms[vid].vertices=vertices;
            geoms[vid].texCoords=texCoords;
            // geom.setPointVertices(vertices);
            if(!meshes[vid]) meshes[vid]=new CGL.Mesh(op.patch.cgl,geoms[vid]);
                else meshes[vid].setGeom(geoms[vid]);
            
      
        }
    }
    // op.log('voro verts:'+vertices.length);

// op.log('countMeshUpdates '+countMeshUpdates);

}

updateGeom();

render.onTriggered=function()
{
    sites[5].x=Math.sin(Date.now()*0.001)*40+0;
    sites[10].x=-1*Math.sin(Date.now()*0.001)*40+0;
    // sites[30].x=Math.sin(Date.now()*0.001)*40+0;
    // sites[30].x=Math.sin(Date.now()*0.001)*40+0;
    // sites[30].x=-1*Math.sin(Date.now()*0.001)*40+0;

    sites[15].y=Math.sin(Date.now()*0.001)*40+0;
    sites[20].y=-1*Math.sin(Date.now()*0.001)*40+0;
    sites[22].y=Math.sin(Date.now()*0.001)*40+0;
    sites[25].y=-1*Math.sin(Date.now()*0.001)*40+0;
    // voronoi.recycle(diagram);
    updateGeom();
    
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;
    
    shader.glPrimitive=cgl.gl.TRIANGLE_FAN;

    for(var i in meshes)
    {
        meshes[i].render(op.patch.cgl.getShader());
    }
    
    shader.glPrimitive=oldPrim;

};