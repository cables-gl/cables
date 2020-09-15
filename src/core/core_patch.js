import { EventTarget } from "./eventtarget";
import { ajax, uuid, ajaxSync } from "./utils";
import { LoadingStatus } from "./loadingstatus";
import { Instancing } from "./instancing";
import { Timer } from "./timer";
import { Link } from "./core_link";
import { Profiler } from "./core_profiler";
import { Context } from "./cgl/cgl_state";
import { Anim, ANIM } from "./anim";
import { CONSTANTS } from "./constants";
import { Requirements } from "./requirements";
import { Log } from "./log";

/**
 * Patch class, contains all operators,values,links etc. manages loading and running of the whole patch
 *
 * see {@link PatchConfig}
 *
 * @external CABLES
 * @namespace Patch
 * @hideconstructor
 * @param {PatchConfig} config The configuration object.
 * @class
 * @example
 * CABLES.patch=new CABLES.Patch(
 * {
 *     patch:pStr,
 *     glCanvasId:'glcanvas',
 *     glCanvasResizeToWindow:true,
 *     canvas:{powerPreference:"high-performance"},
 *     prefixAssetPath:'/assets/',
 *     onError:function(e){console.log(e);}
 * });
 */

const Patch = function (cfg)
{
    EventTarget.apply(this);

    this.ops = [];
    this.settings = {};
    this.config = cfg || {
        "glCanvasResizeToWindow": false,
        "prefixAssetPath": "",
        "silent": false,
        "onError": null,
        "onFinishedLoading": null,
        "onFirstFrameRendered": null,
        "onPatchLoaded": null,
        "fpsLimit": 0,
    };
    this.timer = new Timer();
    this.freeTimer = new Timer();
    this.animFrameOps = [];
    this.animFrameCallbacks = [];
    this.gui = false;
    this.silent = false;
    this.profiler = null;
    this.onLoadStart = null;
    this.onLoadEnd = null;
    this.aborted = false;
    this._crashedOps = [];
    this._renderOneFrame = false;
    this._animReq = null;
    this._opIdCache = {};

    this.loading = new LoadingStatus(this);

    this._perf = {
        "fps": 0,
        "ms": 0,
        "_fpsFrameCount": 0,
        "_fpsMsCount": 0,
        "_fpsStart": 0,
    };


    this._volumeListeners = [];
    this._paused = false;
    this._frameNum = 0;
    this.instancing = new Instancing();
    this.onOneFrameRendered = null;
    this.namedTriggers = {};

    this._origData = null;
    this._frameNext = 0;
    this._frameInterval = 0;
    this._lastFrameTime = 0;
    this._frameWasdelayed = true;


    if (!(function () { return !this; }())) console.log("not in strict mode: core patch");

    this._isLocal = document.location.href.indexOf("file:") === 0;

    Log.setSilent(this.config.silent);

    if (!this.config.hasOwnProperty("doRequestAnimation")) this.config.doRequestAnimation = true;

    if (!this.config.prefixAssetPath) this.config.prefixAssetPath = "";
    if (!this.config.masterVolume) this.config.masterVolume = 1.0;

    this._variables = {};
    this._variableListeners = [];
    this.vars = {};
    if (cfg && cfg.vars) this.vars = cfg.vars; // vars is old!

    this.cgl = new Context(this);

    this.cgl.setCanvas(this.config.glCanvasId || this.config.glCanvas || "glcanvas");
    if (this.config.glCanvasResizeToWindow === true) this.cgl.setAutoResize("window");
    if (this.config.glCanvasResizeToParent === true) this.cgl.setAutoResize("parent");
    this.loading.setOnFinishedLoading(this.config.onFinishedLoading);

    if (this.cgl.aborted) this.aborted = true;
    if (this.cgl.silent) this.silent = true;

    this.freeTimer.play();
    this.exec();

    if (!this.aborted)
    {
        if (this.config.patch)
        {
            this.deSerialize(this.config.patch);
        }
        else if (this.config.patchFile)
        {
            ajax(
                this.config.patchFile,
                (err, _data) =>
                {
                    const data = JSON.parse(_data);
                    if (err)
                    {
                        const txt = "";
                        Log.error("err", err);
                        Log.error("data", data);
                        Log.error("data", data.msg);
                        return;
                    }
                    this.deSerialize(data);
                }
            );
        }
        this.timer.play();
    }

    console.log("made with https://cables.gl");
};

Patch.prototype.isPlaying = function ()
{
    return !this._paused;
};

Patch.prototype.isRenderingOneFrame = function ()
{
    return this._renderOneFrame;
};


