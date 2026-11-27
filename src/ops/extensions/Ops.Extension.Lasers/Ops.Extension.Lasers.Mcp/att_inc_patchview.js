// scrolling/zooming the patch field

const PATCHFIELD_FRAME_TIMEOUT_MS = 3000;
const PATCHFIELD_FIT_PADDING = 1.1;
const PATCHFIELD_FIT_MIN_SIZE = 250;

// size of the patch field in css pixels, the unit of screen coordinates in the viewbox
function patchFieldSize()
{
    const canvas = gui.patchView.patchRenderer.cgl.canvas;
    return { "w": canvas.clientWidth, "h": canvas.clientHeight };
}

// the ops of the subpatch currently shown in the patch field
function visiblePatchOps()
{
    const sub = gui.patchView.getCurrentSubPatch();
    return CABLES.patch.ops.filter((o) => (o.uiAttribs.subPatch || 0) == sub && !o.uiAttribs.hidden);
}

// viewbox zoom is half the visible width in patch units; scroll y is stored scaled by the aspect ratio
function setPatchView(x, y, zoom)
{
    const viewBox = gui.patchView.patchRenderer.viewBox;
    const size = patchFieldSize();

    if (zoom) viewBox.animateZoom(zoom);
    // as user interaction, otherwise the view is shifted to the part of the field not covered by panels, and x/y would not end up in the center
    if (x !== undefined && y !== undefined) viewBox.animateScrollTo(x, y * size.w / size.h, undefined, true);
}

function fitPatchView(ops)
{
    const bounds = gui.patchView.getOpBounds(ops);
    const size = patchFieldSize();

    const w = Math.max(bounds.size[0], PATCHFIELD_FIT_MIN_SIZE);
    const h = Math.max(bounds.size[1], PATCHFIELD_FIT_MIN_SIZE);
    const zoom = Math.max(w, h * size.w / size.h) / 2 * PATCHFIELD_FIT_PADDING;

    setPatchView(bounds.center[0], bounds.center[1], zoom);
}

// the visible area of the patch field in patch coordinates, as used by op positions (move-op / uiAttribs.translate)
function patchViewInfo()
{
    const glPatch = gui.patchView.patchRenderer;
    const size = patchFieldSize();
    const topLeft = glPatch.screenToPatchCoord(0, 0);
    const bottomRight = glPatch.screenToPatchCoord(size.w, size.h);
    const round = (v) => Math.round(v);

    return {
        "zoom": round(glPatch.viewBox.zoom),
        "subPatch": gui.patchView.getCurrentSubPatch(),
        "visible": { "x1": round(topLeft[0]), "y1": round(topLeft[1]), "x2": round(bottomRight[0]), "y2": round(bottomRight[1]) },
        "center": { "x": round((topLeft[0] + bottomRight[0]) / 2), "y": round((topLeft[1] + bottomRight[1]) / 2) },
        "fieldSize": size
    };
}

