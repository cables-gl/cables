let render = op.inTrigger("Render");
let inDiagram = op.inObject("Diagram");
let next = op.outTrigger("Next");
let pExtrCenter = op.inValue("Extrude Cell Center", 0.1);
let pIgnoreBorderCells = op.inValueBool("Ignore Border Cells", false);
let inCalcNormals = op.inValueBool("Calc Normals", true);
let updatebutton = op.inTriggerButton("Update");

let needsGeomUpdate = false;
let verts = null;
let indices = new Uint16Array();
let centerPoints = [];
let mesh = null;
let geom = null;
updatebutton.onTriggered = changed;
inDiagram.onChange = changed;
inCalcNormals.onChange = changed;
pIgnoreBorderCells.onChange = changed;
pExtrCenter.onChange = changed;
let i = 0;

function changed()
{
    needsGeomUpdate = true;
}

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

    // console.log(w,h);

    // todo delete unalloc old mesh objects
    // meshes.length=0;
    // needsUpdate=false;

    let count = 0;
    for (var ic = 0; ic < sites.length; ic++)
    {
        var vid = sites[ic].voronoiId;
        var cell = diagram.cells[vid];

        if (cell)
        {
            for (var j = 0; j < cell.halfedges.length; j++)
            {
                count++;
            }
        }
    }

    let filling = 0.0;

    if (filling <= 0.0) verts = new Float32Array(count * 3 * 3);
    else verts = new Float32Array(count * 6 * 3);

    // console.log(count*6);

    count = 0;

    // for(var i=0;i<verts.length;i++)verts[i]=0;

    let invertFill = true;
    let ignoreBorderCells = pIgnoreBorderCells.get();
    // console.log(diagram);

    for (var ic = 0; ic < sites.length; ic++)
    {
        var vid = sites[ic].voronoiId;

        // if(ic==0)console.log(sites[ic]);

        var cell = diagram.cells[vid];
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

        // for(var j=0;j<cell.halfedges.length;j++)
        // {
        //     var edge=cell.halfedges[j].edge;

        //     // maxDist=Math.max(maxDist,Math.abs(edge.va.x-cell.site.x));
        //     // =Math.max(,Math.abs(edge.va.y-cell.site.y));
        //     // =Math.max(,Math.abs(edge.vb.x-cell.site.x));
        //     // =Math.max(,Math.abs(edge.vb.y-cell.site.y));
        //     // maxDist+=Math.abs(triangleArea(
        //     //         cell.site.x,cell.site.y,0,
        //     //         edge.va.x,edge.va.y,0,
        //     //         edge.vb.x,edge.vb.y,0
        //     //     ));
        // }

        // maxDist/=cell.halfedges.length;

        // console.log(maxDist);

        // if(maxDist>maxSize.get())
        // {
        //     var sizeDist=maxSizeEnd.get()-maxSize.get();
        //     scale=1.0-(maxDist-maxSize.get())/sizeDist;
        //     if(scale<0.0)scale=0.0;
        //     if(scale>1.0)scale=1.0;

        // }
        // else scale=1;

        centerPoints[ic * 3] = cell.site.x;
        centerPoints[ic * 3 + 1] = cell.site.y;
        centerPoints[ic * 3 + 2] = 0;

        // if(maxSize.get()!=0)
        // {
        //     maxDist=0;

        //     // if(invertFill)
        //         // filli = (filling)* ( (maxDist/maxSize.get()) );

        //     // if(maxDist>maxSizeEnd.get())ignoreCell=true;
        // }

        let filli = filling * scale;

        if (ignoreCell)
        {
            for (var j = 0; j < cell.halfedges.length; j++)
            {
                if (filli <= 0.0)
                {
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                }
                else
                {
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                    verts[count++] = 0;
                }
            }
        }
        else
        {
            for (var j = 0; j < cell.halfedges.length; j++)
            {
                var edge = cell.halfedges[j].edge;

                let edgevax = cell.site.x + ((edge.va.x - cell.site.x) * scale);
                let edgevay = cell.site.y + ((edge.va.y - cell.site.y) * scale);

                let edgevbx = cell.site.x + ((edge.vb.x - cell.site.x) * scale);
                let edgevby = cell.site.y + ((edge.vb.y - cell.site.y) * scale);

                if (filli <= 0.0)
                {
                    verts[count++] = cell.site.x;
                    verts[count++] = cell.site.y;
                    verts[count++] = pExtrCenter.get();

                    verts[count++] = edgevax;
                    verts[count++] = edgevay;
                    verts[count++] = 0;

                    verts[count++] = edgevbx;
                    verts[count++] = edgevby;
                    verts[count++] = 0;
                }
                else
                {
                    if (invertFill)
                    {
                        verts[count++] = cell.site.x;
                        verts[count++] = cell.site.y;
                        verts[count++] = pExtrCenter.get();

                        verts[count++] = edgevax - (edgevax - cell.site.x) * filli;
                        verts[count++] = edgevay - (edgevay - cell.site.y) * filli;
                        verts[count++] = 0;

                        verts[count++] = edgevbx - (edgevbx - cell.site.x) * filli;
                        verts[count++] = edgevby - (edgevby - cell.site.y) * filli;
                        verts[count++] = 0;

                        verts[count++] = cell.site.x;
                        verts[count++] = cell.site.y;
                        verts[count++] = pExtrCenter.get();

                        verts[count++] = edgevax - (edgevax - cell.site.x) * filli;
                        verts[count++] = edgevay - (edgevay - cell.site.y) * filli;
                        verts[count++] = 0;

                        verts[count++] = edgevbx - (edgevbx - cell.site.x) * filli;
                        verts[count++] = edgevby - (edgevby - cell.site.y) * filli;
                        verts[count++] = 0;
                    }
                    else
                    {
                        verts[count++] = cell.site.x + (edgevax - cell.site.x) * filli;
                        verts[count++] = cell.site.y + (edgevay - cell.site.y) * filli;
                        verts[count++] = 0;

                        verts[count++] = edgevax;
                        verts[count++] = edgevay;
                        verts[count++] = 0;

                        verts[count++] = edgevbx;
                        verts[count++] = edgevby;
                        verts[count++] = 0;

                        verts[count++] = cell.site.x + (edgevbx - cell.site.x) * filli;
                        verts[count++] = cell.site.y + (edgevby - cell.site.y) * filli;
                        verts[count++] = 0;

                        verts[count++] = cell.site.x + (edgevax - cell.site.x) * filli;
                        verts[count++] = cell.site.y + (edgevay - cell.site.y) * filli;
                        verts[count++] = 0;

                        verts[count++] = edgevbx;
                        verts[count++] = edgevby;
                        verts[count++] = 0;
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

    // if(pRender.get())
    {
        // tc.length=verts.length/3*2;

        if (indices.length < verts.length / 3)
        {
            indices = new Uint16Array(verts.length / 3);
            let c = 0;

            for (i = 0; i < verts.length / 3; i++)indices[i] = i;
        }

        // indices.length=verts.length;
        // var c=0;

        // for(i=0;i<verts.length/3;i++)indices.push(i);

        // for(i=0;i<verts.length/3;i++)
        // {
        //     tc[i*2+0]=0.0;
        //     tc[i*2+1]=0.0;
        // }

        if (!geom)geom = new CGL.Geometry();

        geom.vertices = verts;
        geom.verticesIndices = indices;
        // geom.texCoords=tc;
        if (inCalcNormals.get())
            geom.calculateNormals({ "forceZUp": true });

        if (!mesh)
        {
            mesh = new CGL.Mesh(op.patch.cgl, geom);
            console.log("new voronoi mesh");
        }
        // else mesh.setGeom(geom);

        // console.log(verts);

        let attr = mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, verts, 3);
        attr.numItems = verts.length / 3;

        mesh.setVertexIndices(indices);
        // else mesh.updateVertices(geom);

        // console.log('verts ',verts.length);
        // mesh.pos=[sites[ic].x,sites[ic].y,0];
    }

    // console.log(verts.length);

    // outVerts.set(null);
    // outVerts.set(verts);
}

render.onTriggered = function ()
{
    if (needsGeomUpdate)updateGeom();
    if (mesh)
    {
        mesh.render(op.patch.cgl.getShader());
    }
    next.trigger();
};
