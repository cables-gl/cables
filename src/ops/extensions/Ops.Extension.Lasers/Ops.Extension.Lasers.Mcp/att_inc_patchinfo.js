// patch errors and the compact patch overview

// collects ui errors (op.uiAttribs.uierrors, set via setUiError in core_extend_op.js) of all ops,
// plus editor diagnostics of ports (e.g. shader compile errors with line numbers).
// level: 0 hint, 1 warning, 2 error
function getPatchErrors(minLevel, opId)
{
    const result = [];
    const ops = CABLES.patch.ops;

    for (let i = 0; i < ops.length; i++)
    {
        const o = ops[i];
        if (opId && o.id != opId) continue;

        const errors = [];
        const uiErrors = o.uiAttribs.uierrors || [];
        for (let j = 0; j < uiErrors.length; j++)
            if (uiErrors[j].level >= minLevel)
                errors.push({ "id": uiErrors[j].id, "level": uiErrors[j].level, "txt": uiErrors[j].txt });

        // diagnostics can be stale after an error was fixed, only trust them while the op still has an error
        const diagnostics = [];
        const ports = uiErrors.length ? o.portsIn.concat(o.portsOut) : [];
        for (let j = 0; j < ports.length; j++)
        {
            const diags = ports[j].uiAttribs.editorDiagnostics;
            if (!diags || !diags.length) continue;

            // diagnostics line numbers refer to the port's value (e.g. the final generated shader code)
            const codeLines = typeof ports[j].get() == "string" ? ports[j].get().split("\n") : [];
            for (let k = 0; k < diags.length; k++)
            {
                const d = { "port": ports[j].name, "line": diags[k].line, "message": diags[k].message };
                if (diags[k].line > 0 && codeLines[diags[k].line - 1] !== undefined) d.code = codeLines[diags[k].line - 1].trim();
                diagnostics.push(d);
            }
        }

        if (!errors.length && !diagnostics.length) continue;

        const entry = { "opId": o.id, "objName": o.objName, "title": o.getTitle(), "errors": errors };
        if (o.uiAttribs.subPatch && o.uiAttribs.subPatch != "0") entry.subPatch = o.uiAttribs.subPatch;
        if (diagnostics.length) entry.diagnostics = diagnostics;
        result.push(entry);
    }
    return result;
}

function linkLabel(port)
{
    return port.op.id + "." + port.name;
}

function isPlainValuePort(port)
{
    const type = port.getType();
    return type == CABLES.Port.TYPE_VALUE || type == CABLES.Port.TYPE_STRING;
}

function changedPortValues(o)
{
    const values = [];
    for (let i = 0; i < o.portsIn.length; i++)
    {
        const p = o.portsIn[i];
        if (!isPlainValuePort(p) || p.links.length > 0 || p.get() === p.defaultValue) continue;
        values.push(p.name + "=" + JSON.stringify(p.get()));
    }
    return values;
}

function patchOverviewLines(subPatch, filter, withValues)
{
    const lines = [];
    const lowerFilter = (filter || "").toLowerCase();
    const ops = CABLES.patch.ops;

    for (let i = 0; i < ops.length; i++)
    {
        const o = ops[i];
        const opSubPatch = o.uiAttribs.subPatch || "0";
        if (subPatch !== undefined && opSubPatch != subPatch) continue;
        if (lowerFilter && (o.objName + " " + o.getTitle()).toLowerCase().indexOf(lowerFilter) == -1) continue;

        let head = o.id + " " + o.objName;
        if (o.getTitle() != o.objName.split(".").pop()) head += " \"" + o.getTitle() + "\"";
        if (o.uiAttribs.extendTitle) head += " (" + o.uiAttribs.extendTitle + ")";
        if (o.uiAttribs.disabled) head += " [disabled]";
        if (opSubPatch != "0") head += " sub:" + opSubPatch;
        lines.push(head);

        const incoming = [];
        for (let j = 0; j < o.portsIn.length; j++)
            for (let k = 0; k < o.portsIn[j].links.length; k++)
                incoming.push(o.portsIn[j].name + ": " + linkLabel(o.portsIn[j].links[k].portOut));

        const outgoing = [];
        for (let j = 0; j < o.portsOut.length; j++)
            for (let k = 0; k < o.portsOut[j].links.length; k++)
                outgoing.push(o.portsOut[j].name + ": " + linkLabel(o.portsOut[j].links[k].portIn));

        if (incoming.length) lines.push("  <- " + incoming.join(", "));
        if (outgoing.length) lines.push("  -> " + outgoing.join(", "));

        if (withValues)
        {
            const values = changedPortValues(o);
            if (values.length) lines.push("  = " + values.join(", "));
        }
    }
    return lines;
}

