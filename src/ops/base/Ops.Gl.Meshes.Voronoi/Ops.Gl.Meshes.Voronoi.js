
var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var pSites=op.inArray("Site Points");

var pRender=op.inValueBool("Render",true);
var pInvert=op.inValueBool("Invert",false);
var pIgnoreBorderCells=op.inValueBool("Ignore Border Cells",false);


var pWidth=op.inValue("Width",2);
var pHeight=op.inValue("Height",2);

var fill=op.inValueSlider("Fill",0);
var pExtrCenter=op.inValue("Extrude Cell Center",0.1);
var maxSize=op.inValue("Scale Out Size Start",0);
var maxSizeEnd=op.inValue("Scale Out Size End",0);


var inCalcNormals=op.inValueBool("Calc Normals",true);
var next=op.outFunction("Next");
var outVerts=op.outArray("Points");
var outCenter=op.outArray("Center Points");

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
var centerPoints=[];
outCenter.set(centerPoints);


for(var i=0;i<75;i++)
{
    sites.push(
        {
          x:Math.random()-0.5,
          y:Math.random()-0.5,
        });
}

var diagram = voronoi.compute(sites, bbox);
var mesh=null;
var geom=null;


function triangleArea(x0,y0,z0,x1,y1,z1,x2,y2,z2)
{
    // 1. calculate vectors e1 and e2 (which can be of 
    // type Node, too) from N[0]->N[1] and N[0]->

    var e1x = x1 - x0;
    var e1y = y1 - y0;
    var e1z = z1 - z0;
    
    var e2x = x2 - x0;
    var e2y = y2 - y0;
    var e2z = z2 - z0;
    
    // 2. calculate e3 = e1 x e2 (cross product) :
    
    var e3x = e1y*e2z - e1z*e2y;
    var e3y = e1z*e2x - e1x*e2z;
    var e3z = e1x*e2y - e1y*e2x;
    
    // 3. the tria area is the half length of the  normal vector:
    
    return 0.5*Math.sqrt(e3x*e3x + e3y*e3y + e3z*e3z);
    
}



