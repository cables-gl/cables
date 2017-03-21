op.name="Voronoi";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var pSites=op.inArray("Site Points");

var pRender=op.inValueBool("Render",true);

var pArray3d=op.inValueBool("3d Points",false);
var pWidth=op.inValue("Width",2);
var pHeight=op.inValue("Height",2);

var fill=op.inValueSlider("Fill",0);
var pExtrCenter=op.inValue("Extrude Cell Center",0.1);
var inCalcNormals=op.inValueBool("Calc Normals",true);
var next=op.outFunction("Next");
var outVerts=op.outArray("Points");

pExtrCenter.onChange=queueUpdate;
fill.onChange=queueUpdate;
inCalcNormals.onChange=queueUpdate;

var needsUpdate=true;
var cgl=op.patch.cgl;

var voronoi = new Voronoi();
var bbox = {xl: -1, xr: 1, yt: -1, yb: 1}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
var sites=[];

function updateSize()
{
    bbox.xl=-pWidth.get()/2;
    bbox.xr=pWidth.get()/2;
    bbox.yt=-pHeight.get()/2;
    bbox.yb=pHeight.get()/2;
    queueUpdate();
}

pWidth.onChange=updateSize;
pHeight.onChange=updateSize;


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
var geom=null;

pSites.onChange=function()
{
    if(pSites.get())
    {
        var arr=pSites.get();
        
        if(pArray3d.get())
        {
            sites.length=arr.length/3;
    
            for(var i=0;i<sites.length;i++)
            {
                sites[i]=(
                    {
                      x:arr[i*3],
                      y:arr[i*3+1]
                    });
            }

        }
        else
        {
            if(arr.length%2!==0)arr.length--;
            sites.length=arr.length/2;
    
            for(var i=0;i<sites.length;i++)
            {
                sites[i]=(
                    {
                      x:arr[i*2],
                      y:arr[i*2+1]
                    });
            }

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

var verts=[];    
var indices=[];
var tc=new Float32Array(99000);


function updateGeom()
{
    if(!sites)return;
    diagram = voronoi.compute(sites, bbox);

    // todo delete unalloc old mesh objects
    meshes.length=0;
    needsUpdate=false;


    var count=0;
    for (var ic = 0; ic < sites.length; ic++)
    {
        var vid=sites[ic].voronoiId;

        var cell = diagram.cells[vid];

        if(cell)
        {
            for(var j=0;j<cell.halfedges.length;j++)
            {
                count++;
            }
            
        }
    }
    
    var filling=fill.get();

    if(filling<=0.0) verts.length=count*3*3;
    else verts.length=count*6*3;
    
    // console.log(count*6);
    
    count=0;


    for (var ic = 0; ic < sites.length; ic++)
    {
        // if(ic==0)console.log(sites[ic]);
        var vid=sites[ic].voronoiId;

        
        var cell = diagram.cells[vid];
        if(!cell)return;

        var mX=0;
        var mY=0;
        var check=0;
        
        var w=pWidth.get();
        var h=pHeight.get();
        
        

        var minDist=9999999;



        for(var j=0;j<cell.halfedges.length;j++)
        {
            var edge=cell.halfedges[j].edge;

            
            if(filling<=0.0)
            {
                verts[count++]=cell.site.x;
                verts[count++]=cell.site.y;
                verts[count++]=pExtrCenter.get();
    
                verts[count++]=edge.va.x;
                verts[count++]=edge.va.y;
                verts[count++]=0;
    
    
                verts[count++]=edge.vb.x;
                verts[count++]=edge.vb.y;
                verts[count++]=0;
            }
            else
            {
                verts[count++]=cell.site.x+(edge.va.x-cell.site.x)*filling;
                verts[count++]=cell.site.y+(edge.va.y-cell.site.y)*filling;
                verts[count++]=0;
    
                verts[count++]=edge.va.x;
                verts[count++]=edge.va.y;
                verts[count++]=0;

                verts[count++]=edge.vb.x;
                verts[count++]=edge.vb.y;
                verts[count++]=0;



                verts[count++]=cell.site.x+(edge.vb.x-cell.site.x)*filling;
                verts[count++]=cell.site.y+(edge.vb.y-cell.site.y)*filling;
                verts[count++]=0;
    
                verts[count++]=cell.site.x+(edge.va.x-cell.site.x)*filling;
                verts[count++]=cell.site.y+(edge.va.y-cell.site.y)*filling;
                verts[count++]=0;
                
                verts[count++]=edge.vb.x;
                verts[count++]=edge.vb.y;
                verts[count++]=0;

            }

        }
        

        
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
        // meshes[vid].scale=[sites[ic].md,sites[ic].md,sites[ic].md];
        
    }

    // geom.unIndex();
    
    if(pRender.get())
    {
        tc.length=verts.length/3*2;
        indices.length=verts.length;
        var c=0;
        
        for(i=0;i<verts.length/3;i++)indices.push(i);
    
        // for(i=0;i<verts.length/3;i++)
        // {
        //     tc[i*2+0]=0.0;
        //     tc[i*2+1]=0.0;
        // }
    
        if(!geom)geom=new CGL.Geometry();
    
        geom.vertices=verts;
        geom.verticesIndices=indices;
        geom.texCoords=tc;
        if(inCalcNormals.get())
            geom.calculateNormals({"forceZUp":true});
        
        if(!meshes[0]) meshes[0]=new CGL.Mesh(op.patch.cgl,geom);
            else meshes[0].setGeom(geom);
            // else meshes[0].updateVertices(geom);

        // console.log('verts ',verts.length);
        // meshes[0].pos=[sites[ic].x,sites[ic].y,0];
        
    }
    
    // console.log(verts.length);
    
    outVerts.set(null);
    outVerts.set(verts);

    
    
}

render.onTriggered=function()
{
    if(needsUpdate)updateGeom();
    
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;

    for(var i=0;i<meshes.length;i++)
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