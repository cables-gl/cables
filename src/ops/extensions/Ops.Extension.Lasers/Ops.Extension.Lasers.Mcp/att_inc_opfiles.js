// reading and writing op code and attachments

async function getOpSource(opname)
{
    const opDoc = await findOpDoc(opname);
    return new Promise((resolve, reject) =>
    {
        CABLESUILOADER.talkerAPI.send("getOpCode", { "opname": opDoc.id, "projectId": gui.patchId }, (err, rslt) =>
        {
            if (err) reject(new Error(err));
            else resolve(rslt.code);
        });
    });
}

// attachment file names always start with att_, e.g. att_inc_node.js
function attachmentFileName(name)
{
    return name.startsWith("att_") ? name : "att_" + name;
}

function getOpDocOrThrow(opname)
{
    const opDoc = gui.opDocs.getOpDocByName(opname);
    if (!opDoc) throw new Error("no op found with name " + opname);
    return opDoc;
}

// old and deprecated op versions are not in the editor's op docs until one of their versions is loaded,
// ask electron for the docs of all versions of the op like the editor does when it replaces an op version
async function loadOpDoc(opname)
{
    const known = gui.opDocs.getOpDocByName(opname);
    if (known || !opname || !opname.startsWith("Ops.")) return known;

    try
    {
        const res = await withTimeout(talkerSend("getOpDocs", { "opIdentifier": opname }), 10000, "getOpDocs");
        if (res && res.opDocs && res.opDocs.length) gui.opDocs.addOpDocs(res.opDocs);
    }
    catch (e)
    {
        return null;
    }
    return gui.opDocs.getOpDocByName(opname);
}

async function findOpDoc(opname)
{
    const opDoc = await loadOpDoc(opname);
    if (!opDoc) throw new Error("no op found with name " + opname);
    return opDoc;
}

async function readOpAttachment(opname, name)
{
    const opDoc = await findOpDoc(opname);
    const res = await talkerSend("opAttachmentGet", { "opname": opDoc.id, "name": attachmentFileName(name) });
    if (!res || res.content === undefined || res.content === null) throw new Error("no attachment " + attachmentFileName(name) + " in op " + opname + ", see list-op-attachments");
    return res.content;
}

// writes an attachment, creates it first if the op does not have it yet
async function writeOpAttachment(opname, name, content)
{
    const opDoc = await findOpDoc(opname);
    const fileName = attachmentFileName(name);
    opDoc.attachmentFiles = opDoc.attachmentFiles || [];

    let created = false;
    if (!opDoc.attachmentFiles.includes(fileName))
    {
        await talkerSend("opAttachmentAdd", { "opname": opDoc.id, "name": fileName.substring(4) });
        opDoc.attachmentFiles.push(fileName);
        created = true;
    }

    const res = await talkerSend("opAttachmentSave", { "opname": opDoc.id, "name": fileName, "content": content });
    if (res && res.data && res.data.updated) gui.patchView.store.setServerDate(res.data.updated);
    gui.emitEvent("refreshManageOp", opDoc.name);
    logMcp("saved " + opname + "/" + fileName);
    return created;
}

// ops created via mcp always live in the local namespace
const CREATE_OP_NAMESPACE = "Ops.Local.";

// creates a new op (the location follows from its name), optionally with code and attachments { "att_name": content }, and loads it.
// attachments are written afterwards, passing them to opCreate fails in electron when the project has op dirs
async function createOp(opname, code, attachments)
{
    if (!opname.startsWith(CREATE_OP_NAMESPACE) || opname.length <= CREATE_OP_NAMESPACE.length) throw new Error("op name has to start with " + CREATE_OP_NAMESPACE + ", e.g. " + CREATE_OP_NAMESPACE + "MyOp");

    const req = { "opname": opname };
    if (code) req.code = code;

    const res = await withTimeout(talkerSend("opCreate", req), 10000, "opCreate");
    if (res && res.problems && res.problems.length) throw new Error(res.problems.join(", "));

    const created = (res && res.data) || res;
    await withTimeout(new Promise((resolve) => { gui.serverOps.loadOp(created, () => { resolve(); }); }), 15000, "loadOp");

    for (const name in attachments || {}) await withTimeout(writeOpAttachment(opname, name, attachments[name]), 10000, "attachment " + name);
    if (attachments && Object.keys(attachments).length) await executeOp(opname);

    gui.opSelect().reload();
    return created;
}

// editor messages can contain links like <a href="/op/...">name</a>, only their text is useful in a tool result
function stripHtml(text)
{
    return String(text).replace(/<[^>]+>/g, "");
}