Patch.prototype.renderOneFrame = function ()
{
    this._paused = true;
    this._renderOneFrame = true;
    this.exec();
    this._renderOneFrame = false;
};

/**
 * current number of frames per second
 * @function getFPS
 * @memberof Patch
 * @instance
 * @return {Number} fps
 */
Patch.prototype.getFPS = function ()
{
    return this._perf.fps;
};

/**
 * returns true if patch is opened in editor/gui mode
 * @function isEditorMode
 * @memberof Patch
 * @instance
 * @return {Boolean} editor mode
 */
Patch.prototype.isEditorMode = function ()
{
    return this.config.editorMode === true;
};

/**
 * pauses patch execution
 * @function pause
 * @memberof Patch
 * @instance
 */
Patch.prototype.pause = function ()
{
    cancelAnimationFrame(this._animReq);
    this._animReq = null;
    this._paused = true;
    this.freeTimer.pause();
};

/**
 * resumes patch execution
 * @function resume
 * @memberof Patch
 * @instance
 */
Patch.prototype.resume = function ()
{
    if (this._paused)
    {
        cancelAnimationFrame(this._animReq);

        this._paused = false;
        this.freeTimer.play();
        this.exec();
    }
};

/**
 * set volume [0-1]
 * @function setVolume
 * @param {Number} volume
 * @memberof Patch
 * @instance
 */
Patch.prototype.setVolume = function (v)
{
    this.config.masterVolume = v;
    for (let i = 0; i < this._volumeListeners.length; i++) this._volumeListeners[i].onMasterVolumeChanged(v);
};


/**
 * get asset path
 * @function getAssetPath
 * @memberof Patch
 * @instance
 */
Patch.prototype.getAssetPath = function ()
{
    if (this.isEditorMode())
    {
        return "/assets/" + gui.project()._id + "/";
    }
    else if (document.location.href.indexOf("cables.gl") > 0)
    {
        const parts = document.location.href.split("/");
        return "/assets/" + parts[parts.length - 1] + "/";
    }
    else
    {
        return "assets/";
    }
};

/**
 * get url/filepath for a filename
 * this uses prefixAssetpath in exported patches
 * @function getFilePath
 * @memberof Patch
 * @instance
 * @param {String} filename
 * @return {String} url
 */
Patch.prototype.getFilePath = function (filename)
{
    if (this._isLocal) alert("Browser security forbids loading files directly without a webserver. Upload files to a server to work.");
    if (!filename) return filename;
    filename = String(filename);
    if (filename.indexOf("https:") === 0 || filename.indexOf("http:") === 0) return filename;

    filename = filename.replace("//", "/");
    return this.config.prefixAssetPath + filename + (this.config.suffixAssetPath || "");
};

Patch.prototype.clear = function ()
{
    this.cgl.TextureEffectMesh = null;
    this.animFrameOps.length = 0;
    this.timer = new Timer();
    while (this.ops.length > 0) this.deleteOp(this.ops[0].id);
};

Patch.getOpClass = function (objName)
{
    const parts = objName.split(".");
    let opObj = null;

    try
    {
        if (parts.length == 2) opObj = window[parts[0]][parts[1]];
        else if (parts.length == 3) opObj = window[parts[0]][parts[1]][parts[2]];
        else if (parts.length == 4) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]];
        else if (parts.length == 5) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]];
        else if (parts.length == 6) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]];
        else if (parts.length == 7) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]];
        else if (parts.length == 8) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]];
        else if (parts.length == 9) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]];
        else if (parts.length == 10) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]];
        return opObj;
    }
    catch (e)
    {
        return null;
    }
};

