let tab = null;

function closeTab()
{
    if (tab)gui.mainTabs.closeTab(tab.id);
    tab = null;
}

function formatVec(arr)
{
    const nums = [];
    for (let i = 0; i < arr.length; i++)
    {
        nums.push(Math.round(arr[i] * 1000) / 1000);
    }

    return nums.join(",");
}

function printNode(html, node, level)
{
    if (!gltf) return;

    html += "<tr class=\"row\">";

    let ident = "";
    let identSpace = "";

    for (let i = 1; i < level; i++)
    {
        identSpace += "&nbsp;&nbsp;&nbsp;";
        let identClass = "identBg";
        if (i == 1)identClass = "identBgLevel0";
        ident += "<td class=\"ident " + identClass + "\" ><div style=\"\"></div></td>";
    }
    let id = CABLES.uuid();
    html += ident;
    html += "<td colspan=\"" + (21 - level) + "\">";

    if (node.mesh && node.mesh.meshes.length)html += "<span class=\"icon icon-cube\"></span>&nbsp;";
    else html += "<span class=\"icon icon-box-select\"></span> &nbsp;";

    html += node.name + "</td><td></td>";

    if (node.mesh)
    {
        html += "<td>";
        for (let i = 0; i < node.mesh.meshes.length; i++)
        {
            if (i > 0)html += ", ";
            html += node.mesh.meshes[i].name;
        }

        html += "</td>";

        html += "<td>";
        html += node.hasSkin() || "-";
        html += "</td>";

        html += "<td>";
        let countMats = 0;
        for (let i = 0; i < node.mesh.meshes.length; i++)
        {
            if (countMats > 0)html += ", ";
            if (gltf.json.materials && node.mesh.meshes[i].hasOwnProperty("material"))
            {
                if (gltf.json.materials[node.mesh.meshes[i].material])
                {
                    html += gltf.json.materials[node.mesh.meshes[i].material].name;
                    countMats++;
                }
            }
        }
        if (countMats == 0)html += "none";
        html += "</td>";
    }
    else
    {
        html += "<td>-</td><td>-</td><td>-</td>";
    }

    html += "<td>";

    if (node._node.translation || node._node.rotation || node._node.scale)
    {
        let info = "";

        if (node._node.translation)info += "Translate: `" + formatVec(node._node.translation) + "` || ";
        if (node._node.rotation)info += "Rotation: `" + formatVec(node._node.rotation) + "` || ";
        if (node._node.scale)info += "Scale: `" + formatVec(node._node.scale) + "` || ";

        html += "<span class=\"icon icon-gizmo info\" data-info=\"" + info + "\"></span> &nbsp;";
    }

    if (node._animRot || node._animScale || node._animTrans)
    {
        let info = "Animated: ";
        if (node._animRot) info += "Rot ";
        if (node._animScale) info += "Scale ";
        if (node._animTrans) info += "Trans ";

        html += "<span class=\"icon icon-clock info\" data-info=\"" + info + "\"></span>&nbsp;";
    }

    if (!node._node.translation && !node._node.rotation && !node._node.scale && !node._animRot && !node._animScale && !node._animTrans) html += "-";

    html += "</td>";

    html += "<td>";
    let hideclass = "";
    if (node.hidden)hideclass = "node-hidden";

    // html+='';
    html += "<a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + node.name + "','transform')\" class=\"treebutton\">Transform</a>";
    html += " <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + node.name + "','hierarchy')\" class=\"treebutton\">Hierarchy</a>";
    html += " <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + node.name + "')\" class=\"treebutton\">Node</a>";

    if (node.hasSkin())
        html += " <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + node.name + "',false,{skin:true});\" class=\"treebutton\">Skin</a>";

    html += "</td><td>";
    html += "&nbsp;<span class=\"icon iconhover icon-eye " + hideclass + "\" onclick=\"gui.corePatch().getOpById('" + op.id + "').toggleNodeVisibility('" + node.name + "');this.classList.toggle('node-hidden');\"></span>";
    html += "</td>";

    html += "</tr>";

    if (node.children)
    {
        for (let i = 0; i < node.children.length; i++)
            html = printNode(html, gltf.nodes[node.children[i]], level + 1);
    }

    return html;
}

