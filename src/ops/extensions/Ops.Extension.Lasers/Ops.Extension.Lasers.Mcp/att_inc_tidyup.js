// tidy-up-ops: uses the layout of cables_ui (PatchView.getTidyUpPositions), plus the placement of new ops by link-ports

const CLEANUP_GRID_X = 12;
const CLEANUP_GRID_Y = 20;
const CLEANUP_GAP_X = 2 * CLEANUP_GRID_X;
const CLEANUP_GAP_Y = CLEANUP_GRID_Y;
const CLEANUP_MAX_SHIFT_STEPS = 400;

function snapNearest(v, grid)
{
    return Math.round(v / grid) * grid;
}

// incoming links of an op that come from ops in the set, in port order
function linksFromSet(op, set)
{
    const result = [];
    for (const portIn of op.portsIn)
        for (const link of portIn.links)
            if (set.has(link.portOut.op)) result.push({ "parent": link.portOut.op, "portOut": link.portOut, "portIn": portIn });
    return result;
}

// a path of ops in the set that follows output links from op back to op, or null if op is not part of a cycle
function cycleThrough(op, set)
{
    const visited = new Set();
    const path = [op];

    function walk(current)
    {
        for (const portOut of current.portsOut)
            for (const link of portOut.links)
            {
                const next = link.portIn.op;
                if (!set.has(next)) continue;
                if (next == op) return path.concat([op]);
                if (visited.has(next)) continue;
                visited.add(next);
                path.push(next);
                const found = walk(next);
                if (found) return found;
                path.pop();
            }
        return null;
    }

    return walk(op);
}

// moves rect to the nearest spot, in grid steps, where it is not too close to any placed rect. it can always move right and down,
// left and up only if allowed. returns false if there is no free spot within the search distance
function moveToNearestFreeSpot(rect, placed, allowLeft, allowUp)
{
    const startX = rect.x;
    const startY = rect.y;
    for (let distance = 0; distance <= CLEANUP_MAX_SHIFT_STEPS; distance++)
        for (let stepsY = 0; stepsY <= distance; stepsY++)
        {
            const stepsX = distance - stepsY;
            for (const dirX of stepsX ? [1, -1] : [1])
                for (const dirY of stepsY ? [1, -1] : [1])
                {
                    if ((dirX < 0 && !allowLeft) || (dirY < 0 && !allowUp)) continue;
                    rect.x = startX + dirX * stepsX * CLEANUP_GRID_X;
                    rect.y = startY + dirY * stepsY * CLEANUP_GRID_Y;
                    if (!placed.some((p) => rectsTooClose(rect, p))) return true;
                }
        }
    return false;
}

function rectsTooClose(a, b)
{
    return a.x < b.x + b.w + CLEANUP_GAP_X && b.x < a.x + a.w + CLEANUP_GAP_X && a.y < b.y + b.h + CLEANUP_GAP_Y && b.y < a.y + a.h + CLEANUP_GAP_Y;
}

function opRect(o, x = o.uiAttribs.translate.x, y = o.uiAttribs.translate.y)
{
    const glOp = gui.patchView.patchRenderer.getGlOp(o);
    return { "x": x, "y": y, "w": glOp.w, "h": glOp.h };
}

function portCenterX(op, port)
{
    return op.getPortPosX(port.name, null, true) || 0;
}

// new positions of the ops from the cables_ui layout, a map op -> { x, y, w, h }, or the reason as a string if there is no valid layout
function layoutOps(ops)
{
    return gui.patchView.getTidyUpPositions(ops);
}

// moves the ops to their new positions as one undo step, returns the number of moved ops
function applyOpPositions(pos)
{
    let moved = 0;
    const undoGroup = CABLES.UI.undo.startGroup();
    for (const [o, p] of pos)
    {
        if (o.uiAttribs.translate.x == p.x && o.uiAttribs.translate.y == p.y) continue;
        gui.patchView.setOpPos(o, p.x, p.y);
        moved++;
    }
    CABLES.UI.undo.endGroup(undoGroup, "Tidy up ops");
    return moved;
}

// ops added by add-op without x/y. link-ports places them next to the op they get linked to, then they count as placed
const unplacedOpIds = new Set();

// rects of the other ops in the subpatch of op that are shown in the patch editor, without the unplaced ops if skipUnplaced
function otherOpRects(op, skipUnplaced)
{
    const rects = [];
    for (const o of CABLES.patch.ops)
    {
        if (o == op || !o.uiAttribs.translate || (skipUnplaced && unplacedOpIds.has(o.id))) continue;
        if ((o.uiAttribs.subPatch || 0) != (op.uiAttribs.subPatch || 0)) continue;
        if (gui.patchView.patchRenderer.getGlOp(o)) rects.push(opRect(o));
    }
    return rects;
}