// resolves once the op docs know an op with this name, e.g. after a rename was loaded in the background
function waitForOpDoc(opname, timeoutMs)
{
    return new Promise((resolve, reject) =>
    {
        const start = Date.now();
        const check = () =>
        {
            if (gui.opDocs.getOpDocByName(opname)) resolve();
            else if (Date.now() - start > timeoutMs) reject(new Error("timeout waiting for " + opname + " to load"));
            else setTimeout(check, OP_DOC_POLL_MS);
        };
        check();
    });
}

// renames an op with the editor's rename (electron only), all its instances in the patch are replaced
async function renameOp(oldName, newName)
{
    await findOpDoc(oldName);
    if (gui.opDocs.getOpDocByName(newName)) throw new Error("op " + newName + " already exists");

    await withTimeout(new Promise((resolve, reject) =>
    {
        gui.serverOps.rename(oldName, newName, (err) =>
        {
            if (err) reject(new Error(stripHtml(err)));
            else resolve();
        });
    }), 15000, "rename");

    await waitForOpDoc(newName, 15000);
}

// clones an op to a new name (any namespace the platform allows, e.g. a new version Ops.X_v2), optionally replacing its instances in the patch
async function cloneOp(opname, newName, replaceInPatch)
{
    const opDoc = await findOpDoc(opname);
    if (gui.opDocs.getOpDocByName(newName)) throw new Error("op " + newName + " already exists");

    await withTimeout(new Promise((resolve, reject) =>
    {
        gui.serverOps.clone(opDoc.id, newName, resolve, { "openEditor": false, "onError": (msg) => { reject(new Error(msg)); } });
    }), 15000, "clone");

    await withTimeout(new Promise((resolve) => { gui.serverOps.loadOpDependencies(newName, resolve); }), 15000, "loadOpDependencies");

    if (!replaceInPatch) return 0;
    const ops = gui.corePatch().getOpsByObjName(opname);
    for (let i = 0; i < ops.length; i++) gui.patchView.replaceOp(ops[i].id, newName);
    return ops.length;
}

// saves new op code like the op code editor does, also updates the op's editor tab if it is open
// so saving that tab later does not bring back the old code
async function saveOpCode(opname, code)
{
    const opDoc = await findOpDoc(opname);
    const res = await talkerSend("saveOpCode", { "opname": opDoc.id, "code": code, "format": false });
    if (!res.success) throw new Error(res.error ? JSON.stringify(res.error) : "saving failed");
    if (res.updated) gui.patchView.store.setServerDate(res.updated);

    const tab = findOpenTab(urlName(opname));
    if (tab) tab.editor.setContent(code);
    logMcp("saved " + opname);
}

// the op code, or the content of one of its attachments when attachment is given
function readOpText(opname, attachment)
{
    return attachment ? readOpAttachment(opname, attachment) : getOpSource(opname);
}

// executes the op afterwards; the response of an edit to this op itself has to be sent before
// it restarts the mcp server, so that execution is delayed
async function writeOpText(opname, attachment, text)
{
    if (attachment) await writeOpAttachment(opname, attachment, text);
    else await saveOpCode(opname, text);

    if (opname === op.objName) setTimeout(() => { executeOp(opname); }, SELF_EXECUTE_DELAY_MS);
    else await executeOp(opname);
}

function countOccurrences(text, part)
{
    return text.split(part).length - 1;
}

// lines with their line numbers, like cat -n
function numberedLines(lines, firstLine)
{
    return lines.map((line, i) => { return (firstLine + i) + "\t" + line; }).join("\n");
}

// reloads the code of an op in all its instances in the patch
function executeOp(opname)
{
    return new Promise((resolve) =>
    {
        const timeout = setTimeout(resolve, 15000);
        gui.serverOps.execute(opname, () =>
        {
            clearTimeout(timeout);
            resolve();
        });
    });
}

const PORT_TYPE_NAMES = { "0": "number", "1": "trigger", "2": "object", "3": "array", "4": "dynamic", "5": "string" };

// leaves out unset fields and empty strings/arrays, so docs only carry what is really there
function withoutEmptyFields(obj)
{
    const result = {};
    for (const key in obj)
    {
        const value = obj[key];
        if (value === undefined || value === null || value === "") continue;
        if (Array.isArray(value) && value.length === 0) continue;
        result[key] = value;
    }
    return result;
}