Patch.prototype.createOp = function (identifier, id)
{
    const parts = identifier.split(".");
    let op = null;
    let objName = "";

    try
    {
        if (identifier.indexOf("Ops.") == -1)
        {
            // this should be a uuid, not a namespace
            // creating ops by id should be the default way from now on!
            const opId = identifier;

            if (CABLES.OPS[opId])
            {
                objName = CABLES.OPS[opId].objName;
                op = new CABLES.OPS[opId].f(this, objName, id, opId);
                op.opId = opId;
            }
            else
            {
                throw new Error("could not find op by id: " + opId);
            }
        }

        if (!op)
        {
            // fallback: create by objname!
            objName = identifier;
            const opObj = Patch.getOpClass(objName);

            if (!opObj)
            {
                this.emitEvent("criticalError", "unknown op", "unknown op: " + objName);

                Log.error("unknown op: " + objName);
                throw new Error("unknown op: " + objName);
            }
            else
            {
                if (parts.length == 2) op = new window[parts[0]][parts[1]](this, objName, id);
                else if (parts.length == 3) op = new window[parts[0]][parts[1]][parts[2]](this, objName, id);
                else if (parts.length == 4) op = new window[parts[0]][parts[1]][parts[2]][parts[3]](this, objName, id);
                else if (parts.length == 5) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]](this, objName, id);
                else if (parts.length == 6) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]](this, objName, id);
                else if (parts.length == 7) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]](this, objName, id);
                else if (parts.length == 8) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]](this, objName, id);
                else if (parts.length == 9) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]](this, objName, id);
                else if (parts.length == 10) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]](this, objName, id);
                else Log.log("parts.length", parts.length);
            }

            if (op)
            {
                op.opId = null;
                // Log.log("op created by objName:",objName);
                for (const i in CABLES.OPS)
                {
                    if (CABLES.OPS[i].objName == objName) op.opId = i;
                }
            }
        }
    }
    catch (e)
    {
        this._crashedOps.push(objName);

        this.emitEvent("exceptionOp", e, objName);

        if (!this.isEditorMode())
        {
            Log.log(e);
            Log.error("[instancing error] " + objName, e);

            if (CABLES.api) CABLES.api.sendErrorReport(e);
            this.exitError("INSTANCE_ERR", "Instancing Error " + objName);
            throw new Error("instancing error " + objName);
        }
    }

    if (op)
    {
        op.objName = objName;
        op.patch = this;
    }
    return op;
};

/**
 * create a new op in patch
 * @function addOp
 * @memberof Patch
 * @instance
 * @param {String} objName, e.g. Ops.Math.Sum
 * @param {Object} UI Attributes
 * @example
 * // add invisible op
 * patch.addOp('Ops.Math.Sum', { showUiAttribs: false });
 */
Patch.prototype.addOp = function (opIdentifier, uiAttribs, id)
{
    const op = this.createOp(opIdentifier, id);

    if (op)
    {
        if (uiAttribs && uiAttribs.hasOwnProperty("errors")) delete uiAttribs.errors;
        if (uiAttribs && uiAttribs.hasOwnProperty("error")) delete uiAttribs.error;

        op.uiAttr(uiAttribs);
        if (op.onCreate) op.onCreate();

        if (op.hasOwnProperty("onAnimFrame")) this.addOnAnimFrame(op);
        if (op.hasOwnProperty("onMasterVolumeChanged")) this._volumeListeners.push(op);

        this.ops.push(op);
        this._opIdCache[op.id] = op;

        // if (this.onAdd) this.onAdd(op);
        // console.log("onop add event!");

        this.emitEvent("onOpAdd", op);

        if (op.init) op.init();
    }

    // if(next) next(op);
    return op;
};

Patch.prototype.addOnAnimFrame = function (op)
{
    for (let i = 0; i < this.animFrameOps.length; i++) if (this.animFrameOps[i] == op) { return; }

    this.animFrameOps.push(op);
};

Patch.prototype.removeOnAnimFrame = function (op)
{
    for (let i = 0; i < this.animFrameOps.length; i++)
    {
        if (this.animFrameOps[i] == op)
        {
            this.animFrameOps.splice(i, 1);
            return;
        }
    }
};

Patch.prototype.addOnAnimFrameCallback = function (cb)
{
    this.animFrameCallbacks.push(cb);
};

Patch.prototype.removeOnAnimCallback = function (cb)
{
    for (let i = 0; i < this.animFrameCallbacks.length; i++)
    {
        if (this.animFrameCallbacks[i] == cb)
        {
            this.animFrameCallbacks.splice(i, 1);
            return;
        }
    }
};

Patch.prototype.deleteOp = function (opid, tryRelink, reloadingOp)
{
    for (const i in this.ops)
    {
        if (this.ops[i].id == opid)
        {
            const op = this.ops[i];
            let reLinkP1 = null;
            let reLinkP2 = null;

            if (op)
            {
                if (tryRelink)
                {
                    if (this.ops[i].portsIn.length > 0 && this.ops[i].portsIn[0].isLinked() && (this.ops[i].portsOut.length > 0 && this.ops[i].portsOut[0].isLinked()))
                    {
                        if (this.ops[i].portsIn[0].getType() == this.ops[i].portsOut[0].getType())
                        {
                            reLinkP1 = this.ops[i].portsIn[0].links[0].getOtherPort(this.ops[i].portsIn[0]);
                            reLinkP2 = this.ops[i].portsOut[0].links[0].getOtherPort(this.ops[i].portsOut[0]);
                        }
                    }
                }

                const opToDelete = this.ops[i];
                opToDelete.removeLinks();

                if (this.onDelete)
                {
                    // todo: remove
                    Log.log("deprecated this.onDelete", this.onDelete);
                    this.onDelete(opToDelete);
                }

                this.emitEvent("onOpDelete", opToDelete, reloadingOp);
                this.ops.splice(i, 1);

                if (opToDelete.onDelete) opToDelete.onDelete(reloadingOp);
                opToDelete.cleanUp();

                if (reLinkP1 !== null && reLinkP2 !== null)
                {
                    this.link(reLinkP1.parent, reLinkP1.getName(), reLinkP2.parent, reLinkP2.getName());
                }

                delete this._opIdCache[opid];
            }
        }
    }
};

