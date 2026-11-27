// loading patch json from the cables server (example patches), upgrading/downgrading ops, clearing the patch

const nodeBuffer = op.require("node:buffer");
const PATCH_SERVER_URL = "https://cables.gl";
const PATCH_ASSET_SERVER_URL = "https://devsandbox.cables.gl/";
const ASSETS_PATH = "/assets/";
const DOWNLOAD_MAX_REDIRECTS = 5;
const PASTE_TIMEOUT_MS = 60000;
const PASTE_GAP_X = 300;
const REPLACE_OP_TIMEOUT_MS = 15000;
const REPLACE_OP_POLL_MS = 50;

// downloads a url with node (no cors restrictions) and resolves with its content as text, the web editor has no node and uses fetch
function downloadText(url, redirectsLeft = DOWNLOAD_MAX_REDIRECTS)
{
    if (!isStandalone) return fetch(url).then((res) =>
    {
        if (!res.ok) throw new Error("download failed: " + res.status + " " + url);
        return res.text();
    });

    return new Promise((resolve, reject) =>
    {
        https.get(url, (res) =>
        {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0)
            {
                res.resume();
                resolve(downloadText(new URL(res.headers.location, url).href, redirectsLeft - 1));
                return;
            }
            if (res.statusCode != 200)
            {
                res.resume();
                reject(new Error("download failed: " + res.statusCode + " " + url));
                return;
            }
            const chunks = [];
            res.on("data", (chunk) => { chunks.push(chunk); });
            res.on("end", () => { resolve(nodeBuffer.Buffer.concat(chunks).toString("utf-8")); });
            res.on("error", reject);
        }).on("error", reject);
    });
}