pSites.onChange=function()
{
    if(pSites.get())
    {
        var arr=pSites.get();
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

var verts=null;
var indices=new Uint16Array();
// var tc=new Float32Array(99000);

function updateGeom()
{
    if(!sites)return;
    diagram = voronoi.compute(sites, bbox);

    // todo delete unalloc old mesh objects
    // meshes.length=0;
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

    if(filling<=0.0) verts=new Float32Array(count*3*3);
    else verts=new Float32Array(count*6*3);
    
    // console.log(count*6);
    
    count=0;

    for(var i=0;i<verts.length;i++)verts[i]=0;

var invertFill=pInvert.get();
var ignoreBorderCells=pIgnoreBorderCells.get();
// console.log(diagram);

    for (var ic = 0; ic < sites.length; ic++)
    {
        var vid=sites[ic].voronoiId;

        // if(ic==0)console.log(sites[ic]);

        var cell = diagram.cells[vid];
        if(!cell)return;

        // if(ic==0) console.log(cell);

        var mX=0;
        var mY=0;
        var check=0;
        
        var w=pWidth.get();
        var h=pHeight.get();

        var minDist=9999999;

        var maxDist=0;
        var ignoreCell=false;

        if(ignoreBorderCells)    
        {
            for(var j=0;j<cell.halfedges.length;j++)
            {
                var edge=cell.halfedges[j].edge;
                if(Math.abs(edge.va.x)>=pWidth.get()/2)ignoreCell=true;
                if(Math.abs(edge.vb.x)>=pWidth.get()/2)ignoreCell=true;
                if(Math.abs(edge.va.y)>=pHeight.get()/2)ignoreCell=true;
                if(Math.abs(edge.vb.y)>=pHeight.get()/2)ignoreCell=true;
            }
        }
        
        var scale=1;

        for(var j=0;j<cell.halfedges.length;j++)
        {
            var edge=cell.halfedges[j].edge;

            // maxDist=Math.max(maxDist,Math.abs(edge.va.x-cell.site.x));
            // maxDist=Math.max(maxDist,Math.abs(edge.va.y-cell.site.y));
            // maxDist=Math.max(maxDist,Math.abs(edge.vb.x-cell.site.x));
            // maxDist=Math.max(maxDist,Math.abs(edge.vb.y-cell.site.y));
            maxDist+=Math.abs(triangleArea(
                    cell.site.x,cell.site.y,0,
                    edge.va.x,edge.va.y,0,
                    edge.vb.x,edge.vb.y,0
                ));
        }


        maxDist/=cell.halfedges.length;
        
        // console.log(maxDist);
    
        if(maxDist>maxSize.get())
        {
            var sizeDist=maxSizeEnd.get()-maxSize.get();
            scale=1.0-(maxDist-maxSize.get())/sizeDist;
            if(scale<0.0)scale=0.0;
            if(scale>1.0)scale=1.0;

        }
        else scale=1;

        centerPoints[ic*3]=cell.site.x;
        centerPoints[ic*3+1]=cell.site.y;
        centerPoints[ic*3+2]=maxDist;

        if(maxSize.get()!=0)
        {
            maxDist=0;

            // if(invertFill)
                // filli = (filling)* ( (maxDist/maxSize.get()) );
            
            if(maxDist>maxSizeEnd.get())ignoreCell=true;
        }

        var filli=filling*scale;

        
// if(scale<1)scale=0;

        if(ignoreCell)
        {
            for(var j=0;j<cell.halfedges.length;j++)
            {
                if(filli<=0.0)
                {
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                }
                else
                {
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                    verts[count++]=0;
                }
            }
        }
        else
        {
            for(var j=0;j<cell.halfedges.length;j++)
            {
                
                
                var edge=cell.halfedges[j].edge;



                var edgevax= cell.site.x+( (edge.va.x-cell.site.x)*scale );
                var edgevay= cell.site.y+( (edge.va.y-cell.site.y)*scale );

                var edgevbx= cell.site.x+( (edge.vb.x-cell.site.x)*scale );
                var edgevby= cell.site.y+( (edge.vb.y-cell.site.y)*scale );



                if(filli<=0.0)
                {
                    verts[count++]=cell.site.x;
                    verts[count++]=cell.site.y;
                    verts[count++]=pExtrCenter.get();

                    verts[count++]=edgevax;
                    verts[count++]=edgevay;
                    verts[count++]=0;

                    verts[count++]=edgevbx;
                    verts[count++]=edgevby;
                    verts[count++]=0;
                }
                else
                {
                    
                    if(invertFill)
                    {
                        verts[count++]=cell.site.x;
                        verts[count++]=cell.site.y;
                        verts[count++]=pExtrCenter.get();
    
                        verts[count++]=edgevax-(edgevax-cell.site.x)*filli;
                        verts[count++]=edgevay-(edgevay-cell.site.y)*filli;
                        verts[count++]=0;
    
                        verts[count++]=edgevbx-(edgevbx-cell.site.x)*filli;
                        verts[count++]=edgevby-(edgevby-cell.site.y)*filli;
                        verts[count++]=0;
                        
                        
                        verts[count++]=cell.site.x;
                        verts[count++]=cell.site.y;
                        verts[count++]=pExtrCenter.get();
    
                        verts[count++]=edgevax-(edgevax-cell.site.x)*filli;
                        verts[count++]=edgevay-(edgevay-cell.site.y)*filli;
                        verts[count++]=0;
    
                        verts[count++]=edgevbx-(edgevbx-cell.site.x)*filli;
                        verts[count++]=edgevby-(edgevby-cell.site.y)*filli;
                        verts[count++]=0;

                    }
                    else
                    {
                        verts[count++]=cell.site.x+(edgevax-cell.site.x)*filli;
                        verts[count++]=cell.site.y+(edgevay-cell.site.y)*filli;
                        verts[count++]=0;
            
                        verts[count++]=edgevax;
                        verts[count++]=edgevay;
                        verts[count++]=0;
        
                        verts[count++]=edgevbx;
                        verts[count++]=edgevby;
                        verts[count++]=0;



                        verts[count++]=cell.site.x+(edgevbx-cell.site.x)*filli;
                        verts[count++]=cell.site.y+(edgevby-cell.site.y)*filli;
                        verts[count++]=0;
            
                        verts[count++]=cell.site.x+(edgevax-cell.site.x)*filli;
                        verts[count++]=cell.site.y+(edgevay-cell.site.y)*filli;
                        verts[count++]=0;
                        
                        verts[count++]=edgevbx;
                        verts[count++]=edgevby;
                        verts[count++]=0;
                        
                    }
                    
                }
            }
        }
        

        
        // var md=99999;

        // for (var s = 0; s < sites.length; s++)
        // {
        //     var d=distance(
        //         sites[ic].x,sites[ic].y,
        //         sites[s].x,sites[s].y);

        //     if(d!==0 )
        //     {
        //         md=Math.min(d,md);
        //         sites[ic].md=md/2;
        //         sites[ic].mdIndex=s;
        //     }
        // }
        
        // md=md*md;
        // [vid].scale=[sites[ic].md,sites[ic].md,sites[ic].md];
        
    }

    // geom.unIndex();
    
    if(pRender.get())
    {
        // tc.length=verts.length/3*2;
        
        
        if(indices.length<verts.length)
        {
            indices=new Uint16Array(verts.length/3);
            var c=0;
            
            for(i=0;i<verts.length/3;i++)indices[i]=i;
            
        }
    
    
        // indices.length=verts.length;
        // var c=0;
        
        // for(i=0;i<verts.length/3;i++)indices.push(i);
    
    
    
    
        // for(i=0;i<verts.length/3;i++)
        // {
        //     tc[i*2+0]=0.0;
        //     tc[i*2+1]=0.0;
        // }
    
        if(!geom)geom=new CGL.Geometry();
    
        geom.vertices=verts;
        geom.verticesIndices=indices;
        // geom.texCoords=tc;
        if(inCalcNormals.get())
            geom.calculateNormals({"forceZUp":true});
        
        if(!mesh) 
        {
            mesh=new CGL.Mesh(op.patch.cgl,geom);
            console.log("new voronoi mesh");
        }
            // else mesh.setGeom(geom);
            
        var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,verts,3);
        attr.numItems=verts.length/3;
        
        mesh.setVertexIndices(indices);

            // else mesh.updateVertices(geom);

        // console.log('verts ',verts.length);
        // mesh.pos=[sites[ic].x,sites[ic].y,0];
        
    }
    
    // console.log(verts.length);
    
    outVerts.set(null);
    outVerts.set(verts);
}


render.onTriggered=function()
{
    if(needsUpdate)updateGeom();
    
    var shader=cgl.getShader();
    if(!shader)return;
    var oldPrim=shader.glPrimitive;

    // for(var i=0;i<meshes.length;i++)
    // {
        if(pRender.get())mesh.render(op.patch.cgl.getShader());

        if(next.isLinked())
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, mesh.pos);
            mat4.scale(cgl.mvMatrix,cgl.mvMatrix, mesh.scale);

            next.trigger();
            cgl.popModelMatrix();
        }
    // }
    


};