// the documentation of an op as a plain object, null if there is none
function getOpDocData(objName)
{
    const opDoc = gui.opDocs.getOpDocByName(objName);
    if (!opDoc) return null;

    return withoutEmptyFields(
    {
        "name": opDoc.name,
        "id": opDoc.id,
        "summary": opDoc.summary,
        "content": opDoc.content,
        "description": opDoc.description,
        "version": opDoc.version,
        "oldVersion": opDoc.oldVersion,
        "hidden": opDoc.hidden,
        "authorName": opDoc.authorName,
        "exampleProjectId": opDoc.exampleProjectId,
        "libs": opDoc.libs,
        "coreLibs": opDoc.coreLibs,
        "dependencies": opDoc.dependencies,
        "ports": opDoc.docs ? opDoc.docs.ports : undefined,
        "layout": opDoc.layout
    });
}

function portTypeText(port)
{
    if (port.values) return "select: " + port.values.join(", ");
    if (port.type == 2 && port.objType) return port.objType;
    if (port.type == 0 && port.subType) return port.subType;
    return PORT_TYPE_NAMES[port.type] || String(port.type);
}

// one port as "- name: type - doc text", select ports by the name set-port-value takes (without " index")
function portSummaryLine(port, portDocs)
{
    let name = port.name;
    let typeText = portTypeText(port);
    if (name.endsWith(" index"))
    {
        name = name.substring(0, name.length - " index".length);
        if (!port.values) typeText = "select";
    }

    let line = "- " + name + ": " + typeText;
    const docText = portDocs[port.name] || portDocs[name];
    if (docText) line += " - " + docText;
    return line;
}

// short plain text docs of an op: summary, description and ports, null if there are no docs
function getOpSummaryText(objName)
{
    const opDoc = gui.opDocs.getOpDocByName(objName);
    if (!opDoc) return null;

    const portDocs = {};
    const docPorts = (opDoc.docs && opDoc.docs.ports) || [];
    for (let i = 0; i < docPorts.length; i++) portDocs[docPorts[i].name] = docPorts[i].text;

    const lines = [opDoc.name + ": " + (opDoc.summary || "no summary")];
    if (opDoc.content) lines.push(opDoc.content);
    if (opDoc.oldVersion) lines.push("old version, a newer version of this op exists");

    if (!opDoc.layout)
    {
        lines.push("ports unknown, the op has no saved port layout");
        return lines.join("\n");
    }

    const portsIn = opDoc.layout.portsIn || [];
    const portsOut = opDoc.layout.portsOut || [];
    lines.push("inputs:");
    for (let i = 0; i < portsIn.length; i++) lines.push(portSummaryLine(portsIn[i], portDocs));
    lines.push("outputs:");
    for (let i = 0; i < portsOut.length; i++) lines.push(portSummaryLine(portsOut[i], portDocs));
    return lines.join("\n");
}

// resolves any uri this server hands out (mcpfile:///, cables://op/, cables://opdoc/ or cables://patch.json) to { mimeType, text }
async function readResourceContent(uri)
{
    if (uri.startsWith("mcpfile:///"))
    {
        const tab = findOpenTab(uri.replace("mcpfile:///", ""));
        if (!tab) throw new Error("no opened file matches uri " + uri);
        return { "mimeType": "text/plain", "text": tab.editor.getContent() };
    }
    if (uri.startsWith("cables://op/"))
    {
        const code = await getOpSource(uri.replace("cables://op/", ""));
        return { "mimeType": "application/javascript", "text": code };
    }
    if (uri.startsWith("cables://opdoc/"))
    {
        const objName = uri.replace("cables://opdoc/", "");
        await loadOpDoc(objName);
        const doc = getOpDocData(objName);
        if (!doc) throw new Error("no op docs found for " + objName);
        return { "mimeType": "application/json", "text": JSON.stringify(doc) };
    }
    if (uri === "cables://patch.json") return { "mimeType": "application/json", "text": JSON.stringify(op.patch.serialize()) };
    throw new Error("unsupported uri " + uri);
}

// the include attachments of an op (att_inc_*.js), in the order they are put in front of its code
function includeFileNames(opname)
{
    const files = getOpDocOrThrow(opname).attachmentFiles || [];
    const names = [];
    for (let i = 0; i < files.length; i++)
        if (files[i].startsWith("att_inc_")) names.push(files[i]);
    return names.sort();
}

// the lines that contain text, as "<prefix><line number>\t<line>"
function findLines(lines, text, prefix)
{
    const found = [];
    for (let i = 0; i < lines.length; i++)
        if (lines[i].includes(text)) found.push(prefix + (i + 1) + "\t" + lines[i]);
    return found;
}

