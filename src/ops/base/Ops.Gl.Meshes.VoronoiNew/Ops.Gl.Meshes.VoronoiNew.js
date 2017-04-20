op.name="VoronoiNew";

var render=op.inFunction("Render");
var pSites=op.inArray("Site Points");

var pWidth=op.inValue("Width",2);
var pHeight=op.inValue("Height",2);

var next=op.outFunction("Next");
var outVoronoi=op.outObject("Voronoi");

var needsUpdate=true;
var voronoi = new Voronoi();
var bbox = {xl: -1, xr: 1, yt: -1, yb: 1}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
var sites=[];


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



function draw()
{
    
}

function updateSize()
{
    bbox.xl=-pWidth.get()/2;
    bbox.xr=pWidth.get()/2;
    bbox.yt=-pHeight.get()/2;
    bbox.yb=pHeight.get()/2;
    needsUpdate=true;
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

var outObj={};

function updateGeom()
{
    if(!sites)return;
    diagram = voronoi.compute(sites, bbox);
    needsUpdate=false;
    outVoronoi.set(null);

    outObj.diagram=diagram;
    outObj.sites=sites;
    outObj.width=pWidth.get();
    outObj.height=pHeight.get();

    outVoronoi.set(outObj);
}

render.onTriggered=function()
{
    if(needsUpdate)updateGeom();

    
    next.trigger();
 

};