Patch.prototype.getFrameNum = function ()
{
    return this._frameNum;
};

Patch.prototype.renderFrame = function (e)
{
    this.timer.update();
    this.freeTimer.update();
    const time = this.timer.getTime();
    const startTime = performance.now();

    for (let i = 0; i < this.animFrameCallbacks.length; ++i)
    {
        if (this.animFrameCallbacks[i]) this.animFrameCallbacks[i](time, this._frameNum);
    }

    for (let i = 0; i < this.animFrameOps.length; ++i)
    {
        if (this.animFrameOps[i].onAnimFrame)
        {
            this.animFrameOps[i].onAnimFrame(time);
        }
    }

    CGL.profileData.profileOnAnimFrameOps = performance.now() - startTime;

    this.emitEvent("onRenderFrame", time);

    this._frameNum++;
    if (this._frameNum == 1)
    {
        if (this.config.onFirstFrameRendered) this.config.onFirstFrameRendered();
    }
};

Patch.prototype.exec = function (e)
{
    if (!this._renderOneFrame && (this._paused || this.aborted)) return;

    this.config.fpsLimit = this.config.fpsLimit || 0;
    if (this.config.fpsLimit)
    {
        this._frameInterval = 1000 / this.config.fpsLimit;
    }

    const now = CABLES.now();
    const frameDelta = now - this._frameNext;

    if (this.isEditorMode())
    {
        if (!this._renderOneFrame)
        {
            if (now - this._lastFrameTime >= 500 && this._lastFrameTime !== 0 && !this._frameWasdelayed)
            {
                this._lastFrameTime = 0;
                setTimeout(this.exec.bind(this), 500);
                this.emitEvent("renderDelayStart");
                this._frameWasdelayed = true;
                return;
            }
        }
    }

    if (this._renderOneFrame || this.config.fpsLimit === 0 || frameDelta > this._frameInterval || this._frameWasdelayed)
    {
        const startFrameTime = CABLES.now();
        this.renderFrame();

        this._perf._lastFrameTime = CABLES.now();
        this._perf._fpsFrameCount++;

        this._perf._fpsMsCount += CABLES.now() - startFrameTime;

        if (this._frameInterval) this._frameNext = now - (frameDelta % this._frameInterval);
    }

    if (this._frameWasdelayed)
    {
        this.emitEvent("renderDelayEnd");
        this._frameWasdelayed = false;
    }

    if (this._renderOneFrame)
    {
        if (this.onOneFrameRendered) this.onOneFrameRendered(); // todo remove everywhere and use propper event...
        this.emitEvent("renderedOneFrame");
        this._renderOneFrame = false;
    }

    if (CABLES.now() - this._perf._fpsStart >= 1000)
    {
        if (this._perf.fps != this._perf._fpsFrameCount)
        {
            this._perf.fps = this._perf._fpsFrameCount;
            this._perf.ms = Math.round(this._perf._fpsMsCount / this._perf._fpsFrameCount);

            this.emitEvent("performance", this._perf);

            this._perf._fpsFrameCount = 0;
            this._perf._fpsMsCount = 0;
            this._perf._fpsStart = CABLES.now();
        }
    }


    if (this.config.doRequestAnimation) this._animReq = requestAnimationFrame(this.exec.bind(this));
};

/**
 * link two ops/ports
 * @function link
 * @memberof Patch
 * @instance
 * @param {Op} op1
 * @param {String} portName1
 * @param {Op} op2
 * @param {String} portName2
 */