// registers the tools of this file, called by buildMcpServer
function registerOpFileTools(server)
{
    server.tool(
        "read-op",
        "read the code of an op (or one of its attachments, att_ prefix optional) with line numbers, much cheaper than reading the whole file: fromLine/toLine limit it to a range of lines, find only lists the lines containing that text, without attachment it also searches the op's include attachments (att_inc_*.js) and prefixes each line with its file name. use edit-op-text to change it.", { "opname": param.opName(), "attachment": z.string().optional().describe("attachment file instead of the op code, e.g. att_inc_utils.js (see list-op-attachments)"), "fromLine": z.number().optional().describe("first line to read, 1 based"), "toLine": z.number().optional().describe("last line to read"), "find": z.string().optional().describe("only list the lines containing this text") },
        async ({ opname, attachment, fromLine, toLine, find }) =>
        {
            logMcp("read op " + opname + (attachment ? "/" + attachmentFileName(attachment) : ""));

            try
            {
                const lines = (await readOpText(opname, attachment)).split("\n");

                if (find)
                {
                    const includes = attachment ? [] : includeFileNames(opname);
                    let found = findLines(lines, find, includes.length ? opname + ".js:" : "");
                    for (let i = 0; i < includes.length; i++)
                        found = found.concat(findLines((await readOpAttachment(opname, includes[i])).split("\n"), find, includes[i] + ":"));

                    return respondText(found.length ? found.join("\n") : "\"" + find + "\" not found");
                }

                const first = Math.max(1, fromLine || 1);
                const last = Math.min(lines.length, toLine || lines.length);
                return respondText(lines.length + " lines\n" + numberedLines(lines.slice(first - 1, last), first));
            }
            catch (e)
            {
                return respondError("could not read op: " + e.message);
            }
        }
    );

    server.tool(
        "edit-op-text",
        "change the code of an op (or one of its attachments, att_ prefix optional) by replacing oldText with newText, without sending the whole file. oldText has to match exactly once (copy it from read-op without the line numbers, include enough surrounding lines to make it unique), or pass replaceAll=true to replace every occurrence. the op is saved and re-executed afterwards.", { "opname": param.opName(), "attachment": z.string().optional().describe("attachment file instead of the op code, e.g. att_inc_utils.js (see list-op-attachments)"), "oldText": z.string().describe("exact text to replace, copied from read-op without the line numbers, with enough lines to be unique"), "newText": z.string().describe("the replacement text"), "replaceAll": z.boolean().optional().describe("replace every occurrence instead of requiring exactly one") },
        async ({ opname, attachment, oldText, newText, replaceAll }) =>
        {
            logMcp("edit op " + opname + (attachment ? "/" + attachmentFileName(attachment) : ""));

            try
            {
                const text = await readOpText(opname, attachment);
                const count = countOccurrences(text, oldText);

                if (!oldText || count == 0) return respondError("oldText not found, nothing changed");
                if (count > 1 && !replaceAll) return respondError("oldText found " + count + " times, add surrounding lines to make it unique or pass replaceAll=true; nothing changed");

                await writeOpText(opname, attachment, text.split(oldText).join(newText));
                return respondText("replaced " + count + " occurrence" + (count > 1 ? "s" : "") + ", op saved and executed");
            }
            catch (e)
            {
                return respondError("could not edit op: " + e.message);
            }
        }
    );

    server.tool(
        "edit-op",
        "open the code of an op in an editor tab, so the person at the editor sees it (it then shows up in list-resources). to read or change code you do not need this: use read-op and edit-op-text.", { "opname": param.opName() },
        (opts) =>
        {
            logMcp("edit op " + opts.opname);
            gui.serverOps.edit(opts.opname, false, null, true);
            return respond({ "content": [] });
        }
    );

    server.tool(
        "write-opened-resources",
        "replace the whole content of a file that is open in an editor tab (see list-resources) and save it. for op code prefer edit-op-text, it only sends the changed part and needs no open tab.", { "uri": z.string().describe("mcpfile:///<name> uri from list-resources"), "text": z.string().describe("the complete new file content") },
        ({ uri, text }) =>
        {
            logMcp("write file " + uriLabel(uri));
            const tab = findOpenTab(uri.replace("mcpfile:///", ""));
            if (tab)
            {
                tab.editor.setContent(text);
                tab.editor.save();
                logMcp("saved " + uriLabel(uri));
            }

            return respondText(tab ? "content updated" : "no opened file matches uri " + uri);
        }
    );

    server.tool(
        "create-op",
        "create a new op by its full name, which has to start with Ops.Local. (e.g. Ops.Local.Sdf.Sphere, other namespaces are rejected), optionally with its code and attachments as { \"att_name\": content } (att_ prefix optional). add it to the patch with add-op afterwards. to put it in another namespace, use rename-op afterwards.", { "opname": param.opName().describe("full name of the new op, has to start with Ops.Local., e.g. Ops.Local.MyOp"), "code": z.string().optional().describe("op javascript code, e.g. const inExec = op.inTrigger(\"Exec\");"), "attachments": z.record(z.string()).optional().describe("attachment files as { \"att_name\": content }") },
        async ({ opname, code, attachments }) =>
        {
            logMcp("create op " + opname);

            if (gui.opDocs.getOpDocByName(opname)) return respondError("op " + opname + " already exists, use edit-op / write-op-attachment");

            try
            {
                await createOp(opname, code, attachments);
                return respondText("created op " + opname);
            }
            catch (e)
            {
                return respondError("could not create op: " + e.message);
            }
        }
    );

    server.tool(
        "rename-op",
        "rename an op (its files, docs and changelog) from oldName to newName, both full names, e.g. Ops.Local.MyOp to Ops.Extension.Canvas2d.MyOp; can move it to another namespace. all instances in the patch are replaced. electron only. the editor checks the new name and returns its problems (name taken, invalid namespace...).", { "oldName": param.opName().describe("current full op name"), "newName": param.opName().describe("new full op name, e.g. Ops.Extension.Canvas2d.MyOp") },
        async ({ oldName, newName }) =>
        {
            logMcp("rename op " + oldName + " -> " + newName);

            try
            {
                await renameOp(oldName, newName);
                return respondText("renamed " + oldName + " to " + newName);
            }
            catch (e)
            {
                return respondError("could not rename op: " + e.message);
            }
        }
    );

    server.tool(
        "set-op-summary",
        "set the one line summary of an op (shown in op search and docs), by full op name. the same as the editor's \"Set op summary\" command. keep it short, like \"Draws a rectangle on a canvas2d\".", { "opname": param.opName(), "summary": z.string().describe("the new one line summary") },
        async ({ opname, summary }) =>
        {
            logMcp("set summary " + opname);

            try
            {
                const opDoc = await findOpDoc(opname);
                await talkerSend("opSetSummary", { "opId": opDoc.id, "summary": summary });
                opDoc.summary = summary;
                gui.opSelect().reload();
                s.buildList();
                return respondText("set summary of " + opname + ": " + summary);
            }
            catch (e)
            {
                return respondError("could not set summary: " + e.message);
            }
        }
    );

    server.tool(
        "add-op-changelog",
        "add an entry to the changelog of an op, by full op name, e.g. after fixing a bug. the author is the current standalone user. keep the message short, like \"fixed formula\".",
        {
            "opname": param.opName(),
            "message": z.string().describe("what changed"),
            "type": z.enum(["bugfix", "improvement", "feature", "new op", "rename", "deprecation"]).optional().describe("kind of change")
        },
        async ({ opname, message, type }) =>
        {
            logMcp("add changelog " + opname);

            try
            {
                await findOpDoc(opname);
                await talkerSend("addOpChangelog", { "opName": opname, "message": message, "type": type });
                return respondText("added changelog entry to " + opname + ": " + (type ? type + ": " : "") + message);
            }
            catch (e)
            {
                return respondError("could not add changelog entry: " + e.message);
            }
        }
    );

    server.tool(
        "clone-op",
        "copy an op (code and attachments) to a new full op name, which can be in another namespace or a new version (e.g. Ops.Gl.Foo -> Ops.Gl.Foo_v2). replaceInPatch replaces all instances of the old op in the patch with the clone. returns how many were replaced.", { "opname": param.opName().describe("full name of the op to copy"), "newName": param.opName().describe("full name of the copy, e.g. Ops.Gl.Foo_v2"), "replaceInPatch": z.boolean().optional().describe("replace all instances of the old op in the patch with the copy, default false") },
        async ({ opname, newName, replaceInPatch }) =>
        {
            logMcp("clone op " + opname + " -> " + newName);

            try
            {
                const replaced = await cloneOp(opname, newName, replaceInPatch);
                return respondText("cloned " + opname + " to " + newName + (replaceInPatch ? ", replaced " + replaced + " instances in the patch" : ""));
            }
            catch (e)
            {
                return respondError("could not clone op: " + e.message);
            }
        }
    );

    server.tool(
        "list-op-attachments",
        "list the attachment files of an op (e.g. att_inc_node.js, att_shader.vert), by full op name. read them with read-op-attachment, change them with write-op-attachment.", { "opname": param.opName() },
        async ({ opname }) =>
        {
            logMcp("list attachments " + opname);

            const opDoc = await loadOpDoc(opname);
            if (!opDoc) return respondError("no op found with name " + opname);

            const files = opDoc.attachmentFiles || [];
            return respondText(files.length ? files.join("\n") : "op " + opname + " has no attachments");
        }
    );

    server.tool(
        "read-op-attachment",
        "read the content of an op attachment file by full op name and attachment name (e.g. att_inc_node.js, the att_ prefix is optional); see list-op-attachments", { "opname": param.opName(), "name": z.string().describe("attachment file name, e.g. att_inc_utils.js") },
        async ({ opname, name }) =>
        {
            logMcp("read attachment " + opname + "/" + attachmentFileName(name));

            try
            {
                return respondText(await readOpAttachment(opname, name));
            }
            catch (e)
            {
                return respondError("could not read attachment: " + e.message);
            }
        }
    );

    server.tool(
        "write-op-attachment",
        "write the full content of an op attachment file (the att_ prefix is optional), creating it if the op does not have it yet. att_inc_*.js files are included into the op code, other attachments are available in the op as attachments.<name> (dots replaced by _). by default the op is re-executed afterwards so all instances in the patch use the new code; pass execute=false when writing several attachments and only execute on the last one.", { "opname": param.opName(), "name": z.string().describe("attachment file name, e.g. att_inc_utils.js or att_shader.frag"), "content": z.string().describe("the complete file content"), "execute": z.boolean().optional().describe("re-execute the op afterwards, default true; false when writing several files, then true on the last one") },
        async ({ opname, name, content, execute }) =>
        {
            logMcp("write attachment " + opname + "/" + attachmentFileName(name));

            try
            {
                const created = await writeOpAttachment(opname, name, content);
                if (execute !== false) await executeOp(opname);

                return respondText((created ? "created " : "saved ") + attachmentFileName(name) + (execute !== false ? ", op re-executed" : ""));
            }
            catch (e)
            {
                return respondError("could not write attachment: " + e.message);
            }
        }
    );

    server.tool(
        "delete-op-attachment",
        "delete an attachment file of an op by full op name and attachment name (the att_ prefix is optional), see list-op-attachments. by default the op is re-executed afterwards so all instances in the patch use the code without it; pass execute=false when deleting several attachments and only execute on the last one.", { "opname": param.opName(), "name": z.string().describe("attachment file name, e.g. att_inc_utils.js"), "execute": z.boolean().optional().describe("re-execute the op afterwards, default true") },
        async ({ opname, name, execute }) =>
        {
            const fileName = attachmentFileName(name);
            logMcp("delete attachment " + opname + "/" + fileName);

            try
            {
                const opDoc = await findOpDoc(opname);
                if (opDoc.attachmentFiles && !opDoc.attachmentFiles.includes(fileName)) return respondError(opname + " has no attachment " + fileName + ", see list-op-attachments");

                await withTimeout(talkerSend("opAttachmentDelete", { "opname": opDoc.id, "name": fileName }), 10000, "opAttachmentDelete");
                if (opDoc.attachmentFiles) opDoc.attachmentFiles.splice(opDoc.attachmentFiles.indexOf(fileName), 1);
                gui.emitEvent("refreshManageOp", opDoc.name);
                if (execute !== false) await executeOp(opname);

                return respondText("deleted " + fileName + (execute !== false ? ", op re-executed" : ""));
            }
            catch (e)
            {
                return respondError("could not delete attachment: " + e.message);
            }
        }
    );

    server.tool(
        "read-op-dependency",
        "read the content of a local dependency file of an op (e.g. ./lib.js from the op's dependencies, see get-full-op-docs). fromLine/toLine limit it to a range of lines, find only lists the lines containing that text.", { "opname": param.opName(), "name": z.string().describe("dependency file name, e.g. lib.js"), "fromLine": z.number().optional().describe("first line to read, 1 based"), "toLine": z.number().optional().describe("last line to read"), "find": z.string().optional().describe("only list the lines containing this text") },
        async ({ opname, name, fromLine, toLine, find }) =>
        {
            logMcp("read dependency " + opname + "/" + name);

            try
            {
                const lines = (await readOpDependency(opname, name)).split("\n");
                const from = Math.max(1, fromLine || 1);
                const to = Math.min(lines.length, toLine || lines.length);

                let text = lines.length + " lines\n";
                for (let i = from; i <= to; i++)
                {
                    if (find && lines[i - 1].indexOf(find) == -1) continue;
                    text += i + "\t" + lines[i - 1] + "\n";
                }
                return respondText(text);
            }
            catch (e)
            {
                return respondError("could not read dependency: " + e.message);
            }
        }
    );

    server.tool(
        "write-op-dependency",
        "write the full content of a local dependency file of an op (name like lib.js, stored next to the op code) and add it to the op's dependencies if it is not listed yet. type is commonjs (default, loaded as a script) or module (es module, then export names the global it is made available as). the op is re-executed afterwards; an already loaded library may need an editor reload to pick up changed code.", { "opname": param.opName(), "name": z.string().describe("dependency file name, e.g. lib.js"), "content": z.string().describe("the complete file content"), "type": z.enum(["commonjs", "module"]).optional().describe("commonjs (default, loaded as a script) or module (es module)"), "export": z.string().optional().describe("module only: name of the global the module is available as"), "execute": z.boolean().optional().describe("re-execute the op afterwards, default true") },
        async ({ opname, name, content, type, "export": exportName, execute }) =>
        {
            logMcp("write dependency " + opname + "/" + name);

            try
            {
                const added = await writeOpDependency(opname, name, content, type || "commonjs", exportName);
                if (execute !== false) await executeOp(opname);

                return respondText("saved " + dependencySrc(name) + (added ? ", added to dependencies" : "") + (execute !== false ? ", op re-executed" : ""));
            }
            catch (e)
            {
                return respondError("could not write dependency: " + e.message);
            }
        }
    );

    server.tool(
        "list-op-dependencies",
        "list the dependencies of an op (src, type, export) and the dependency types this platform supports", { "opname": param.opName() },
        async ({ opname }) =>
        {
            logMcp("list dependencies " + opname);

            try
            {
                const opDoc = await findOpDoc(opname);
                return respondText(JSON.stringify({ "dependencies": opDoc.dependencies || [], "supportedTypes": CABLES.platform.getSupportedOpDependencyTypes() }, null, 1));
            }
            catch (e)
            {
                return respondError("could not list dependencies: " + e.message);
            }
        }
    );

    server.tool(
        "add-op-dependency",
        "add a dependency to an op, or change type/export of an existing one with the same src. src is a url (lib/commonjs/module), a local file like ./lib.js (see write-op-dependency), an npm package name like three@0.160.0 (npm), a corelib name (corelib) or an op name (op). export names the global an es module (type module) is made available as. the dependencies are loaded and the op is re-executed afterwards.", { "opname": param.opName(), "src": z.string().describe("url, ./local.js, npm package like three@0.160.0, corelib name or op name"), "type": z.string().describe("dependency type, see list-op-dependencies for the supported ones, e.g. npm or module"), "export": z.string().optional().describe("module only: name of the global the module is available as"), "execute": z.boolean().optional().describe("re-execute the op afterwards, default true") },
        async ({ opname, src, type, "export": exportName, execute }) =>
        {
            logMcp("add dependency " + opname + " " + src);

            try
            {
                const opDoc = await findOpDoc(opname);
                const supportedTypes = CABLES.platform.getSupportedOpDependencyTypes();
                if (!supportedTypes.includes(type)) return respondError("unsupported dependency type " + type + ", use one of: " + supportedTypes.join(", "));

                const existing = findOpDependency(opDoc, src);
                if (existing)
                {
                    if (existing.type == type && (existing.export || "") == (exportName || "")) return respondText(src + " is already a " + type + " dependency of " + opname);
                    await removeOpDependency(opDoc, existing);
                }

                await addOpDependency(opDoc, src, type, exportName);
                if (execute !== false) await executeOp(opname);

                return respondText((existing ? "changed " : "added ") + type + " dependency " + src + (execute !== false ? ", op re-executed" : ""));
            }
            catch (e)
            {
                return respondError("could not add dependency: " + e.message);
            }
        }
    );

    server.tool(
        "remove-op-dependency",
        "remove a dependency from an op by its src (see list-op-dependencies). a local dependency file stays next to the op code. the op is re-executed afterwards.", { "opname": param.opName(), "src": z.string().describe("src of the dependency, as listed by list-op-dependencies"), "execute": z.boolean().optional().describe("re-execute the op afterwards, default true") },
        async ({ opname, src, execute }) =>
        {
            logMcp("remove dependency " + opname + " " + src);

            try
            {
                const opDoc = await findOpDoc(opname);
                const existing = findOpDependency(opDoc, src);
                if (!existing) return respondError(opname + " has no dependency " + src + ", see list-op-dependencies");

                await removeOpDependency(opDoc, existing);
                if (execute !== false) await executeOp(opname);

                return respondText("removed " + existing.type + " dependency " + src + (execute !== false ? ", op re-executed" : ""));
            }
            catch (e)
            {
                return respondError("could not remove dependency: " + e.message);
            }
        }
    );

}