function printMaterial(mat, idx)
{
    let html = "<tr>";
    html += " <td>" + idx + "</td>";
    html += " <td>" + mat.name + "</td>";

    html += " <td>";

    const info = JSON.stringify(mat, null, 4).replaceAll("\"", "").replaceAll("\n", "<br/>");

    html += "<span class=\"icon icon-info\" onclick=\"new CABLES.UI.ModalDialog({ 'html': '<pre>" + info + "</pre>', 'title': '" + mat.name + "' });\"></span>&nbsp;";

    if (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor)
    {
        let rgb = "";
        rgb += "" + Math.round(mat.pbrMetallicRoughness.baseColorFactor[0] * 255);
        rgb += "," + Math.round(mat.pbrMetallicRoughness.baseColorFactor[1] * 255);
        rgb += "," + Math.round(mat.pbrMetallicRoughness.baseColorFactor[2] * 255);

        html += "<div style=\"width:15px;height:15px;background-color:rgb(" + rgb + ");display:inline-block\">&nbsp;</a>";
    }
    html += " <td style=\"\">" + (gltf.shaders[idx] ? "-" : "<a onclick=\"gui.corePatch().getOpById('" + op.id + "').assignMaterial('" + mat.name + "')\" class=\"treebutton\">Assign</a>") + "<td>";
    html += "<td>";

    html += "</tr>";
    return html;
}