Patch.prototype.link = function (op1, port1Name, op2, port2Name)
{
    if (!op1)
    {
        Log.log("link: op1 is null ");
        return;
    }
    if (!op2)
    {
        Log.log("link: op2 is null");
        return;
    }
    const port1 = op1.getPort(port1Name);
    const port2 = op2.getPort(port2Name);

    if (!port1)
    {
        console.warn("port not found! " + port1Name + "(" + op1.objName + ")");
        return;
    }

    if (!port2)
    {
        console.warn("port not found! " + port2Name + " of " + op2.name + "(" + op2.objName + ")");
        return;
    }

    if (!port1.shouldLink(port1, port2) || !port2.shouldLink(port1, port2))
    {
        return false;
    }

    if (Link.canLink(port1, port2))
    {
        const link = new Link(this);
        link.link(port1, port2);

        this.emitEvent("onLink", port1, port2, link);
        return link;
    }
};

Patch.prototype.serialize = function (asObj)
{
    const obj = {};

    obj.ops = [];
    obj.settings = this.settings;
    for (const i in this.ops)
    {
        obj.ops.push(this.ops[i].getSerialized());
    }

    if (asObj) return obj;
    return JSON.stringify(obj);
};

Patch.prototype.getOpById = function (opid)
{
    return this._opIdCache[opid];
    // this.timeNeededGetOpById = this.timeNeededGetOpById || 0;

    // const startTime = performance.now();
    // for (const i in this.ops)
    // {
    //     if (this.ops[i].id == opid)
    //     {
    //         this.timeNeededGetOpById += (performance.now() - startTime);
    //         return this.ops[i];
    //     }
    // }
};

Patch.prototype.getOpsById = function (opIds)
{
    const ops = [];
    for (const i in this.ops)
        for (let j = 0; j < opIds.length; j++)
            if (this.ops[i].id === opIds[j])
            {
                ops.push(this.ops[i]);
                break;
            }
    return ops;
};

Patch.prototype.getOpsByName = function (name)
{
    const arr = [];
    for (const i in this.ops)
        if (this.ops[i].name == name) arr.push(this.ops[i]);
    return arr;
};

Patch.prototype.getOpsByObjName = function (name)
{
    const arr = [];
    for (const i in this.ops)
        if (this.ops[i].objName == name) arr.push(this.ops[i]);
    return arr;
};

Patch.prototype.loadLib = function (which)
{
    ajaxSync(
        "/ui/libs/" + which + ".js",
        (err, res) =>
        {
            const se = document.createElement("script");
            se.type = "text/javascript";
            se.text = res;
            document.getElementsByTagName("head")[0].appendChild(se);
        },
        "GET",
    );
    // open and send a synchronous request
    // xhrObj.open('GET', '/ui/libs/'+which+'.js', false);
    // xhrObj.send('');
    // add the returned content to a newly created script tag
};

Patch.prototype.reloadOp = function (objName, cb)
{
    let count = 0;
    const ops = [];
    const oldOps = [];

    for (const i in this.ops)
    {
        if (this.ops[i].objName == objName)
        {
            oldOps.push(this.ops[i]);
        }
    }

    for (let i = 0; i < oldOps.length; i++)
    {
        count++;
        const oldOp = oldOps[i];
        oldOp.deleted = true;
        const self = this;

        const op = this.addOp(objName, oldOp.uiAttribs);
        ops.push(op);

        let j, k, l;
        for (j in oldOp.portsIn)
        {
            if (oldOp.portsIn[j].links.length === 0)
            {
                const p = op.getPort(oldOp.portsIn[j].name);
                if (!p) Log.error("[reloadOp] could not set port " + oldOp.portsIn[j].name + ", propably renamed port ?");
                else p.set(oldOp.portsIn[j].get());
            }
            else
            {
                while (oldOp.portsIn[j].links.length)
                {
                    const oldName = oldOp.portsIn[j].links[0].portIn.name;
                    const oldOutName = oldOp.portsIn[j].links[0].portOut.name;
                    const oldOutOp = oldOp.portsIn[j].links[0].portOut.parent;
                    oldOp.portsIn[j].links[0].remove();

                    l = self.link(op, oldName, oldOutOp, oldOutName);
                    if (!l) Log.log("[reloadOp] relink after op reload not successfull for port " + oldOutName);
                    else l.setValue();
                }
            }
        }

        for (j in oldOp.portsOut)
        {
            while (oldOp.portsOut[j].links.length)
            {
                const oldNewName = oldOp.portsOut[j].links[0].portOut.name;
                const oldInName = oldOp.portsOut[j].links[0].portIn.name;
                const oldInOp = oldOp.portsOut[j].links[0].portIn.parent;
                oldOp.portsOut[j].links[0].remove();

                l = self.link(op, oldNewName, oldInOp, oldInName);
                if (!l) Log.log("relink after op reload not successfull for port " + oldInName);
                else l.setValue();
            }
        }

        this.deleteOp(oldOp.id, false, true);
    }
    cb(count, ops);
};