const CHANGELOG_TYPES = ["new op", "feature", "improvement", "bugfix", "deprecation"];
const CHANGELOG_PREVIEW_LINES = 3;
const CHANGELOG_MAX_ENTRIES = 100000;

async function readOpChangelog(opname)
{
    const opDoc = await findOpDoc(opname);
    const res = await withTimeout(talkerSend("getOpInfo", { "opName": opDoc.id, "cl": CHANGELOG_MAX_ENTRIES, "sort": "asc" }), 10000, "getOpInfo");
    return (res && res.changelog) || [];
}

function findChangelogEntry(entries, date)
{
    for (let i = 0; i < entries.length; i++)
        if (entries[i].date === date) return entries[i];
    return null;
}

function formatChangelog(entries)
{
    const lines = [];
    for (let i = 0; i < entries.length; i++)
    {
        const e = entries[i];
        let line = e.date + " " + new Date(e.date).toISOString().substring(0, 10) + " [" + (e.type || "") + "] " + e.message;
        if (e.author) line += " (" + e.author + ")";
        if (e.url) line += " " + e.url;
        lines.push(line);
    }
    return lines.join("\n");
}

function findOpDependency(opDoc, src)
{
    const deps = opDoc.dependencies || [];
    for (let i = 0; i < deps.length; i++)
        if (deps[i].src === src) return deps[i];
    return null;
}