// moves rect left or right in grid steps to the nearest spot in its row where it is not too close to any placed rect
function moveToFreeSpotInRow(rect, placed)
{
    const startX = rect.x;
    for (let steps = 0; steps <= CLEANUP_MAX_SHIFT_STEPS; steps++)
        for (const dirX of steps ? [1, -1] : [1])
        {
            rect.x = startX + dirX * steps * CLEANUP_GRID_X;
            if (!placed.some((p) => rectsTooClose(rect, p))) return true;
        }
    rect.x = startX;
    return false;
}

// moves op to x/y snapped to the grid, or the nearest free spot from there: in the same row if keepRow, otherwise also further down. undoable
function placeOpUndoable(op, x, y, keepRow)
{
    const rect = opRect(op, snapNearest(x, CLEANUP_GRID_X), snapNearest(y, CLEANUP_GRID_Y));
    const placed = otherOpRects(op, true);
    if (!keepRow || !moveToFreeSpotInRow(rect, placed)) moveToNearestFreeSpot(rect, placed, true, false);
    gui.patchView.setOpPos(op, rect.x, rect.y);
}

// x of the op on one end of the link so the input port is right below the output port and the cable is straight
function straightLinkX(link, opToPlace)
{
    const opOut = link.portOut.op;
    const opIn = link.portIn.op;
    if (opToPlace == opIn) return opOut.uiAttribs.translate.x + portCenterX(opOut, link.portOut) - portCenterX(opIn, link.portIn);
    return opIn.uiAttribs.translate.x + portCenterX(opIn, link.portIn) - portCenterX(opOut, link.portOut);
}

// places an unplaced op of a new link: the input side below all placed ops linked to its inputs, the output side above the op it feeds.
// if both are unplaced the output side stays where it is and counts as placed. returns the placed op or null
function placeLinkedOp(link)
{
    const opOut = link.portOut.op;
    const opIn = link.portIn.op;

    if (unplacedOpIds.has(opIn.id))
    {
        unplacedOpIds.delete(opOut.id);
        let bottom = -Infinity;
        for (const l of linksFromSet(opIn, new Set(CABLES.patch.ops)))
        {
            if (unplacedOpIds.has(l.parent.id) || !l.parent.uiAttribs.translate) continue;
            bottom = Math.max(bottom, l.parent.uiAttribs.translate.y + opRect(l.parent).h);
        }
        placeOpUndoable(opIn, straightLinkX(link, opIn), bottom + CLEANUP_GAP_Y, false);
        unplacedOpIds.delete(opIn.id);
        return opIn;
    }

    if (unplacedOpIds.has(opOut.id))
    {
        const y = opIn.uiAttribs.translate.y - opRect(opOut).h - CLEANUP_GAP_Y;
        placeOpUndoable(opOut, straightLinkX(link, opOut), y, true);
        if (opOut.uiAttribs.translate.y + opRect(opOut).h + CLEANUP_GAP_Y > opIn.uiAttribs.translate.y)
            placeOpUndoable(opIn, opIn.uiAttribs.translate.x, opOut.uiAttribs.translate.y + opRect(opOut).h + CLEANUP_GAP_Y, false);
        unplacedOpIds.delete(opOut.id);
        return opOut;
    }
    return null;
}

// what an op draws in the patch field: its box (with extended title) and its comment text, if any
function opDrawnRects(o)
{
    const glOp = gui.patchView.patchRenderer.getGlOp(o);
    if (!glOp || !o.uiAttribs.translate) return [];

    const x = o.uiAttribs.translate.x;
    const y = o.uiAttribs.translate.y;
    const rects = [{ "op": o, "part": "op", "x": x, "y": y, "w": glOp.w, "h": glOp.h }];

    const comment = glOp._glComment;
    if (comment && comment.text) rects.push({ "op": o, "part": "comment", "x": x + comment.x, "y": y + comment.y, "w": comment.width, "h": comment.height });
    return rects;
}