Patch.prototype.getSubPatchOps = function (patchId)
{
    const ops = [];
    for (const i in this.ops)
    {
        if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId)
        {
            ops.push(this.ops[i]);
        }
    }
    return ops;
};

Patch.prototype.getSubPatchOp = function (patchId, objName)
{
    for (const i in this.ops)
        if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId && this.ops[i].objName == objName)
            return this.ops[i];
    return false;
};

Patch.prototype.deSerialize = function (obj, genIds)
{
    if (this.aborted) return;

    const loadingId = this.loading.start("core", "deserialize");
    if (this.onLoadStart) this.onLoadStart();

    this.namespace = obj.namespace || "";
    this.name = obj.name || "";

    if (typeof obj === "string")
    {
        obj = JSON.parse(obj);
    }
    const self = this;

    this.settings = obj.settings;

    function addLink(opinid, opoutid, inName, outName)
    {
        const found = false;
        if (!found)
        {
            self.link(self.getOpById(opinid), inName, self.getOpById(opoutid), outName);
        }
    }

    const reqs = new Requirements(this);

    // Log.log('add ops ',obj.ops);
    // add ops...
    for (const iop in obj.ops)
    {
        const start = CABLES.now();
        const opData = obj.ops[iop];
        let op = null;

        try
        {
            if (opData.opId) op = this.addOp(opData.opId, opData.uiAttribs, opData.id);
            else op = this.addOp(opData.objName, opData.uiAttribs, opData.id);
        }
        catch (e)
        {
            // console.warn("something gone wrong");
            console.warn("[instancing error] op data:", opData, e);
            throw new Error("instancing error: " + opData.objName);
        }

        reqs.checkOp(op);

        if (op)
        {
            if (genIds) op.id = uuid();
            op.portsInData = opData.portsIn;
            op._origData = opData;

            for (const ipi in opData.portsIn)
            {
                const objPort = opData.portsIn[ipi];
                const port = op.getPort(objPort.name);

                if (port && (port.uiAttribs.display == "bool" || port.uiAttribs.type == "bool") && !isNaN(objPort.value)) objPort.value = objPort.value === true;
                if (port && objPort.value !== undefined && port.type != CONSTANTS.OP.OP_PORT_TYPE_TEXTURE) port.set(objPort.value);
                if (port && objPort && objPort.animated) port.setAnimated(objPort.animated);
                if (port && objPort && objPort.useVariable) port.setVariableName(objPort.useVariable);

                if (port && objPort && objPort.anim)
                {
                    if (!port.anim) port.anim = new Anim();
                    if (objPort.anim.loop) port.anim.loop = objPort.anim.loop;
                    for (const ani in objPort.anim.keys)
                    {
                        port.anim.keys.push(new ANIM.Key(objPort.anim.keys[ani]));
                    }
                }
            }

            for (const ipo in opData.portsOut)
            {
                const port2 = op.getPort(opData.portsOut[ipo].name);
                if (port2 && port2.type != CONSTANTS.OP.OP_PORT_TYPE_TEXTURE && opData.portsOut[ipo].hasOwnProperty("value"))
                    port2.set(obj.ops[iop].portsOut[ipo].value);
            }
        }

        // if (performance.now() - startTime > 100) console.log("op crerate took long: ", opData.objName);

        const timeused = Math.round(100 * (CABLES.now() - start)) / 100;
        if (!this.silent && timeused > 200)console.warn("long op init ", obj.ops[iop].objName, timeused);
        // else Log.log('op time',obj.ops[iop].objName,timeused);
    }

    for (const i in this.ops)
    {
        if (this.ops[i].onLoadedValueSet)
        {
            this.ops[i].onLoadedValueSet(this.ops[i]._origData);
            this.ops[i].onLoadedValueSet = null;
            this.ops[i]._origData = null;
        }
    }

    console.log("----------deserialize before linking");

    // create links...
    if (obj.ops)
    {
        for (let iop = 0; iop < obj.ops.length; iop++)
        {
            if (obj.ops[iop].portsIn)
            {
                for (let ipi2 = 0; ipi2 < obj.ops[iop].portsIn.length; ipi2++)
                {
                    if (obj.ops[iop].portsIn[ipi2].links)
                    {
                        for (let ili = 0; ili < obj.ops[iop].portsIn[ipi2].links.length; ili++)
                        {
                            if (obj.ops[iop].portsIn[ipi2].links[ili])
                            {
                                // const startTime = performance.now();
                                addLink(obj.ops[iop].portsIn[ipi2].links[ili].objIn, obj.ops[iop].portsIn[ipi2].links[ili].objOut, obj.ops[iop].portsIn[ipi2].links[ili].portIn, obj.ops[iop].portsIn[ipi2].links[ili].portOut);

                                // const took = performance.now() - startTime;
                                // if (took > 100)console.log(obj.ops[iop].portsIn[ipi2].links[ili].objIn, obj.ops[iop].portsIn[ipi2].links[ili].objOut, took);
                            }
                        }
                    }
                }
            }
        }
    }

    for (const i in this.ops)
    {
        if (this.ops[i].onLoaded)
        {
            // TODO: deprecate!!!
            this.ops[i].onLoaded();
            this.ops[i].onLoaded = null;
        }
    }

    for (const i in this.ops)
    {
        if (this.ops[i].init)
        {
            this.ops[i].init();
            this.ops[i].init = null;
        }
    }

    if (this.config.variables)
        for (const varName in this.config.variables)
            this.setVarValue(varName, this.config.variables[varName]);

    for (const i in this.ops) this.ops[i].initVarPorts();


    setTimeout(
        () =>
        {
            this.loading.finished(loadingId);
        }, 100
    );
    if (this.config.onPatchLoaded) this.config.onPatchLoaded();

    if (this.onLoadEnd) this.onLoadEnd();
};