function reloadOpDependencies(opDoc)
{
    return new Promise((resolve) =>
    {
        const timeout = setTimeout(resolve, 60000);
        gui.serverOps.loadOpDependencies(opDoc.id, () =>
        {
            clearTimeout(timeout);
            resolve();
        }, true);
    });
}

async function addOpDependency(opDoc, src, type, exportName)
{
    const dep = { "opName": opDoc.id, "src": src, "type": type };
    if (exportName) dep.export = exportName;

    await withTimeout(new Promise((resolve, reject) =>
    {
        CABLESUILOADER.talkerAPI.send("addOpDependency", dep, (err) =>
        {
            if (!err) resolve();
            else if (err.msg === "NPM_ERROR" && err.data) reject(new Error("npm: " + err.data.stderr));
            else reject(new Error(err.msg || JSON.stringify(err)));
        });
    }), 120000, "addOpDependency");

    opDoc.dependencies = opDoc.dependencies || [];
    const newDep = { "src": src, "type": type };
    if (exportName) newDep.export = exportName;
    opDoc.dependencies.push(newDep);

    await reloadOpDependencies(opDoc);
    gui.emitEvent("refreshManageOp", opDoc.name);
}

async function removeOpDependency(opDoc, dep)
{
    await withTimeout(talkerSend("removeOpDependency", { "opName": opDoc.id, "src": dep.src, "type": dep.type }), 60000, "removeOpDependency");
    opDoc.dependencies.splice(opDoc.dependencies.indexOf(dep), 1);

    await reloadOpDependencies(opDoc);
    gui.emitEvent("refreshManageOp", opDoc.name);
}

