let render = op.inTrigger("Render");
let pSites = op.inArray("Site Points");

let pWidth = op.inValue("Width", 2);
let pHeight = op.inValue("Height", 2);

let next = op.outTrigger("Next");
let outVoronoi = op.outObject("Voronoi");

let needsUpdate = true;
let voronoi = new Voronoi();
let bbox = { "xl": -1, "xr": 1, "yt": -1, "yb": 1 }; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
let sites = [];

pWidth.onChange = updateSize;
pHeight.onChange = updateSize;

for (let i = 0; i < 75; i++)
{
    sites.push(
        {
            "x": Math.random() - 0.5,
            "y": Math.random() - 0.5,
        });
}

let diagram = voronoi.compute(sites, bbox);

function draw()
{

}

function updateSize()
{
    bbox.xl = -pWidth.get() / 2;
    bbox.xr = pWidth.get() / 2;
    bbox.yt = -pHeight.get() / 2;
    bbox.yb = pHeight.get() / 2;
    needsUpdate = true;
}

pSites.onChange = function ()
{
    if (pSites.get())
    {
        let arr = pSites.get();
        if (arr.length % 2 !== 0)arr.length--;
        sites.length = arr.length / 2;

        for (let i = 0; i < sites.length; i++)
        {
            sites[i] = (
                {
                    "x": arr[i * 2],
                    "y": arr[i * 2 + 1]
                });
        }

        needsUpdate = true;
    }
};

let outObj = {};

function updateGeom()
{
    if (!sites) return;
    diagram = voronoi.compute(sites, bbox);
    needsUpdate = false;
    outVoronoi.set(null);

    outObj.diagram = diagram;
    outObj.sites = sites;
    outObj.width = pWidth.get();
    outObj.height = pHeight.get();

    outVoronoi.set(outObj);
}

render.onTriggered = function ()
{
    if (needsUpdate)updateGeom();

    next.trigger();
};