Patch.prototype.profile = function (enable)
{
    this.profiler = new Profiler();
    for (const i in this.ops)
    {
        this.ops[i].profile(enable);
    }
};

// ----------------------

/**
 * @type {Object}
 * @name Variable
 * @param {String} name
 * @param {String|Number} value
 * @memberof Patch
 * @constructor
 */
Patch.Variable = function (name, val, type)
{
    this._name = name;
    this._changeListeners = [];
    this.type = type;
    this.setValue(val);
};

/**
 * @function Variable.getValue
 * @memberof Patch.Variable
 * @returns {String|Number|Boolean}
 */

Patch.Variable.prototype.getValue = function ()
{
    return this._v;
};

/**
 * @function getName
 * @memberof Patch.Variable
 * @instance
 * @returns {String|Number|Boolean}
 * @function
 */
Patch.Variable.prototype.getName = function ()
{
    return this._name;
};

/**
 * @function setValue
 * @memberof Patch.Variable
 * @instance
 * @returns {String|Number|Boolean}
 * @function
 */
Patch.Variable.prototype.setValue = function (v)
{
    this._v = v;
    for (let i = 0; i < this._changeListeners.length; i++)
    {
        this._changeListeners[i](v);
    }
};

/**
 * function will be called when value of variable is changed
 * @function addListener
 * @memberof Patch.Variable
 * @instance
 * @param {Function} callback
 */
Patch.Variable.prototype.addListener = function (cb)
{
    this._changeListeners.push(cb);
};

/**
 * remove listener
 * @function removeListener
 * @memberof Patch.Variable
 * @instance
 * @param {Function} callback
 */
Patch.Variable.prototype.removeListener = function (cb)
{
    const ind = this._changeListeners.indexOf(cb);
    this._changeListeners.splice(ind, 1);
};

// ------------------

// // old?
// Patch.prototype.addVariableListener = function(cb) {
//     this._variableListeners.push(cb);
// };

// // old?
// Patch.prototype._callVariableListener = function(cb) {
//     for (var i = 0; i < this._variableListeners.length; i++) {
//         this._variableListeners[i]();
//     }
// };

/**
 * set variable value
 * @function setVariable
 * @memberof Patch
 * @instance
 * @param {String} name of variable
 * @param {Number|String|Boolean} value
 */
Patch.prototype.setVariable = function (name, val)
{
    if (this._variables.hasOwnProperty(name))
    {
        this._variables[name].setValue(val);
    }
    else
    {
        console.warn("variable " + name + " not found!");
    }
};

Patch.prototype._sortVars = function ()
{
    if (!this.isEditorMode()) return;
    const ordered = {};
    Object.keys(this._variables).sort().forEach((key) =>
    {
        ordered[key] = this._variables[key];
    });
    this._variables = ordered;
};

// used internally
Patch.prototype.setVarValue = function (name, val)
{
    if (this._variables.hasOwnProperty(name))
    {
        this._variables[name].setValue(val);
    }
    else
    {
        this._variables[name] = new Patch.Variable(name, val);
        this._sortVars();

        this.emitEvent("variablesChanged");
    }
    return this._variables[name];
};
// old?
Patch.prototype.getVarValue = function (name, val)
{
    if (this._variables.hasOwnProperty(name)) return this._variables[name].getValue();
};