function dependencySrc(name)
{
    return name.startsWith("./") ? name : "./" + name;
}

async function readOpDependency(opname, name)
{
    const opDoc = await findOpDoc(opname);
    const res = await talkerSend("getOpDependency", { "opname": opDoc.id, "name": dependencySrc(name) });
    let content = res ? res.content : undefined;
    if (content === undefined && res && res.data) content = res.data.content;
    if (content === undefined || content === null) throw new Error("no dependency file " + dependencySrc(name) + " in op " + opname);
    return content;
}

// the upload talker command turns the decoded base64 string into utf8 itself, so only strings without chars above 255 survive it,
// others are saved through the attachment path, which formats js of core ops
async function writeOpDependency(opname, name, content, type, exportName)
{
    const opDoc = await findOpDoc(opname);
    const src = dependencySrc(name);
    const fileName = src.substring(2);

    if (/^[\u0000-ÿ]*$/.test(content))
    {
        await withTimeout(talkerSend("uploadFileToOp", { "opId": opDoc.id, "filename": fileName, "fileStr": "data:text/plain;base64," + btoa(content) }), 10000, "uploadFileToOp");
    }
    else
    {
        await withTimeout(talkerSend("uploadFileToOp", { "opId": opDoc.id, "filename": fileName, "fileStr": "data:text/plain;base64," + btoa(" ") }), 10000, "uploadFileToOp");
        await withTimeout(talkerSend("saveOpDependency", { "opname": opDoc.id, "name": fileName, "content": content }), 10000, "saveOpDependency");
    }

    const deps = opDoc.dependencies || [];
    for (let i = 0; i < deps.length; i++)
        if (deps[i].src === src) return false;

    const dep = { "opName": opDoc.id, "src": src, "type": type };
    if (exportName) dep.export = exportName;
    await withTimeout(talkerSend("addOpDependency", dep), 60000, "addOpDependency");
    gui.emitEvent("refreshManageOp", opDoc.name);
    return true;
}