// accepts a patch id/short id or a patch url like https://cables.gl/p/<id> or /edit/<id>
function parsePatchId(str)
{
    const match = str.match(/\/(?:p|edit|view|api\/project)\/([^/?#]+)/);
    if (match) return match[1];
    return str.trim();
}

// points all file/url ports of a patch at the asset server (/assets/... and assets/... become <assetServer>/assets/...), so its files load without being downloaded first. returns the number of rewritten port values
function rewritePatchAssetUrls(project, assetServer)
{
    const prefix = assetServer.endsWith("/") ? assetServer : assetServer + "/";
    let count = 0;

    for (let i = 0; i < project.ops.length; i++)
    {
        const portsIn = project.ops[i].portsIn || [];
        for (let j = 0; j < portsIn.length; j++)
        {
            const value = portsIn[j].value;
            if (typeof value != "string") continue;

            let path = null;
            if (value.startsWith(ASSETS_PATH)) path = value.substring(1);
            else if (value.startsWith(ASSETS_PATH.substring(1))) path = value;
            if (path === null) continue;

            portsIn[j].value = prefix + path;
            count++;
        }
    }
    return count;
}

// adds the ops of a serialized patch to the current subpatch the same way pasting does: loads op dependencies, gives the ops new ids, adds one undo step
function pasteProject(project, x, y)
{
    return new Promise((resolve) =>
    {
        const str = JSON.stringify(project);
        const pasteEvent = {
            "clipboardData": { "types": ["text/plain"], "getData": () => str },
            "preventDefault": () => {}
        };
        gui.patchView.clipboardPaste(pasteEvent, gui.patchView.getCurrentSubPatch(), x, y, (ops) => { resolve(ops || []); });
    });
}

// the example patch id of an op, or of its newest older version that has one
function findExamplePatch(opDoc)
{
    if (opDoc.exampleProjectId) return { "opName": opDoc.name, "patchId": opDoc.exampleProjectId };

    const versions = opDoc.versions || [];
    let index = -1;
    for (let i = 0; i < versions.length; i++)
        if (versions[i].name == opDoc.name) index = i;

    for (let i = index - 1; i >= 0; i--)
    {
        const olderDoc = gui.opDocs.getOpDocByName(versions[i].name);
        if (olderDoc && olderDoc.exampleProjectId) return { "opName": olderDoc.name, "patchId": olderDoc.exampleProjectId };
    }
    return null;
}

// downloads a patch json from the server and adds its ops to the current subpatch, returns the tool response
async function loadPatchJson(patchId, { clear, x, y, server, assetServer }, note)
{
    const url = (server || PATCH_SERVER_URL) + "/api/project/" + encodeURIComponent(patchId) + "/patch.json";

    let patch;
    try
    {
        patch = JSON.parse(await downloadText(url));
    }
    catch (e)
    {
        return respondError("could not load patch " + patchId + " from " + url + ": " + e.message);
    }
    if (!patch || !patch.ops) return respondError("no ops in patch " + patchId + " (" + url + ")");

    const numAssetUrls = rewritePatchAssetUrls(patch, assetServer || PATCH_ASSET_SERVER_URL);

    let numDeleted = 0;
    if (clear) numDeleted = clearPatchKeepMcp();

    const pos = freePastePosition();
    const numOps = patch.ops.length;
    const pastedOps = await withTimeout(pasteProject({ "ops": patch.ops }, x === undefined ? pos.x : x, y === undefined ? pos.y : y), PASTE_TIMEOUT_MS, "paste");

    const lines = ["loaded \"" + patch.name + "\" (" + patchId + "): added " + pastedOps.length + " of " + numOps + " ops"];
    if (note) lines.push(note);
    if (pastedOps.length < numOps) lines.push((numOps - pastedOps.length) + " ops are not available locally and were left out");
    if (numDeleted) lines.push("deleted " + numDeleted + " ops before");
    if (numAssetUrls) lines.push("pointed " + numAssetUrls + " file ports at " + (assetServer || PATCH_ASSET_SERVER_URL));
    return respondText(lines.join("\n"));
}

// the newest version of an outdated op, null when it is the newest
function getNewestVersionName(o)
{
    const opDoc = gui.opDocs.getOpDocById(o.opId);
    if (opDoc && opDoc.oldVersion && opDoc.newestVersion && opDoc.newestVersion.name) return opDoc.newestVersion.name;
    return null;
}

// the version before an op, null when it is the first one
function getPreviousVersionName(o)
{
    const opDoc = gui.opDocs.getOpDocByName(o.objName);
    if (!opDoc || !opDoc.versions) return null;

    let previous = null;
    for (let i = 0; i < opDoc.versions.length; i++)
    {
        if (opDoc.versions[i].name == o.objName) return previous;
        previous = opDoc.versions[i].name;
    }
    return null;
}

// replaces an op with another version like the upgrade/downgrade commands do: copies port values, links and position.
// resolves with the new op and the names of linked ports the new version does not have (their links are lost)
function replaceOpVersion(o, newName)
{
    const linkedPorts = [];
    const ports = o.portsIn.concat(o.portsOut);
    for (let i = 0; i < ports.length; i++)
        if (ports[i].links.length) linkedPorts.push(ports[i].name);

    const before = new Set();
    for (let i = 0; i < CABLES.patch.ops.length; i++) before.add(CABLES.patch.ops[i].id);

    const oldId = o.id;
    gui.patchView.replaceOp(oldId, newName);

    // replaceOp only calls back after switching subpatches, so wait until the old op is gone and the new one is there
    return new Promise((resolve) =>
    {
        const check = () =>
        {
            let newOp = null;
            for (let i = 0; i < CABLES.patch.ops.length; i++)
                if (!before.has(CABLES.patch.ops[i].id) && CABLES.patch.ops[i].objName == newName) newOp = CABLES.patch.ops[i];

            if (!newOp || CABLES.patch.getOpById(oldId))
            {
                setTimeout(check, REPLACE_OP_POLL_MS);
                return;
            }

            const lostLinks = [];
            for (let i = 0; i < linkedPorts.length; i++)
                if (!newOp.getPort(linkedPorts[i])) lostLinks.push(linkedPorts[i]);

            resolve({ "newOp": newOp, "lostLinks": lostLinks });
        };
        check();
    });
}

// upgrades/downgrades ops one after another, getTargetName returns the version to replace an op with, or null to skip it
async function replaceOpVersions(opIds, getTargetName, skipReason, action)
{
    const lines = [];
    for (let i = 0; i < opIds.length; i++)
    {
        const o = CABLES.patch.getOpById(opIds[i]);
        if (!o)
        {
            lines.push(opIds[i] + ": no op found with this id");
            continue;
        }

        const targetName = getTargetName(o);
        if (!targetName)
        {
            lines.push(opIds[i] + " " + o.objName + ": " + skipReason);
            continue;
        }

        logMcp(action + " to " + targetName);
        try
        {
            const result = await withTimeout(replaceOpVersion(o, targetName), REPLACE_OP_TIMEOUT_MS, "replace op");
            let line = opIds[i] + " " + o.objName + " -> " + targetName + (result.newOp ? ", new id " + result.newOp.id : ", new op not found");
            if (result.lostLinks.length) line += ", lost links of ports missing in the new version: " + result.lostLinks.join(", ");
            lines.push(line);
        }
        catch (e)
        {
            lines.push(opIds[i] + " " + o.objName + ": could not replace: " + e.message);
        }
    }
    return lines.join("\n");
}

// ids of this mcp server op and the ops linked to it, e.g. its logger
function mcpBranchOpIds()
{
    const ids = new Set([op.id]);
    for (let i = 0; i < op.portsOut.length; i++)
        for (let j = 0; j < op.portsOut[i].links.length; j++) ids.add(op.portsOut[i].links[j].getOtherPort(op.portsOut[i]).op.id);
    return ids;
}

// deletes all ops except this mcp server op and the ops linked to it
function clearPatchKeepMcp()
{
    const keep = mcpBranchOpIds();

    const ids = [];
    for (let i = 0; i < CABLES.patch.ops.length; i++)
        if (!keep.has(CABLES.patch.ops[i].id)) ids.push(CABLES.patch.ops[i].id);

    for (let i = 0; i < ids.length; i++) CABLES.patch.deleteOp(ids[i]);
    return ids.length;
}

// patch coordinates right of all ops in the current subpatch, so pasted ops do not overlap
function freePastePosition()
{
    const sub = gui.patchView.getCurrentSubPatch();
    let maxX = null;
    let minY = null;
    for (let i = 0; i < CABLES.patch.ops.length; i++)
    {
        const o = CABLES.patch.ops[i];
        if (!o.uiAttribs.translate || o.uiAttribs.subPatch != sub) continue;
        maxX = maxX === null ? o.uiAttribs.translate.x : Math.max(maxX, o.uiAttribs.translate.x);
        minY = minY === null ? o.uiAttribs.translate.y : Math.min(minY, o.uiAttribs.translate.y);
    }
    if (maxX === null) return { "x": 0, "y": 0 };
    return { "x": maxX + PASTE_GAP_X, "y": minY };
}

// registers the tools of this file, called by buildMcpServer
function registerPatchJsonTools(server)
{
    const loadPatchParams = {
        "clear": z.boolean().optional().describe("delete the current ops first"),
        "x": z.number().optional().describe("patch x position to paste at"),
        "y": z.number().optional().describe("patch y position to paste at"),
        "server": z.string().optional().describe("cables server url, default the live server"),
        "assetServer": z.string().optional().describe("server to load the patch assets from")
    };
    const loadPatchDescription = "file ports pointing at /assets/... (project and library files) are rewritten to load from https://devsandbox.cables.gl/assets/... (assetServer changes that url). clear=true deletes all ops first, except the mcp server op and the ops linked to it. x/y place the ops, by default right of the existing ops. undoable. ops that are not available locally (e.g. user or patch ops) are left out and reported.";

    server.tool(
        "load-patch-json",
        "download a public patch from the live cables server and add its ops to the current subpatch, like pasting them. project is the patch id, short id or url (https://cables.gl/p/<id>). " + loadPatchDescription, { "project": z.string().describe("patch id, short id or url like https://cables.gl/p/<id>"), ...loadPatchParams },
        async (params) =>
        {
            const patchId = parsePatchId(params.project);
            logMcp("load patch json " + patchId);
            return loadPatchJson(patchId, params, "");
        }
    );

    server.tool(
        "load-example-patch",
        "load the example patch of an op by its full op name (e.g. Ops.Gl.Texture_v3) from the live cables server and add its ops to the current subpatch, like pasting them. if the op has no example patch, the example of its newest older version that has one is used. " + loadPatchDescription, { "opname": param.opName(), ...loadPatchParams },
        async (params) =>
        {
            logMcp("example " + params.opname);

            const opDoc = await loadOpDoc(params.opname);
            if (!opDoc) return respondError("no op found with name " + params.opname);

            const example = findExamplePatch(opDoc);
            if (!example) return respondError(params.opname + " and its older versions have no example patch");

            let note = "example patch of " + example.opName;
            if (example.opName != params.opname) note += ", " + params.opname + " has no example patch of its own";
            return loadPatchJson(example.patchId, params, note);
        }
    );

    server.tool(
        "upgrade-ops",
        "replace ops with the newest version of their op, the same as the editor's \"Upgrade selected ops\" command: port values, links and position are copied, the op gets a new id. opIds are op ids in the current patch, all=true upgrades every outdated op in the patch instead. ops that are already the newest version are skipped. reports links that are lost because the new version does not have that port.", { "opIds": z.array(param.opId()).optional().describe("ids of the ops to upgrade"), "all": z.boolean().optional().describe("upgrade every outdated op in the patch instead of opIds") },
        async ({ opIds, all }) =>
        {
            let ids = opIds || [];
            if (all)
            {
                ids = [];
                for (let i = 0; i < CABLES.patch.ops.length; i++)
                    if (getNewestVersionName(CABLES.patch.ops[i])) ids.push(CABLES.patch.ops[i].id);
            }
            if (!ids.length) return respondText(all ? "no outdated ops in the patch" : "pass opIds or all=true");

            return respondText(await replaceOpVersions(ids, getNewestVersionName, "already the newest version", "upgrade"));
        }
    );

    server.tool(
        "downgrade-ops",
        "replace ops with the previous version of their op (e.g. Ops.Gl.Texture_v3 -> Ops.Gl.Texture_v2), the same as the editor's \"Downgrade selected op\" command: port values, links and position are copied, the op gets a new id. ops without a previous version are skipped. reports links that are lost because the old version does not have that port.", { "opIds": z.array(param.opId()).describe("ids of the ops to downgrade") },
        async ({ opIds }) =>
        {
            return respondText(await replaceOpVersions(opIds, getPreviousVersionName, "has no previous version", "downgrade"));
        }
    );

    server.tool(
        "clear-patch",
        "delete all ops of the patch (in all subpatches) except this mcp server op and the ops linked to it, e.g. its logger. returns the number of deleted ops.", {},
        () =>
        {
            logMcp("clear patch");
            return respondText("deleted " + clearPatchKeepMcp() + " ops");
        }
    );
}
