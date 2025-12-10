let render = op.inTrigger("Render");
let inDiagram = op.inObject("Diagram");
let next = op.outTrigger("Next");
let pIgnoreBorderCells = op.inValueBool("Ignore Border Cells", false);

let needsGeomUpdate = false;
var verts = null;
let indices = new Uint16Array();
let needsUpdate = false;

inDiagram.ignoreValueSerialize = true;

let cgl = op.patch.cgl;

let geom = new CGL.Geometry("voronoilines");
geom.vertices = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let mesh = new CGL.Mesh(cgl, geom);

let tc = new Float32Array(200);
for (let i = 0; i < 50; i++)
{
    tc[i * 4 + 0] = (i / 14) % 1;
    tc[i * 4 + 1] = 0.5;
    tc[i * 4 + 2] = (i / 14) % 1;
    tc[i * 4 + 3] = 0.5;
}

function drawLine(buff, num)
{
    let shader = cgl.getShader();

    let oldPrim = shader.glPrimitive;
    shader.glPrimitive = cgl.gl.LINES;// _STRIP;
    let attr = mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, buff, 3);
    mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD, tc, 2);

    attr.numItems = num;

    mesh.render(shader);
    shader.glPrimitive = oldPrim;
}

var verts = new Float32Array(99);

function updateGeom()
{
    // if(!sites)return;
    let voro = inDiagram.get();
    if (!voro) return;
    needsGeomUpdate = false;

    let sites = voro.sites;
    let diagram = voro.diagram;
    let w = voro.width;
    let h = voro.height;

    // todo delete unalloc old mesh objects
    // meshes.length=0;
    needsUpdate = false;

    let invertFill = true;
    let ignoreBorderCells = pIgnoreBorderCells.get();

    for (let ic = 0; ic < sites.length; ic++)
    {
        let count = 0;
        let vid = sites[ic].voronoiId;

        // if(ic==0)console.log(sites[ic]);

        let cell = diagram.cells[vid];
        if (!cell) return;

        // if(ic==0) console.log(cell);

        let mX = 0;
        let mY = 0;
        let check = 0;

        let minDist = 9999999;
        let ignoreCell = false;

        if (ignoreBorderCells)
        {
            for (var j = 0; j < cell.halfedges.length; j++)
            {
                var edge = cell.halfedges[j].edge;
                if (Math.abs(edge.va.x) >= w / 2)ignoreCell = true;
                if (Math.abs(edge.vb.x) >= w / 2)ignoreCell = true;
                if (Math.abs(edge.va.y) >= h / 2)ignoreCell = true;
                if (Math.abs(edge.vb.y) >= h / 2)ignoreCell = true;
            }
        }

        let scale = 1;

        let time = op.patch.freeTimer.get();
        let canceled = false;

        if (!ignoreCell)
        {
            for (var j = 0; j < cell.halfedges.length; j++)
            {
                var edge = cell.halfedges[j].edge;

                let addX = 0.0;
                let addY = 0;

            	let xd = edge.vb.x - edge.va.x;
            	let yd = edge.vb.y - edge.va.y;

                if (!Math.abs(xd * xd + yd * yd) > 0.41)canceled = true;

                verts[count++] = edge.va.x;
                verts[count++] = edge.va.y;
                verts[count++] = 0;

                verts[count++] = edge.vb.x;
                verts[count++] = edge.vb.y;
                verts[count++] = 0;
            }
        }

        if (!canceled)drawLine(verts, count / 3);
    }
}

render.onTriggered = function ()
{
    updateGeom();

    next.trigger();
};