function printInfo()
{
    if (!gltf) return;

    const startTime = performance.now();
    const sizes = {};
    let html = "<div style=\"overflow:scroll;width:100%;height:100%\">";

    html += "File: <a href=\"" + CABLES.platform.getCablesUrl() + "/asset/patches/?filename=" + inFile.get() + "\" target=\"_blank\">" + CABLES.basename(inFile.get()) + "</a><br/>";

    html += "Generator:" + gltf.json.asset.generator;

    let numNodes = 0;
    if (gltf.json.nodes)numNodes = gltf.json.nodes.length;
    html += "<div id=\"groupNodes\">Nodes (" + numNodes + ")</div>";

    html += "<table id=\"sectionNodes\" class=\"table treetable\">";

    html += "<tr>";
    html += " <th colspan=\"21\">Name</th>";
    html += " <th>Mesh</th>";
    html += " <th>Skin</th>";
    html += " <th>Material</th>";
    html += " <th>Transform</th>";
    html += " <th>Expose</th>";
    html += " <th></th>";
    html += "</tr>";

    for (let i = 0; i < gltf.nodes.length; i++)
    {
        if (!gltf.nodes[i].isChild)
            html = printNode(html, gltf.nodes[i], 1);
    }
    html += "</table>";

    // / //////////////////

    let numMaterials = 0;
    if (gltf.json.materials)numMaterials = gltf.json.materials.length;
    html += "<div id=\"groupMaterials\">Materials (" + numMaterials + ")</div>";

    if (!gltf.json.materials || gltf.json.materials.length == 0)
    {
    }
    else
    {
        html += "<table id=\"materialtable\"  class=\"table treetable\">";
        html += "<tr>";
        html += " <th>Index</th>";
        html += " <th>Name</th>";
        html += " <th>Color</th>";
        html += " <th>Function</th>";
        html += " <th></th>";
        html += "</tr>";
        for (let i = 0; i < gltf.json.materials.length; i++)
        {
            html += printMaterial(gltf.json.materials[i], i);
        }
        html += "</table>";
    }

    // / ///////////////////////

    html += "<div id=\"groupMeshes\">Meshes (" + gltf.json.meshes.length + ")</div>";

    html += "<table id=\"meshestable\"  class=\"table treetable\">";
    html += "<tr>";
    html += " <th>Name</th>";
    html += " <th>Node</th>";
    html += " <th>Material</th>";
    html += " <th>Vertices</th>";
    html += " <th>Attributes</th>";
    html += "</tr>";

    let sizeBufferViews = [];
    sizes.meshes = 0;
    sizes.meshTargets = 0;

    for (let i = 0; i < gltf.json.meshes.length; i++)
    {
        html += "<tr>";
        html += "<td>" + gltf.json.meshes[i].name + "</td>";

        html += "<td>";
        let count = 0;
        let nodename = "";
        if (gltf.json.nodes)
            for (let j = 0; j < gltf.json.nodes.length; j++)
            {
                if (gltf.json.nodes[j].mesh == i)
                {
                    count++;
                    if (count == 1)
                    {
                        nodename = gltf.json.nodes[j].name;
                    }
                }
            }
        if (count > 1) html += (count) + " nodes (" + nodename + " ...)";
        else html += nodename;
        html += "</td>";

        // -------

        html += "<td>";
        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)
        {
            if (gltf.json.meshes[i].primitives[j].hasOwnProperty("material"))
            {
                if (gltf.json.materials[gltf.json.meshes[i]])
                {
                    html += gltf.json.materials[gltf.json.meshes[i].primitives[j].material].name + " ";
                }
            }
            else html += "None";
        }
        html += "</td>";

        html += "<td>";
        let numVerts = 0;
        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)
        {
            if (gltf.json.meshes[i].primitives[j].attributes.POSITION != undefined)
            {
                let v = parseInt(gltf.json.accessors[gltf.json.meshes[i].primitives[j].attributes.POSITION].count);
                numVerts += v;
                html += "" + v + "<br/>";
            }
            else html += "-<br/>";
        }

        if (gltf.json.meshes[i].primitives.length > 1)
            html += "=" + numVerts;
        html += "</td>";

        html += "<td>";
        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)
        {
            html += Object.keys(gltf.json.meshes[i].primitives[j].attributes);
            html += " <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeGeom('" + gltf.json.meshes[i].name + "'," + j + ")\" class=\"treebutton\">Geometry</a>";
            html += "<br/>";

            if (gltf.json.meshes[i].primitives[j].targets)
            {
                html += gltf.json.meshes[i].primitives[j].targets.length + " targets<br/>";

                if (gltf.json.meshes[i].extras && gltf.json.meshes[i].extras.targetNames)
                    html += "Targetnames:<br/>" + gltf.json.meshes[i].extras.targetNames.join("<br/>");

                html += "<br/>";
            }
        }

        html += "</td>";
        html += "</tr>";

        for (let j = 0; j < gltf.json.meshes[i].primitives.length; j++)
        {
            const accessor = gltf.json.accessors[gltf.json.meshes[i].primitives[j].indices];
            if (accessor)
            {
                let bufView = accessor.bufferView;

                if (sizeBufferViews.indexOf(bufView) == -1)
                {
                    sizeBufferViews.push(bufView);
                    if (gltf.json.bufferViews[bufView])sizes.meshes += gltf.json.bufferViews[bufView].byteLength;
                }
            }

            for (let k in gltf.json.meshes[i].primitives[j].attributes)
            {
                const attr = gltf.json.meshes[i].primitives[j].attributes[k];
                const bufView2 = gltf.json.accessors[attr].bufferView;

                if (sizeBufferViews.indexOf(bufView2) == -1)
                {
                    sizeBufferViews.push(bufView2);
                    if (gltf.json.bufferViews[bufView2])sizes.meshes += gltf.json.bufferViews[bufView2].byteLength;
                }
            }

            if (gltf.json.meshes[i].primitives[j].targets)
                for (let k = 0; k < gltf.json.meshes[i].primitives[j].targets.length; k++)
                {
                    for (let l in gltf.json.meshes[i].primitives[j].targets[k])
                    {
                        const accessorIdx = gltf.json.meshes[i].primitives[j].targets[k][l];
                        const accessor = gltf.json.accessors[accessorIdx];
                        const bufView2 = accessor.bufferView;
                        console.log("accessor", accessor);
                        if (sizeBufferViews.indexOf(bufView2) == -1)
                            if (gltf.json.bufferViews[bufView2])
                            {
                                sizeBufferViews.push(bufView2);
                                sizes.meshTargets += gltf.json.bufferViews[bufView2].byteLength;
                            }
                    }
                }
        }
    }
    html += "</table>";

    // / //////////////////////////////////

    let numSamplers = 0;
    let numAnims = 0;
    let numKeyframes = 0;

    if (gltf.json.animations)
    {
        numAnims = gltf.json.animations.length;
        for (let i = 0; i < gltf.json.animations.length; i++)
        {
            numSamplers += gltf.json.animations[i].samplers.length;
        }
    }

    html += "<div id=\"groupAnims\">Animations (" + numAnims + "/" + numSamplers + ")</div>";

    if (gltf.json.animations)
    {
        html += "<table id=\"sectionAnim\" class=\"table treetable\">";
        html += "<tr>";
        html += "  <th>Name</th>";
        html += "  <th>Target node</th>";
        html += "  <th>Path</th>";
        html += "  <th>Interpolation</th>";
        html += "  <th>Keys</th>";
        html += "</tr>";


        sizes.animations = 0;

        for (let i = 0; i < gltf.json.animations.length; i++)
        {
            for (let j = 0; j < gltf.json.animations[i].samplers.length; j++)
            {
                let bufView = gltf.json.accessors[gltf.json.animations[i].samplers[j].input].bufferView;
                if (sizeBufferViews.indexOf(bufView) == -1)
                {
                    sizeBufferViews.push(bufView);
                    sizes.animations += gltf.json.bufferViews[bufView].byteLength;
                }

                bufView = gltf.json.accessors[gltf.json.animations[i].samplers[j].output].bufferView;
                if (sizeBufferViews.indexOf(bufView) == -1)
                {
                    sizeBufferViews.push(bufView);
                    sizes.animations += gltf.json.bufferViews[bufView].byteLength;
                }
            }

            for (let j = 0; j < gltf.json.animations[i].channels.length; j++)
            {
                html += "<tr>";
                html += "  <td> Anim " + i + ": " + gltf.json.animations[i].name + "</td>";

                html += "  <td>" + gltf.nodes[gltf.json.animations[i].channels[j].target.node].name + "</td>";
                html += "  <td>";
                html += gltf.json.animations[i].channels[j].target.path + " ";
                html += "  </td>";

                const smplidx = gltf.json.animations[i].channels[j].sampler;
                const smplr = gltf.json.animations[i].samplers[smplidx];

                html += "  <td>" + smplr.interpolation + "</td>";

                html += "  <td>" + gltf.json.accessors[smplr.output].count;
                numKeyframes += gltf.json.accessors[smplr.output].count;

                // html += "&nbsp;&nbsp;<a onclick=\"gui.corePatch().getOpById('" + op.id + "').showAnim('" + i + "','" + j + "')\" class=\"icon icon-search\"></a>";

                html += "</td>";

                html += "</tr>";
            }
        }

        html += "<tr>";
        html += "  <td></td>";
        html += "  <td></td>";
        html += "  <td></td>";
        html += "  <td></td>";
        html += "  <td>" + numKeyframes + " total</td>";
        html += "</tr>";
        html += "</table>";
    }
    else
    {

    }

    // / ///////////////////

    let numImages = 0;
    if (gltf.json.images)numImages = gltf.json.images.length;
    html += "<div id=\"groupImages\">Images (" + numImages + ")</div>";

    if (gltf.json.images)
    {
        html += "<table id=\"sectionImages\" class=\"table treetable\">";

        html += "<tr>";
        html += "  <th>name</th>";
        html += "  <th>type</th>";
        html += "  <th>func</th>";
        html += "</tr>";

        sizes.images = 0;

        for (let i = 0; i < gltf.json.images.length; i++)
        {
            if (gltf.json.images[i].hasOwnProperty("bufferView"))
            {
                // if (sizeBufferViews.indexOf(gltf.json.images[i].hasOwnProperty("bufferView")) == -1)console.log("image bufferview already there?!");
                // else
                sizes.images += gltf.json.bufferViews[gltf.json.images[i].bufferView].byteLength;
            }
            else console.log("image has no bufferview?!");

            html += "<tr>";
            html += "<td>" + gltf.json.images[i].name + "</td>";
            html += "<td>" + gltf.json.images[i].mimeType + "</td>";
            html += "<td>";

            let name = gltf.json.images[i].name;
            if (name === undefined)name = gltf.json.images[i].bufferView;

            html += "<a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeTexture('" + name + "')\" class=\"treebutton\">Expose</a>";
            html += "</td>";

            html += "<tr>";
        }
        html += "</table>";
    }

    // / ///////////////////////

    let numCameras = 0;
    if (gltf.json.cameras)numCameras = gltf.json.cameras.length;
    html += "<div id=\"groupCameras\">Cameras (" + numCameras + ")</div>";

    if (gltf.json.cameras)
    {
        html += "<table id=\"sectionCameras\" class=\"table treetable\">";

        html += "<tr>";
        html += "  <th>name</th>";
        html += "  <th>type</th>";
        html += "  <th>info</th>";
        html += "</tr>";

        for (let i = 0; i < gltf.json.cameras.length; i++)
        {
            html += "<tr>";
            html += "<td>" + gltf.json.cameras[i].name + "</td>";
            html += "<td>" + gltf.json.cameras[i].type + "</td>";
            html += "<td>";

            if (gltf.json.cameras[i].perspective)
            {
                html += "yfov: " + Math.round(gltf.json.cameras[i].perspective.yfov * 100) / 100;
                html += ", ";
                html += "zfar: " + Math.round(gltf.json.cameras[i].perspective.zfar * 100) / 100;
                html += ", ";
                html += "znear: " + Math.round(gltf.json.cameras[i].perspective.znear * 100) / 100;
            }
            html += "</td>";

            html += "<tr>";
        }
        html += "</table>";
    }

    // / ////////////////////////////////////

    let numSkins = 0;
    if (gltf.json.skins)numSkins = gltf.json.skins.length;
    html += "<div id=\"groupSkins\">Skins (" + numSkins + ")</div>";

    if (gltf.json.skins)
    {
        // html += "<h3>Skins (" + gltf.json.skins.length + ")</h3>";
        html += "<table id=\"sectionSkins\" class=\"table treetable\">";

        html += "<tr>";
        html += "  <th>name</th>";
        html += "  <th></th>";
        html += "  <th>total joints</th>";
        html += "</tr>";

        for (let i = 0; i < gltf.json.skins.length; i++)
        {
            html += "<tr>";
            html += "<td>" + gltf.json.skins[i].name + "</td>";
            html += "<td>" + "</td>";
            html += "<td>" + gltf.json.skins[i].joints.length + "</td>";
            html += "<td>";
            html += "</td>";
            html += "<tr>";
        }
        html += "</table>";
    }

    // / ////////////////////////////////////

    if (gltf.timing)
    {
        html += "<div id=\"groupTiming\">Debug Loading Timing </div>";

        html += "<table id=\"sectionTiming\" class=\"table treetable\">";

        html += "<tr>";
        html += "  <th>task</th>";
        html += "  <th>time used</th>";
        html += "</tr>";

        let lt = 0;
        for (let i = 0; i < gltf.timing.length - 1; i++)
        {
            html += "<tr>";
            html += "  <td>" + gltf.timing[i][0] + "</td>";
            html += "  <td>" + (gltf.timing[i + 1][1] - gltf.timing[i][1]) + " ms</td>";
            html += "</tr>";
            // lt = gltf.timing[i][1];
        }
        html += "</table>";
    }

    // / //////////////////////////

    let sizeBin = 0;
    if (gltf.json.buffers)
        sizeBin = gltf.json.buffers[0].byteLength;

    html += "<div id=\"groupBinary\">File Size Allocation (" + Math.round(sizeBin / 1024) + "k )</div>";

    html += "<table id=\"sectionBinary\" class=\"table treetable\">";
    html += "<tr>";
    html += "  <th>name</th>";
    html += "  <th>size</th>";
    html += "  <th>%</th>";
    html += "</tr>";
    let sizeUnknown = sizeBin;
    for (let i in sizes)
    {
        // html+=i+':'+Math.round(sizes[i]/1024);
        html += "<tr>";
        html += "<td>" + i + "</td>";
        html += "<td>" + readableSize(sizes[i]) + " </td>";
        html += "<td>" + Math.round(sizes[i] / sizeBin * 100) + "% </td>";
        html += "<tr>";
        sizeUnknown -= sizes[i];
    }

    if (sizeUnknown != 0)
    {
        html += "<tr>";
        html += "<td>unknown</td>";
        html += "<td>" + readableSize(sizeUnknown) + " </td>";
        html += "<td>" + Math.round(sizeUnknown / sizeBin * 100) + "% </td>";
        html += "<tr>";
    }

    html += "</table>";
    html += "</div>";

    tab = new CABLES.UI.Tab("GLTF " + CABLES.basename(inFile.get()), { "icon": "cube", "infotext": "tab_gltf", "padding": true, "singleton": true });
    gui.mainTabs.addTab(tab, true);

    tab.addEventListener("close", closeTab);
    tab.html(html);

    CABLES.UI.Collapsable.setup(ele.byId("groupNodes"), ele.byId("sectionNodes"), false);
    CABLES.UI.Collapsable.setup(ele.byId("groupMaterials"), ele.byId("materialtable"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupAnims"), ele.byId("sectionAnim"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupMeshes"), ele.byId("meshestable"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupCameras"), ele.byId("sectionCameras"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupImages"), ele.byId("sectionImages"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupSkins"), ele.byId("sectionSkins"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupBinary"), ele.byId("sectionBinary"), true);
    CABLES.UI.Collapsable.setup(ele.byId("groupTiming"), ele.byId("sectionTiming"), true);

    gui.maintabPanel.show(true);
}

function readableSize(n)
{
    if (n > 1024) return Math.round(n / 1024) + " kb";
    if (n > 1024 * 500) return Math.round(n / 1024) + " mb";
    else return n + " bytes";
}
