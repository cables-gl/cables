op.name="voronoi";
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var pSites=op.inArray("Site Points");

var pRender=op.inValueBool("Render",true);

var pExtrCenter=op.inValue("Extrude Cell Center",0.1);


var next=op.outFunction("Next");

pExtrCenter.onChange=queueUpdate;

var needsUpdate=true;
var cgl=op.patch.cgl;

var voronoi = new Voronoi();
var bbox = {xl: -1, xr: 1, yt: -1, yb: 1}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
var sites=[];

for(var i=0;i<75;i++)
{
    sites.push(
        {
          x:Math.random()-0.5,
          y:Math.random()-0.5,
        });
}

var diagram = voronoi.compute(sites, bbox);
var meshes=[];
var geoms=[];

pSites.onChange=function()
{
    if(pSites.get())
    {
        var arr=pSites.get();
        if(arr.length%2!==0)arr.length--;
        sites.length=arr.length/2;
        console.log(sites.length);

        for(var i=0;i<sites.length;i++)
        {
            sites[i]=(
                {
                  x:arr[i*2],
                  y:arr[i*2+1]
                });
        }

        needsUpdate=true;
    }
};

function distance(x1,y1,x2,y2)
{
	var xd = x2-x1;
	var yd = y2-y1;
	return Math.sqrt(xd*xd + yd*yd);
}


function queueUpdate()
{
    needsUpdate=true;
}

function updateGeom()
{
    if(!sites)return;
    diagram = voronoi.compute(sites, bbox);

    // todo delete unalloc old mesh objects
    meshes.length=0;
    needsUpdate=false;

    for (var ic = 0; ic < sites.length; ic++)
    {
        var vid=sites[ic].voronoiId;
        var verts=[];
        var tc=[];
        var cell = diagram.cells[vid];
        if(!cell)return;

        var mX=0;
        var mY=0;
        var check=0;
        var indices=[];
        
        if(!geoms[vid])geoms[vid]=new CGL.Geometry();

        var minDist=9999999;

// console.log(cell.site);


        for(var j=0;j<cell.halfedges.length;j++)
        {
            var edge=cell.halfedges[j].edge;

            verts.push(cell.site.x);
            verts.push(cell.site.y);
            verts.push(pExtrCenter.get());
            tc.push(0);
            tc.push(0);
            indices.push(verts.length/3-1);

            verts.push(edge.va.x);
            verts.push(edge.va.y);
            verts.push(0);
            tc.push(1);
            tc.push(1);
            indices.push(verts.length/3-1);

            // minDist=Math.min(Math.abs(cell.site.x-edge.va.x),minDist);
            // minDist=Math.min(Math.abs(cell.site.y-edge.va.y),minDist);

            verts.push(edge.vb.x);
            verts.push(edge.vb.y);
            verts.push(0);
            tc.push(0);
            tc.push(1);
            indices.push(verts.length/3-1);
        }
        
        geoms[vid].vertices=verts;
        geoms[vid].verticesIndices=indices;
        geoms[vid].texCoords=tc;
        geoms[vid].calculateNormals({"forceZUp":true});
        
        if(!meshes[vid]) meshes[vid]=new CGL.Mesh(op.patch.cgl,geoms[vid]);
            else meshes[vid].setGeom(geoms[vid]);
        
        meshes[vid].pos=[sites[ic].x,sites[ic].y,0];
        
        
        var md=99999;

        for (var s = 0; s < sites.length; s++)
        {
            var d=distance(
                sites[ic].x,sites[ic].y,
                sites[s].x,sites[s].y);

            if(d!==0 )
            {
                md=Math.min(d,md);
                sites[ic].md=md/2;
                sites[ic].mdIndex=s;
            }
        }
        
        // md=md*md;
        meshes[vid].scale=[sites[ic].md,sites[ic].md,sites[ic].md];
        
        // console.log(md);
    }
    
    
    

}

render.onTriggered=function()
{
    if(needsUpdate)updateGeom();
    
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;

    for(var i in meshes)
    {
        if(pRender.get())meshes[i].render(op.patch.cgl.getShader());

        if(next.isLinked())
        {
            cgl.pushMvMatrix();
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, meshes[i].pos);
            mat4.scale(cgl.mvMatrix,cgl.mvMatrix, meshes[i].scale);

            next.trigger();
            cgl.popMvMatrix();
        }
    }
        


};