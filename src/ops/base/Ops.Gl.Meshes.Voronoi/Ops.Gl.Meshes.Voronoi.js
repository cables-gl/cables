op.name="voronoi";
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var pSites=op.inArray("Site Points");

var pExtrCenter=op.inValue("Extrude Cell Center",0.1);

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
        // var sites=[];
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
        console.log(sites);
        // diagram = voronoi.compute(sites, bbox);
    }
};



pExtrCenter.onChange=queueUpdate;

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

        for(var j=0;j<cell.halfedges.length;j++)
        {
            var edge=cell.halfedges[j].edge;

            verts.push(cell.site.x);
            verts.push(cell.site.y);
            verts.push(pExtrCenter.get());
            indices.push(verts.length/3-1);
            
            tc.push(0);
            tc.push(0);

            verts.push(edge.va.x);
            verts.push(edge.va.y);
            verts.push(0);
            tc.push(1);
            tc.push(1);
            indices.push(verts.length/3-1);
            
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
        // geoms[vid].unIndex();
        geoms[vid].calculateNormals({"forceZUp":true});
        
        if(!meshes[vid]) meshes[vid]=new CGL.Mesh(op.patch.cgl,geoms[vid]);
            else meshes[vid].setGeom(geoms[vid]);
    }

    console.log("generated meshes ",meshes.length);

}



render.onTriggered=function()
{
    if(needsUpdate)updateGeom();
    
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;
    
    // shader.glPrimitive=cgl.gl.TRIANGLE_FAN;

    for(var i in meshes)
    {
        meshes[i].render(op.patch.cgl.getShader());
    }
    
    // shader.glPrimitive=oldPrim;

};