// registers the tools of this file, called by buildMcpServer
function registerPatchViewTools(server)
{
    server.tool(
        "patch-view",
        "scroll/zoom the patch field (the editor's op graph, not the rendering canvas). fit=true zooms to show all ops of the current subpatch, opIds fits the view to those ops, x/y center the view on a patch coordinate (the same coordinates as op positions), zoom is half the visible width in patch units (bigger = further out). without arguments it only reports the current view. returns the visible area in patch coordinates. take a look with patch-field-screenshot.", { "fit": z.boolean().optional().describe("zoom to show all ops of the current subpatch"), "opIds": z.array(param.opId()).optional().describe("fit the view to these ops"), "x": z.number().optional().describe("patch x coordinate to center on"), "y": z.number().optional().describe("patch y coordinate to center on"), "zoom": z.number().optional().describe("half the visible width in patch units, bigger = further out") },
        async ({ fit, opIds, x, y, zoom }) =>
        {
            logMcp("patch view");

            if (opIds)
            {
                const ops = opIds.map((opId) => CABLES.patch.getOpById(opId));
                const missing = opIds.filter((opId, i) => !ops[i]);
                if (missing.length) return respondError("no op found with id " + missing.join(", "));
                fitPatchView(ops);
            }
            else if (fit)
            {
                const ops = visiblePatchOps();
                if (!ops.length) return respondError("no ops in the current subpatch");
                fitPatchView(ops);
            }
            else if ((x === undefined) != (y === undefined)) return respondError("pass both x and y");
            else setPatchView(x, y, zoom);

            // view changes are animated, report the view once they are done
            await new Promise((resolve) => { setTimeout(resolve, PATCHFIELD_VIEW_ANIM_MS); });
            return respondText(JSON.stringify(patchViewInfo()));
        }
    );

    server.tool(
        "focus-op",
        "scroll/zoom the patch editor view to center on an op and open its param panel, so the person looking at the editor can see it. switches into the op's subpatch first if needed. does not affect rendering.", { "opId": param.opId() },
        ({ opId }) =>
        {
            logMcp("focus " + opLabel(opId));

            const targetOp = CABLES.patch.getOpById(opId);
            if (!targetOp) return respondError("no op found with id " + opId);

            if (!CABLES.UI || !gui.patchView || !gui.patchView.patchRenderer || !gui.patchView.patchRenderer.focusOp) return respondError("no patch editor UI available to focus on");

            const subPatch = targetOp.uiAttribs.subPatch || "0";
            if (subPatch == gui.patchView.getCurrentSubPatch())
            {
                gui.patchView.patchRenderer.focusOp(opId);
                return respondText("focused " + opId + " (" + targetOp.objName + ") in the patch editor");
            }

            return new Promise((resolve) =>
            {
                gui.patchView.setCurrentSubPatch(subPatch, () =>
                {
                    gui.patchView.patchRenderer.focusOp(opId);
                    resolve(respondText("switched to subpatch " + subPatch + " and focused " + opId + " (" + targetOp.objName + ")"));
                });
            });
        }
    );

    server.tool(
        "select-op",
        "select ops in the patch editor, like clicking them. commands from run-command act on the selected ops. opIds is a list of op ids, add true keeps the current selection, otherwise it is cleared first.", { "opIds": z.array(param.opId()).describe("ids of the ops to select"), "add": z.boolean().optional().describe("keep the current selection instead of clearing it first") },
        ({ opIds, add }) =>
        {
            logMcp("select " + opIds.map((opId) => { return opLabel(opId); }).join(", "));

            if (!CABLES.UI || !gui.patchView) return respondError("no patch editor UI available to select in");

            const missing = opIds.filter((opId) => { return !CABLES.patch.getOpById(opId); });
            if (missing.length > 0) return respondError("no op found with id " + missing.join(", "));

            if (!add) gui.patchView.unselectAllOps();
            opIds.forEach((opId) => { gui.patchView.selectOpId(opId); });

            const selected = gui.patchView.getSelectedOps().map((selOp) => { return selOp.id + " (" + selOp.objName + ")"; });
            return respondText("selected: " + selected.join(", "));
        }
    );

    server.tool(
        "bookmark-op",
        "bookmark an op in the patch editor (like the bookmark button in its param panel) so it shows up in the bookmarks list and the command palette. bookmarked false removes the bookmark, default true. bookmarks are stored with the patch, save it afterwards.", { "opId": param.opId(), "bookmarked": z.boolean().optional().describe("false removes the bookmark, default true") },
        ({ opId, bookmarked }) =>
        {
            const wanted = bookmarked !== false;
            logMcp((wanted ? "bookmark " : "unbookmark ") + opLabel(opId));

            const targetOp = CABLES.patch.getOpById(opId);
            if (!targetOp) return respondError("no op found with id " + opId);
            if (!CABLES.UI || !gui.bookmarks) return respondError("no patch editor UI available for bookmarks");

            const isBookmarked = gui.bookmarks.hasBookmarkWithId(opId);
            if (wanted && !isBookmarked) gui.bookmarks.add(opId);
            if (!wanted && isBookmarked) gui.bookmarks.remove(opId);

            const state = gui.bookmarks.hasBookmarkWithId(opId) ? "bookmarked" : "not bookmarked";
            return respondText(opId + " (" + targetOp.objName + ") is " + state);
        }
    );

    server.tool(
        "move-op",
        "reposition an existing op in the patch editor view (does not affect rendering, purely cosmetic layout); identify the op by its id and give its new x/y editor coordinates. only use it when the user asks to move an op; new ops are placed by link-ports, and tidy-up-ops arranges several.", { "opId": param.opId(), "x": z.number().describe("new patch x coordinate"), "y": z.number().describe("new patch y coordinate") },
        ({ opId, x, y }) =>
        {
            logMcp("move " + opLabel(opId) + " to " + x + "," + y);

            const targetOp = CABLES.patch.getOpById(opId);
            if (!targetOp) return respondError("no op found with id " + opId);

            const old = targetOp.uiAttribs.translate || { "x": 0, "y": 0 };
            const oldX = old.x,
                oldY = old.y;
            const moveTo = (px, py) => { gui.patchView.patchRenderer.patchAPI.setOpUiAttribs(opId, "translate", { "x": px, "y": py }); };

            moveTo(x, y);
            unplacedOpIds.delete(opId);
            CABLES.UI.undo.add(
            {
                "title": "Move op",
                "undo": () => { moveTo(oldX, oldY); },
                "redo": () => { moveTo(x, y); }
            });

            return respondText("moved " + opId + " to " + x + "," + y);
        }
    );
}