// returns current patch op instances whose documented op is explicitly unreleased
async function getUnreleasedPatchOps()
{
    const result = [];
    const seen = new Set();
    const releaseStatusByName = new Map();
    for (const patchOp of CABLES.patch.ops)
    {
        if (seen.has(patchOp.id)) continue;
        seen.add(patchOp.id);

        const objName = patchOp.objName;
        if (!objName || (!objName.startsWith("Ops.") || objName.startsWith("Ops.Local."))) continue;

        if (!releaseStatusByName.has(objName))
        {
            const opDoc = await loadOpDoc(objName);
            releaseStatusByName.set(objName, !!opDoc && opDoc.isReleased === false);
        }
        if (!releaseStatusByName.get(objName)) continue;

        result.push(patchOp.id);
    }
    return result;
}

// registers the tools of this file, called by buildMcpServer
function registerPatchInfoTools(server)
{
    server.tool(
        "get-unreleased-op-ids",
        "list the op instance ids in the current patch whose documented ops are unreleased. returns only a compact JSON array of ids; use get-patch-overview for names or subpatch details.", {},
        async () =>
        {
            logMcp("find unreleased ops");
            const unreleased = await getUnreleasedPatchOps();
            return respondText(JSON.stringify(unreleased));
        }
    );

    server.tool(
        "get-patch-overview",
        "compact overview of the current patch, much smaller than cables://patch.json: one line per op with its id, full op name (objName), title and subpatch, followed by its incoming (<-) and outgoing (->) links as port: opId.port. no port values unless values=true, then only the values that differ from the op's defaults (linked ports left out). optional subPatch limits it to one subpatch, filter to ops whose name or title contains the text. use get-patch-op for all values of a single op. start here to find op ids.", { "subPatch": z.string().optional().describe("only list ops of this subpatch id"), "filter": z.string().optional().describe("only list ops whose op name or title contains this text"), "values": z.boolean().optional().describe("also list port values that differ from the defaults") },
        ({ subPatch, filter, values }) =>
        {
            logMcp("patch overview" + (filter ? " \"" + filter + "\"" : ""));

            const lines = patchOverviewLines(subPatch, filter, values);
            return respondText(lines.length ? lines.join("\n") : "no ops found");
        }
    );

    server.tool(
        "get-patch-errors",
        "check the current patch for errors: lists ops that show ui errors/warnings (e.g. shader compile errors, missing links, wrong input types) with their messages, plus code diagnostics (line, message, code) where available. minLevel filters by severity: 0 hint, 1 warning, 2 error (default 1). optional opId checks a single op. use it after changing shader code or port values.", { "minLevel": z.number().optional().describe("lowest severity to list: 0 hint, 1 warning, 2 error; default 1"), "opId": param.opId().optional().describe("only check this op") },
        async ({ minLevel, opId }) =>
        {
            logMcp("check patch errors" + (opId ? " of " + opLabel(opId) : ""));

            if (opId && !CABLES.patch.getOpById(opId)) return respondError("no op found with id " + opId);

            // shaders recompile while rendering, so errors of the last change only show up after the next rendered frame
            await waitForRenderedFrame();

            const errors = getPatchErrors(minLevel === undefined ? 1 : minLevel, opId);
            return respondText(errors.length ? JSON.stringify(errors, null, 1) : "no errors found");
        }
    );

    server.tool(
        "get-patch-op",
        "get one op instance from the current patch as serialized json, by its op id: its current port values, uiAttribs, storage and outgoing links (incoming links are stored on the op they come from). this is the op as it is used in the patch, not its documentation (use get-op-summary-doc for that) and not its source code (use read-op for that).", { "opId": param.opId() },
        ({ opId }) =>
        {
            logMcp("get patch op " + opLabel(opId));

            const targetOp = CABLES.patch.getOpById(opId);
            if (!targetOp) return respondError("no op found with id " + opId);

            const serialized = targetOp.getSerialized();
            if (!serialized.objName) serialized.objName = targetOp.objName;

            return respondText(JSON.stringify(serialized, null, 1));
        }
    );

    server.tool(
        "get-port-values",
        "the current runtime values of all input and output ports of an op, including linked inputs and outputs, which get-patch-op leaves out. one line per port: in/out, name, type and value. long strings are shortened to their start and length, objects and arrays are summarized. use it to check what data actually flows through a link. stacked ops list the keys of their hidden copies, stackKey shows the values of one copy.", { "opId": param.opId(), "stackKey": param.stackKey() },
        ({ opId, stackKey }) =>
        {
            logMcp("get port values " + opLabel(opId) + (stackKey ? " copy " + stackKey : ""));

            const headOp = CABLES.patch.getOpById(opId);
            if (!headOp) return respondError("no op found with id " + opId);

            const target = getStackTarget(headOp, stackKey);
            if (target.error) return respondError(target.error);
            const targetOp = target.op;

            const lines = [];
            if (!stackKey && headOp.isStacked && headOp.getStackCopyKeys) lines.push("stacked, copies: " + (headOp.getStackCopyKeys().join(", ") || "none"));
            for (const p of targetOp.portsIn) lines.push("in  " + p.name + " (" + p.getTypeString() + "): " + describePortValue(stackKey ? p.value : p.get()));
            for (const p of targetOp.portsOut) lines.push("out " + p.name + " (" + p.getTypeString() + "): " + describePortValue(stackKey ? p.value : p.get()));
            return respondText(lines.join("\n"));
        }
    );

    server.tool(
        "set-op-stacked",
        "stack or unstack ops inside a loop area (an op like Ops.Dev.Trigger.Loop / Loop2d whose area allows stacking). " +
        "use it when ops inside a loop must keep their own state per iteration: anything with memory (smoothing, counters, timers, delays), anything creating resources (html elements, meshes, textures), " +
        "and value ops that mix the loop index with values coming from outside the loop (e.g. index + timer), otherwise they only keep the last iteration. " +
        "a stacked op runs index 0 itself and gets one hidden copy per further loop index (nested loops: one per index combination), created from the loop's count, never saved. " +
        "values and triggers are routed to the copy of the current iteration, copies pass their outputs on with their own index, so chains of stacked ops stay paired. " +
        "this also acts as a per-iteration cache: every copy keeps its inputs and results between frames and only recalculates when its own inputs change, " +
        "so expensive ops (e.g. subpatch ops building arrays or meshes) do not redo work for iterations whose inputs did not change, unlike an unstacked op that recalculates on every iteration with alternating inputs. " +
        "cost: copies run their own code and use memory, a stacked subpatch op loads its whole contents once per copy. " +
        "not possible: ops outside a loop area (they get unstacked when moved out), ops with animated ports, legacy subpatch ops whose contents are stored in the patch. " +
        "answers per op the result and the number of stacks; check single copies with get-port-values stackKey.", { "opIds": z.array(param.opId()).describe("ids of the ops to stack or unstack"), "stacked": z.boolean().describe("true stacks the ops, false unstacks them") },
        ({ opIds, stacked }) =>
        {
            logMcp("set stacked " + stacked + " " + opIds.join(","));
            if (!CABLES.UI || !gui.patchView || !gui.patchView.setOpStacked) return respondError("no patch editor UI available");

            const lines = [];
            for (const opId of opIds)
            {
                const o = CABLES.patch.getOpById(opId);
                if (!o) { lines.push(opId + ": no op found"); continue; }

                if (stacked && !gui.patchView.canStackOp(o))
                {
                    let reason = "not inside a loop area";
                    if (o.hasAnimatedPorts && o.hasAnimatedPorts()) reason = "has animated ports";
                    else if (o.canHaveStackCopies && !o.canHaveStackCopies()) reason = "legacy subpatch op, its contents are stored in the patch";
                    else if (o.uiAttribs.allowStacking || o.uiAttribs.scopeArea) reason = "loop/area ops can not be stacked";
                    lines.push(opId + " " + opLabel(opId) + ": not stacked, " + reason);
                    continue;
                }

                gui.patchView.setOpStacked(o, stacked);
                if (o.isStacked) lines.push(opId + " " + opLabel(opId) + ": stacked, " + o.getNumStacks() + " stacks");
                else lines.push(opId + " " + opLabel(opId) + ": " + (stacked ? "could not be stacked" : "unstacked"));
            }
            return respondText(lines.join("\n"));
        }
    );

    server.tool(
        "copy-paste-ops",
        "copy ops and paste them like ctrl+c / ctrl+v in the editor (same code path: links between the copied ops are kept, new ids, area membership and stacking are updated). " +
        "the copies are placed at x/y in the current subpatch (default: right of the copied ops) and selected afterwards. answers the new op ids, titles and their stacked state.", { "opIds": z.array(param.opId()).describe("ids of the ops to copy, all from the current subpatch"), "x": z.number().optional().describe("x position of the pasted ops' top left"), "y": z.number().optional().describe("y position of the pasted ops' top left") },
        async ({ opIds, x, y }) =>
        {
            logMcp("copy paste " + opIds.join(","));
            if (!CABLES.UI || !gui.patchView || !gui.patchView.clipboardPaste) return respondError("no patch editor UI available");

            const ops = [];
            for (const opId of opIds)
            {
                const o = CABLES.patch.getOpById(opId);
                if (!o) return respondError("no op found: " + opId);
                ops.push(o);
            }

            gui.patchView.unselectAllOps();
            for (const o of ops) gui.patchView.selectOpId(o.id);

            let data = null;
            gui.patchView.clipboardCopyOps({ "clipboardData": { "setData": (_type, str) => { data = str; } }, "preventDefault": () => {} });
            if (!data) return respondError("copying failed");

            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity;
            for (const o of ops)
            {
                const t = o.uiAttribs.translate || { "x": 0, "y": 0 };
                minX = Math.min(minX, t.x);
                minY = Math.min(minY, t.y);
                maxX = Math.max(maxX, t.x + ((o.uiAttribs.area && o.uiAttribs.area.w) || 200));
            }
            if (x === undefined) x = maxX + 100;
            if (y === undefined) y = minY;

            const pasted = await new Promise((resolve) =>
            {
                const event = { "clipboardData": { "types": ["text/plain"], "getData": () => { return data; } }, "preventDefault": () => {} };
                gui.patchView.clipboardPaste(event, gui.patchView.getCurrentSubPatch(), x, y, (newOps) => { resolve(newOps || []); });
                setTimeout(() => { resolve(null); }, 10000);
            });
            if (!pasted) return respondError("paste did not finish within 10s");

            gui.patchView.unselectAllOps();
            const lines = [];
            for (const p of pasted)
            {
                gui.patchView.selectOpId(p.id);
                const o = CABLES.patch.getOpById(p.id);
                let line = p.id + " " + opLabel(p.id);
                if (o && o.isStacked) line += " (stacked, " + o.getNumStacks() + " stacks)";
                else if (o && o.attribs.stacked) line += " (attribs.stacked but not stacked)";
                lines.push(line);
            }
            return respondText("pasted " + pasted.length + " ops:\n" + lines.join("\n"));
        }
    );
}