/**
 * @function getVar
 * @memberof Patch
 * @instance
 * @param {String} name
 * @return {Variable} variable
 */
Patch.prototype.getVar = function (name)
{
    if (this._variables.hasOwnProperty(name)) return this._variables[name];
};

/**
 * @function
 * @memberof Patch
 * @instance
 */
Patch.prototype.getVars = function ()
{
    return this._variables;
};

Patch.prototype.deleteVar = function (name)
{
    for (let i = 0; i < this.ops.length; i++)
    {
        for (let j = 0; j < this.ops[i].portsIn.length; j++)
        {
            if (this.ops[i].portsIn[j].getVariableName() == name)
            {
                this.ops[i].portsIn[j].setVariable(null);
            }
        }
    }


    delete this._variables[name];
    this.emitEvent("variableDeleted", name);

    this.emitEvent("variablesChanged");
};


/**
 * @function getVars
 * @memberof Patch
 * @instance
 * @return {Array<Variable>} variables
 * @function
 */
Patch.prototype.getVars = function ()
{
    return this._variables;
};

Patch.prototype.exitError = function (errorId, errorMessage)
{
    if (this && this.config && this.config.onError)
    {
        this.config.onError(errorId, errorMessage);
        this.aborted = true;
    }
};

/**
 * @function preRenderOps
 * @memberof Patch
 * @instance
 * @description invoke pre rendering of ops
 * @function
 */
Patch.prototype.preRenderOps = function ()
{
    Log.log("prerendering...");
    let stopwatch = null;
    if (CABLES.StopWatch) stopwatch = new CABLES.StopWatch("prerendering");

    for (let i = 0; i < this.ops.length; i++)
    {
        if (this.ops[i].preRender)
        {
            this.ops[i].preRender();
            Log.log("prerender " + this.ops[i].objName);
        }
    }

    if (stopwatch) stopwatch.stop("prerendering");
};

/**
 * @function dispose
 * @memberof Patch
 * @instance
 * @description stop, dispose and cleanup patch
 */
Patch.prototype.dispose = function ()
{
    this.pause();
    this.clear();
};

/**
 * remove an eventlistener
 * @instance
 * @function addEventListener
 * @param {String} name of event
 * @param {function} callback
 */

/**
 * remove an eventlistener
 * @instance
 * @function removeEventListener
 * @param {String} name of event
 * @param {function} callback
 */

/**
 * op added to patch event
 * @event onOpAdd
 *
 * @memberof Patch
 * @type {Object}
 * @property {Op} op new op
 */

/**
 * op deleted from patch
 * @event onOpDelete
 * @memberof Patch
 * @type {Object}
 * @property {Op} op that will be deleted
 */

/**
 * link event - two ports will be linked
 * @event onLink
 * @memberof Patch
 * @type {Object}
 * @property {Port} port1
 * @property {Port} port2
 */

/**
 * unlink event - a link was deleted
 * @event onUnLink
 * @memberof Patch
 * @type {Object}
 */

/**
 * variables has been changed / a variable has been added to the patch
 * @event variablesChanged
 * @memberof Patch
 * @type {Object}
 * @property {Port} port1
 * @property {Port} port2
 */

/**
 * configuration object for loading a patch
 * @typedef {Object} PatchConfig
 * @hideconstructor
 * @property {String} [prefixAssetPath=''] path to assets
 * @property {String} [glCanvasId='glcanvas'] dom element id of canvas element
 * @property {Function} [onError=null] called when an error occurs
 * @property {Function} [onFinishedLoading=null] called when patch finished loading all assets
 * @property {Function} [onFirstFrameRendered=null] called when patch rendered it's first frame
 * @property {Boolean} [glCanvasResizeToWindow=false] resize canvas automatically to window size
 * @property {Boolean} [doRequestAnimation=true] do requestAnimationFrame set to false if you want to trigger exec() from outside (only do if you know what you are doing)
 * @property {Boolean} [clearCanvasColor=true] clear canvas in transparent color every frame
 * @property {Boolean} [clearCanvasDepth=true] clear depth every frame
 * @property {Boolean} [glValidateShader=true] enable/disable validation of shaders *
 * @property {Boolean} [silent=false]
 * @property {Number} [fpsLimit=0] 0 for maximum possible frames per second
 * @property {String} [glslPrecision='mediump'] default precision for glsl shader
 *
 */

export default Patch;