function rectsOverlap(a, b)
{
    return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

// true if the straight line from x1,y1 to x2,y2 passes through the rect (liang-barsky clipping)
function lineHitsRect(x1, y1, x2, y2, r)
{
    let t0 = 0;
    let t1 = 1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const checks = [[-dx, x1 - r.x], [dx, r.x + r.w - x1], [-dy, y1 - r.y], [dy, r.y + r.h - y1]];
    for (const check of checks)
    {
        const p = check[0];
        const q = check[1];
        if (p == 0)
        {
            if (q < 0) return false;
            continue;
        }
        const t = q / p;
        if (p < 0) t0 = Math.max(t0, t);
        else t1 = Math.min(t1, t);
        if (t0 > t1) return false;
    }
    return true;
}

function layoutLabel(o)
{
    return o.id + " " + (o.uiAttribs.title || o.objName.split(".").pop());
}

// layout problems between the ops: overlapping boxes and comments, links going up, links running behind other ops
function layoutProblems(ops)
{
    const set = new Set(ops);
    const rects = [];
    for (const o of ops)
        for (const r of opDrawnRects(o)) rects.push(r);

    const overlaps = [];
    for (let i = 0; i < rects.length; i++)
        for (let j = i + 1; j < rects.length; j++)
        {
            const a = rects[i];
            const b = rects[j];
            if (a.op == b.op || !rectsOverlap(a, b)) continue;
            overlaps.push((a.part == "comment" ? "comment of " : "") + layoutLabel(a.op) + " overlaps " + (b.part == "comment" ? "the comment of " : "") + layoutLabel(b.op));
        }

    const upward = [];
    const behind = [];
    for (const o of ops)
        for (const portOut of o.portsOut)
            for (const link of portOut.links)
            {
                const opIn = link.portIn.op;
                if (!set.has(opIn) || !opIn.uiAttribs.translate) continue;
                const boxOut = opDrawnRects(o)[0];
                const boxIn = opDrawnRects(opIn)[0];
                if (!boxOut || !boxIn) continue;

                const name = layoutLabel(o) + "." + portOut.name + " -> " + layoutLabel(opIn) + "." + link.portIn.name;
                if (boxIn.y < boxOut.y + boxOut.h) upward.push(name);

                const x1 = boxOut.x + portCenterX(o, portOut);
                const y1 = boxOut.y + boxOut.h;
                const x2 = boxIn.x + portCenterX(opIn, link.portIn);
                const y2 = boxIn.y;
                for (const r of rects)
                    if (r.part == "op" && r.op != o && r.op != opIn && lineHitsRect(x1, y1, x2, y2, r)) behind.push(name + " runs behind " + layoutLabel(r.op));
            }

    return { "overlaps": overlaps, "upward": upward, "behind": behind };
}

// registers the tools of this file, called by buildMcpServer
function registerTidyUpTools(server)
{
    server.tool(
        "check-layout",
        "check the patch field layout as text instead of a screenshot: lists ops whose boxes or comments overlap, links going up (the input op is not below the output op) and links running behind other ops (approximated as straight lines). checks the ops of the current subpatch, or only opIds. fix problems with batch-move-ops or tidy-up-ops.", { "opIds": z.array(param.opId()).optional().describe("only check these ops, default all ops of the current subpatch") },
        ({ opIds }) =>
        {
            logMcp("check layout");

            let ops = visiblePatchOps();
            if (opIds)
            {
                ops = opIds.map((opId) => CABLES.patch.getOpById(opId));
                const missing = opIds.filter((opId, i) => !ops[i]);
                if (missing.length) return respondError("no op found with id " + missing.join(", "));
            }

            const problems = layoutProblems(ops);
            const lines = [];
            if (problems.overlaps.length) lines.push("overlaps:\n" + problems.overlaps.join("\n"));
            if (problems.upward.length) lines.push("links going up:\n" + problems.upward.join("\n"));
            if (problems.behind.length) lines.push("links behind ops:\n" + problems.behind.join("\n"));

            if (!lines.length) return respondText("checked " + ops.length + " ops: no overlaps, no links going up or behind ops");
            return respondText("checked " + ops.length + " ops\n" + lines.join("\n"));
        }
    );

    server.tool(
        "tidy-up-ops",
        "tidy up the layout of ops, call it after adding and linking several ops, passing all new op ids: arranges them in rows following their links (every op below all ops linked to its inputs), each op at the x of the op above until the links split, split children side by side in port order. ops never overlap. unselected ops are never moved, the selected ops are placed around them; a selected op whose linked ops above are all unselected keeps its position. links may cross. snapped to the grid. works on the selected ops, or on opIds; all have to be in the current subpatch. undoable as one step. if no valid layout is found (link cycle, no free place) nothing is changed and the reason is returned.", { "opIds": z.array(param.opId()).optional().describe("ids of the ops to arrange, usually all ops you just added; without it the selected ops are used"), "dryRun": z.boolean().optional().describe("only report the new positions, do not move anything") },
        ({ opIds, dryRun }) =>
        {
            logMcp("tidy up ops");

            let ops = gui.patchView.getSelectedOps();
            if (opIds)
            {
                ops = opIds.map((opId) => CABLES.patch.getOpById(opId));
                const missing = opIds.filter((opId, i) => !ops[i]);
                if (missing.length) return respondError("no op found with id " + missing.join(", "));
            }
            if (!ops.length) ops = visiblePatchOps();

            const sub = gui.patchView.getCurrentSubPatch();
            const outside = ops.filter((o) => (o.uiAttribs.subPatch || 0) != sub || !o.uiAttribs.translate || !gui.patchView.patchRenderer.getGlOp(o));
            if (outside.length) return respondError("ops not in the current subpatch: " + outside.map((o) => o.id).join(", "));

            const pos = layoutOps(ops);
            if (typeof pos == "string") return respondError("nothing changed: " + pos);

            if (dryRun) return respondText([...pos].map(([o, p]) => o.id + " " + p.x + "," + p.y).join("\n"));

            const moved = applyOpPositions(pos);
            for (const o of ops) unplacedOpIds.delete(o.id);
            fitPatchView(ops);
            return respondText(JSON.stringify({ "ops": ops.length, "moved": moved, "rows": new Set([...pos.values()].map((p) => p.y)).size }));
        }
    );
}