// the op itself, or with stackKey the hidden copy of a stacked op
function getStackTarget(o, stackKey)
{
    if (!stackKey) return { "op": o };
    if (!o.isStacked || !o.findStackCopy) return { "error": "op " + opLabel(o.id) + " is not stacked" };

    const copy = o.findStackCopy(stackKey);
    if (!copy) return { "error": "op " + opLabel(o.id) + " has no copy " + stackKey + ", copies: " + (o.getStackCopyKeys().join(", ") || "none") };
    return { "op": copy };
}

const PORT_VALUE_MAX_LENGTH = 200;

function describePortValue(v)
{
    if (v === null || v === undefined) return String(v);
    if (typeof v == "string")
    {
        if (v.length <= PORT_VALUE_MAX_LENGTH) return JSON.stringify(v);
        return JSON.stringify(v.substring(0, PORT_VALUE_MAX_LENGTH)) + "... (" + v.length + " chars)";
    }
    if (typeof v != "object") return String(v);
    if (Array.isArray(v) || ArrayBuffer.isView(v)) return (v.constructor ? v.constructor.name : "Array") + " length " + v.length;
    if (v instanceof Element) return "<" + v.tagName.toLowerCase() + "> element";

    let str = "";
    try { str = JSON.stringify(v); }
    catch (e) { str = ""; }
    const name = v.constructor ? v.constructor.name : "Object";
    if (!str) return name;
    if (str.length > PORT_VALUE_MAX_LENGTH) str = str.substring(0, PORT_VALUE_MAX_LENGTH) + "... (" + str.length + " chars)";
    return name + " " + str;
}
