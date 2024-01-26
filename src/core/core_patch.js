import { EventTarget } from "./eventtarget";
import { ajax, ajaxSync, prefixedHash, cleanJson, shortId } from "./utils";
import { LoadingStatus } from "./loadingstatus";
import { Instancing } from "./instancing";
import { Timer } from "./timer";
import { Link } from "./core_link";
import { Profiler } from "./core_profiler";
import { Context } from "./cgl/cgl_state";
import { CONSTANTS } from "./constants";
import Logger from "./core_logger";
import PatchVariable from "./core_variable";


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
 *     prefixJsPath:'/js/',
 *     onError:function(e){console.log(e);}
 *     glslPrecision:'highp'
 * });
 */

const Patch = function (cfg)
{
    EventTarget.apply(this);

    this._log = new Logger("core_patch");
    this.ops = [];
    this.settings = {};
    this.config = cfg ||
        {
            "glCanvasResizeToWindow": false,
            "prefixAssetPath": "",
            "prefixJsPath": "",
            "silent": true,
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
    CABLES.logSilent = this.silent = true;
    this.profiler = null;
    this.aborted = false;
    this._crashedOps = [];
    this._renderOneFrame = false;
    this._animReq = null;
    this._opIdCache = {};
    this._triggerStack = [];
    this.storeObjNames = false; // remove after may release

    this.loading = new LoadingStatus(this);

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
    this.frameStore = {};
    this.deSerialized = false;
    this._lastReqAnimTimeStamp = 0;

    this.cgCanvas = null;

    if (!(function () { return !this; }())) console.log("not in strict mode: core patch");

    this._isLocal = document.location.href.indexOf("file:") === 0;

    if (this.config.hasOwnProperty("silent")) this.silent = CABLES.logSilent = this.config.silent;
    if (!this.config.hasOwnProperty("doRequestAnimation")) this.config.doRequestAnimation = true;

    if (!this.config.prefixAssetPath) this.config.prefixAssetPath = "";
    if (!this.config.prefixJsPath) this.config.prefixJsPath = "";
    if (!this.config.masterVolume) this.config.masterVolume = 1.0;

    this._variables = {};
    this._variableListeners = [];
    this.vars = {};
    if (cfg && cfg.vars) this.vars = cfg.vars; // vars is old!

    this.cgl = new Context(this);
    this.cgp = null;

    this._subpatchOpCache = {};

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
                        this._log.error("err", err);
                        this._log.error("data", data);
                        this._log.error("data", data.msg);
                        return;
                    }
                    this.deSerialize(data);
                }
            );
        }
        this.timer.play();
    }

    console.log("made with https://cables.gl"); // eslint-disable-line
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
    console.log("deprecated getfps");
    return 0;
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
    this.emitEvent("pause");
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
        this.emitEvent("resume");
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
Patch.prototype.getAssetPath = function (patchId = null)
{
    if (this.isEditorMode())
    {
        let id = patchId || gui.project()._id;
        return "/assets/" + id + "/";
    }
    else if (document.location.href.indexOf("cables.gl") > 0 || document.location.href.indexOf("cables.local") > 0)
    {
        const parts = document.location.pathname.split("/");
        let id = patchId || parts[parts.length - 1];
        return "/assets/" + id + "/";
    }
    else if (this.config.hasOwnProperty("assetPath"))
    {
        return this.config.assetPath;
    }
    else
    {
        return "assets/";
    }
};

/**
 * get js path
 * @function getJsPath
 * @memberof Patch
 * @instance
 */
Patch.prototype.getJsPath = function ()
{
    if (this.config.hasOwnProperty("jsPath"))
    {
        return this.config.jsPath;
    }
    else
    {
        return "js/";
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
    if (!filename) return filename;
    filename = String(filename);
    if (filename.indexOf("https:") === 0 || filename.indexOf("http:") === 0) return filename;
    if (filename.indexOf("data:") === 0) return filename;
    if (filename.indexOf("file:") === 0) return filename;

    filename = filename.replace("//", "/");
    return this.config.prefixAssetPath + filename + (this.config.suffixAssetPath || "");
};

Patch.prototype.clear = function ()
{
    this.emitEvent("patchClearStart");
    this.cgl.TextureEffectMesh = null;
    this.animFrameOps.length = 0;
    this.timer = new Timer();
    while (this.ops.length > 0) this.deleteOp(this.ops[0].id);
    this.emitEvent("patchClearEnd");
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

Patch.prototype.createOp = function (identifier, id, opName = null)
{
    let op = null;
    let objName = "";

    try
    {
        if (!identifier)
        {
            console.error("createop identifier false", identifier);
            console.log((new Error()).stack);
            return;
        }
        if (identifier.indexOf("Ops.") === -1)
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
                if (opName)
                {
                    identifier = opName;
                    console.log("could not find op by id: " + opId);
                }
                else
                {
                    throw new Error("could not find op by id: " + opId);
                }
            }
        }

        if (!op)
        {
            // fallback: create by objname!
            objName = identifier;
            const parts = identifier.split(".");
            const opObj = Patch.getOpClass(objName);

            if (!opObj)
            {
                this.emitEvent("criticalError", { "title": "unknown op" + objName, "text": "unknown op: " + objName });

                this._log.error("unknown op: " + objName);
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
                else console.log("parts.length", parts.length);
            }

            if (op)
            {
                op.opId = null;
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

        this.emitEvent("exceptionOp", e, objName, op);

        if (!this.isEditorMode())
        {
            this._log.error(e);
            this._log.error("[instancing error] " + objName, e);

            if (CABLES.api) CABLES.api.sendErrorReport(e);
            this.exitError("INSTANCE_ERR", "Instancing Error 1" + objName, e);
            throw new Error("instancing error 1" + objName);
        }
    }

    if (op)
    {
        op._objName = objName;
        op.patch = this;
    }
    else
    {
        this._log.log("no op was created!?", identifier, id);
    }
    return op;
};

/**
 * create a new op in patch
 * @function addOp
 * @memberof Patch
 * @instance
 * @param {String} opIdentifier, uuid or name, e.g. Ops.Math.Sum
 * @param {Object} uiAttribs Attributes
 * @param {String} id
 * @param {boolean} fromDeserialize
 * @param {String} opName, e.g. Ops.Math.Sum
 * @example
 * // add invisible op
 * patch.addOp('Ops.Math.Sum', { showUiAttribs: false });
 */
Patch.prototype.addOp = function (opIdentifier, uiAttribs, id, fromDeserialize, opName)
{
    const op = this.createOp(opIdentifier, id, opName);

    if (op)
    {
        uiAttribs = uiAttribs || {};
        if (uiAttribs.hasOwnProperty("errors")) delete uiAttribs.errors;
        if (uiAttribs.hasOwnProperty("error")) delete uiAttribs.error;
        uiAttribs.subPatch = uiAttribs.subPatch || 0;

        op.setUiAttribs(uiAttribs);
        if (op.onCreate) op.onCreate();

        if (op.hasOwnProperty("onAnimFrame")) this.addOnAnimFrame(op);
        if (op.hasOwnProperty("onMasterVolumeChanged")) this._volumeListeners.push(op);

        if (this._opIdCache[op.id])
        {
            console.log("opid with id " + op.id + " already exists in patch!");
            // op.id += "_double";
            return;
        }

        this.ops.push(op);
        this._opIdCache[op.id] = op;

        if (this._subPatchCacheAdd) this._subPatchCacheAdd(uiAttribs.subPatch, op);
        this.emitEvent("onOpAdd", op, fromDeserialize);


        if (op.init)
        {
            op.init();
        }
        op.emitEvent("init", fromDeserialize);
    }
    else
    {
        this._log.error("addop: no op.....");
    }

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
    let found = false;
    for (const i in this.ops)
    {
        if (this.ops[i].id == opid)
        {
            const op = this.ops[i];
            let reLinkP1 = null;
            let reLinkP2 = null;

            if (op)
            {
                found = true;
                if (tryRelink)
                {
                    if (op.portsIn.length > 0 && op.portsIn[0].isLinked() && (op.portsOut.length > 0 && op.portsOut[0].isLinked()))
                    {
                        if (op.portsIn[0].getType() == op.portsOut[0].getType() && op.portsIn[0].links[0])
                        {
                            reLinkP1 = op.portsIn[0].links[0].getOtherPort(op.portsIn[0]);
                            reLinkP2 = op.portsOut[0].links[0].getOtherPort(op.portsOut[0]);
                        }
                    }
                }

                const opToDelete = this.ops[i];
                opToDelete.removeLinks();

                if (this.onDelete)
                {
                    // todo: remove
                    console.log("deprecated this.onDelete", this.onDelete);
                    this.onDelete(opToDelete);
                }

                this.ops.splice(i, 1);
                opToDelete.emitEvent("delete", this.ops[i]);
                this.emitEvent("onOpDelete", opToDelete, reloadingOp);

                if (this.clearSubPatchCache) this.clearSubPatchCache(opToDelete.uiAttribs.subPatch);

                if (opToDelete.onDelete) opToDelete.onDelete(reloadingOp);
                opToDelete.cleanUp();

                if (reLinkP1 !== null && reLinkP2 !== null)
                {
                    this.link(reLinkP1.op, reLinkP1.getName(), reLinkP2.op, reLinkP2.getName());
                }

                delete this._opIdCache[opid];
                break;
            }
        }
    }

    if (!found) console.log("core patch deleteop: not found...", opid);
};

Patch.prototype.getFrameNum = function ()
{
    return this._frameNum;
};

Patch.prototype.emitOnAnimFrameEvent = function (time, delta)
{
    time = time || this.timer.getTime();

    for (let i = 0; i < this.animFrameCallbacks.length; ++i)
    {
        if (this.animFrameCallbacks[i]) this.animFrameCallbacks[i](time, this._frameNum, delta);
    }

    for (let i = 0; i < this.animFrameOps.length; ++i)
    {
        if (this.animFrameOps[i].onAnimFrame)
        {
            this.animFrameOps[i].onAnimFrame(time, this._frameNum, delta);
        }
    }
};

Patch.prototype.renderFrame = function (timestamp)
{
    // console.log("renderframe", this._paused, this._frameNum);

    this.timer.update();
    this.freeTimer.update();
    const time = this.timer.getTime();
    const startTime = performance.now();
    this.cgl.frameStartTime = this.timer.getTime();

    const delta = timestamp - this._lastReqAnimTimeStamp || timestamp;

    this.emitOnAnimFrameEvent(null, delta);

    this.cgl.profileData.profileFrameDelta = delta;
    this._lastReqAnimTimeStamp = timestamp;
    this.cgl.profileData.profileOnAnimFrameOps = performance.now() - startTime;

    this.emitEvent("onRenderFrame", time);

    this._frameNum++;
    if (this._frameNum == 1)
    {
        if (this.config.onFirstFrameRendered) this.config.onFirstFrameRendered();
    }
};

Patch.prototype.exec = function (timestamp)
{
    if (!this._renderOneFrame && (this._paused || this.aborted)) return;
    this.emitEvent("reqAnimFrame");
    cancelAnimationFrame(this._animReq);

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
        this.renderFrame(timestamp);

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


    if (this.config.doRequestAnimation) this._animReq = this.cgl.canvas.ownerDocument.defaultView.requestAnimationFrame(this.exec.bind(this));
};

// Patch.prototype.linkPorts = function (port1, port2)
// {
//     this.link(port1.parent, port1.id, port2.parent, port2.id);
// };

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
Patch.prototype.link = function (op1, port1Name, op2, port2Name, lowerCase, fromDeserialize)
{
    if (!op1)
    {
        console.warn("link: op1 is null ");
        return;
    }
    if (!op2)
    {
        console.warn("link: op2 is null");
        return;
    }

    const port1 = op1.getPort(port1Name, lowerCase);
    const port2 = op2.getPort(port2Name, lowerCase);

    if (!port1)
    {
        console.warn("port1 not found! " + port1Name + "(" + op1.objName + ")");
        return;
    }

    if (!port2)
    {
        console.warn("port2 not found! " + port2Name + " of " + op2.name + "(" + op2.objName + ")", op2);
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

        this.emitEvent("onLink", port1, port2, link, fromDeserialize);
        return link;
    }
};

Patch.prototype.serialize = function (options)
{
    const obj = {};

    options = options || {};
    obj.ops = [];
    obj.settings = this.settings;
    for (const i in this.ops)
    {
        const op = this.ops[i];
        obj.ops.push(op.getSerialized());
    }

    cleanJson(obj);

    if (options.asObject) return obj;
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

// Patch.prototype.getOpsById = function (opIds)
// {
//     const ops = [];
//     for (const i in this.ops)
//         for (let j = 0; j < opIds.length; j++)
//             if (this.ops[i].id === opIds[j])
//             {
//                 ops.push(this.ops[i]);
//                 break;
//             }
//     return ops;
// };

Patch.prototype.getOpsByName = function (name)
{
    // TODO: is this still needed ? unclear behaviour....
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

Patch.prototype.getOpsByOpId = function (opid)
{
    const arr = [];
    for (const i in this.ops)
        if (this.ops[i].opId == opid) arr.push(this.ops[i]);
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


Patch.prototype.getSubPatchOp = function (patchId, objName)
{
    for (const i in this.ops)
        if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId && this.ops[i].objName == objName)
            return this.ops[i];
    return false;
};

// Patch.prototype.getSubPatchOuterOp = function (subPatchId) // remove !! moved to extend class
// {
//     const ops = this.ops;
//     for (let i = 0; i < ops.length; i++)
//     {
//         const op = ops[i];
//         if (op.isSubPatchOp() && op.patchId.get() == subPatchId) return op;
//     }
// };





Patch.prototype._addLink = function (opinid, opoutid, inName, outName)
{
    this.link(this.getOpById(opinid), inName, this.getOpById(opoutid), outName, false, true);
};

Patch.prototype.deSerialize = function (obj, options)
{
    options = options || { "genIds": false, "createRef": false };
    if (this.aborted) return;
    const newOps = [];
    const loadingId = this.loading.start("core", "deserialize");

    this.namespace = obj.namespace || "";
    this.name = obj.name || "";

    if (typeof obj === "string") obj = JSON.parse(obj);

    this.settings = obj.settings;

    this.emitEvent("patchLoadStart");

    if (window.logStartup)logStartup("add " + obj.ops.length + " ops... ");

    const addedOps = [];
    // add ops...
    for (let iop = 0; iop < obj.ops.length; iop++)
    {
        const start = CABLES.now();
        const opData = obj.ops[iop];
        let op = null;

        try
        {
            if (opData.opId) op = this.addOp(opData.opId, opData.uiAttribs, opData.id, true, opData.objName);
            else op = this.addOp(opData.objName, opData.uiAttribs, opData.id, true);
        }
        catch (e)
        {
            console.log("[instancing error] op data:", opData, e);
            throw new Error("could not create op by id: <b>" + (opData.objName || opData.opId) + "</b> (" + opData.id + ")");
        }

        if (op)
        {
            addedOps.push(op);
            if (options.genIds) op.id = shortId();
            op.portsInData = opData.portsIn;
            op._origData = JSON.parse(JSON.stringify(opData));
            op.storage = opData.storage;
            if (opData.hasOwnProperty("disabled"))op.setEnabled(!opData.disabled);

            for (const ipi in opData.portsIn)
            {
                const objPort = opData.portsIn[ipi];
                if (objPort && objPort.hasOwnProperty("name"))
                {
                    const port = op.getPort(objPort.name);

                    if (port && (port.uiAttribs.display == "bool" || port.uiAttribs.type == "bool") && !isNaN(objPort.value)) objPort.value = objPort.value === true;
                    if (port && objPort.value !== undefined && port.type != CONSTANTS.OP.OP_PORT_TYPE_TEXTURE) port.set(objPort.value);

                    if (port) port.deSerializeSettings(objPort);
                }
            }

            for (const ipo in opData.portsOut)
            {
                const objPort = opData.portsOut[ipo];
                if (objPort && objPort.hasOwnProperty("name"))
                {
                    const port2 = op.getPort(objPort.name);
                    if (port2 && port2.type != CONSTANTS.OP.OP_PORT_TYPE_TEXTURE && objPort.hasOwnProperty("value"))
                        port2.set(obj.ops[iop].portsOut[ipo].value);

                    if (port2 && objPort.expose) port2.setUiAttribs({ "expose": true });
                }
            }
            newOps.push(op);
        }

        const timeused = Math.round(100 * (CABLES.now() - start)) / 100;
        if (!this.silent && timeused > 5) console.log("long op init ", obj.ops[iop].objName, timeused);
    }
    if (window.logStartup)logStartup("add ops done");

    for (const i in this.ops)
    {
        if (this.ops[i].onLoadedValueSet)
        {
            this.ops[i].onLoadedValueSet(this.ops[i]._origData);
            this.ops[i].onLoadedValueSet = null;
            this.ops[i]._origData = null;
        }
        this.ops[i].emitEvent("loadedValueSet");
    }

    if (window.logStartup)logStartup("creating links");

    if (options.opsCreated)options.opsCreated(addedOps);

    // create links...
    if (obj.ops)
    {
        for (let iop = 0; iop < obj.ops.length; iop++)
        {
            if (obj.ops[iop].portsIn)
            {
                for (let ipi2 = 0; ipi2 < obj.ops[iop].portsIn.length; ipi2++)
                {
                    if (obj.ops[iop].portsIn[ipi2] && obj.ops[iop].portsIn[ipi2].links)
                    {
                        for (let ili = 0; ili < obj.ops[iop].portsIn[ipi2].links.length; ili++)
                        {
                            let found = false;

                            this._addLink(
                                obj.ops[iop].portsIn[ipi2].links[ili].objIn,
                                obj.ops[iop].portsIn[ipi2].links[ili].objOut,
                                obj.ops[iop].portsIn[ipi2].links[ili].portIn,
                                obj.ops[iop].portsIn[ipi2].links[ili].portOut);

                            // const took = performance.now - startTime;
                            // if (took > 100)console.log(obj().ops[iop].portsIn[ipi2].links[ili].objIn, obj.ops[iop].portsIn[ipi2].links[ili].objOut, took);
                        }
                    }
                }
            }
            if (obj.ops[iop].portsOut)
                for (let ipi2 = 0; ipi2 < obj.ops[iop].portsOut.length; ipi2++)
                    if (obj.ops[iop].portsOut[ipi2] && obj.ops[iop].portsOut[ipi2].links)
                    {
                        for (let ili = 0; ili < obj.ops[iop].portsOut[ipi2].links.length; ili++)
                        {
                            if (obj.ops[iop].portsOut[ipi2].links[ili])
                            {
                                if (obj.ops[iop].portsOut[ipi2].links[ili].subOpRef)
                                {
                                    // lost link
                                    const outOp = this.getOpById(obj.ops[iop].portsOut[ipi2].links[ili].objOut);
                                    let dstOp = null;
                                    let theSubPatch = 0;

                                    for (let i = 0; i < this.ops.length; i++)
                                    {
                                        if (
                                            this.ops[i].storage &&
                                            this.ops[i].storage.ref == obj.ops[iop].portsOut[ipi2].links[ili].subOpRef &&
                                            outOp.uiAttribs.subPatch == this.ops[i].uiAttribs.subPatch
                                        )
                                        {
                                            theSubPatch = this.ops[i].patchId.get();
                                            break;
                                        }
                                    }

                                    for (let i = 0; i < this.ops.length; i++)
                                    {
                                        if (
                                            this.ops[i].storage &&
                                            this.ops[i].storage.ref == obj.ops[iop].portsOut[ipi2].links[ili].refOp &&
                                            this.ops[i].uiAttribs.subPatch == theSubPatch)
                                        {
                                            dstOp = this.ops[i];
                                            break;
                                        }
                                    }

                                    if (!dstOp) this._log.warn("could not find op for lost link");
                                    else
                                        this._addLink(
                                            dstOp.id,
                                            obj.ops[iop].portsOut[ipi2].links[ili].objOut,

                                            obj.ops[iop].portsOut[ipi2].links[ili].portIn,
                                            obj.ops[iop].portsOut[ipi2].links[ili].portOut);
                                }
                                else
                                {
                                    this._addLink(obj.ops[iop].portsOut[ipi2].links[ili].objIn, obj.ops[iop].portsOut[ipi2].links[ili].objOut, obj.ops[iop].portsOut[ipi2].links[ili].portIn, obj.ops[iop].portsOut[ipi2].links[ili].portOut);
                                }
                            }
                        }
                    }
        }
    }

    if (window.logStartup)logStartup("calling ops onloaded");

    for (const i in this.ops)
    {
        if (this.ops[i].onLoaded)
        {
            // TODO: deprecate!!!
            this.ops[i].onLoaded();
            this.ops[i].onLoaded = null;
        }
    }

    if (window.logStartup)logStartup("initializing ops...");
    for (const i in this.ops)
    {
        if (this.ops[i].init)
        {
            this.ops[i].init();
            this.ops[i].init = null;
        }
    }

    if (window.logStartup)logStartup("initializing vars...");

    if (this.config.variables)
        for (const varName in this.config.variables)
            this.setVarValue(varName, this.config.variables[varName]);

    if (window.logStartup)logStartup("initializing var ports");

    for (const i in this.ops)
    {
        this.ops[i].initVarPorts();
        delete this.ops[i].uiAttribs.pasted;
    }

    setTimeout(() => { this.loading.finished(loadingId); }, 100);

    if (window.logStartup)logStartup("calling onPatchLoaded/patchLoadEnd");

    if (this.config.onPatchLoaded) this.config.onPatchLoaded(this);

    this.deSerialized = true;
    this.emitEvent("patchLoadEnd", newOps, obj, options.genIds);
};

Patch.prototype.profile = function (enable)
{
    this.profiler = new Profiler(this);
    for (const i in this.ops)
    {
        this.ops[i].profile(enable);
    }
};

// ----------------------

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
    // if (this._variables.hasOwnProperty(name))
    if (this._variables[name] !== undefined)
    {
        this._variables[name].setValue(val);
    }
    else
    {
        console.log("variable " + name + " not found!");
    }
};

Patch.prototype._sortVars = function ()
{
    if (!this.isEditorMode()) return;
    const ordered = {};
    Object.keys(this._variables).sort(
        (a, b) =>
        { return a.localeCompare(b, "en", { "sensitivity": "base" }); }
    ).forEach((key) =>
    {
        ordered[key] = this._variables[key];
    });
    this._variables = ordered;
};

/**
 * has variable
 * @function hasVariable
 * @memberof Patch
 * @instance
 * @param {String} name of variable
 */
Patch.prototype.hasVar = function (name)
{
    return this._variables[name] !== undefined;

    // return this._variables.hasOwnProperty(name);
};

// used internally
Patch.prototype.setVarValue = function (name, val, type)
{
    if (this.hasVar(name))
    {
        this._variables[name].setValue(val);
    }
    else
    {
        this._variables[name] = new PatchVariable(name, val, type);
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


Patch.prototype.deleteVar = function (name)
{
    for (let i = 0; i < this.ops.length; i++)
        for (let j = 0; j < this.ops[i].portsIn.length; j++)
            if (this.ops[i].portsIn[j].getVariableName() == name)
                this.ops[i].portsIn[j].setVariable(null);

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
Patch.prototype.getVars = function (t)
{
    if (t === undefined) return this._variables;

    const vars = [];
    if (t == CABLES.OP_PORT_TYPE_STRING) t = "string";
    if (t == CABLES.OP_PORT_TYPE_VALUE) t = "number";
    if (t == CABLES.OP_PORT_TYPE_ARRAY) t = "array";
    if (t == CABLES.OP_PORT_TYPE_OBJECT) t = "object";

    for (const i in this._variables)
    {
        if (!this._variables[i].type || this._variables[i].type == t) vars.push(this._variables[i]);
    }
    return vars;
};

/**
 * @function exitError
 * @memberof Patch
 * @instance
 * @description cancel patch execution and quit showing an errormessage
 * @function
 */
Patch.prototype.exitError = function (errorId, errorMessage, ex)
{
    this.aborted = true;

    if (this && this.config && this.config.onError)
    {
        this.config.onError(errorId, errorMessage);
    }
    else
    {
        if (!this.isEditorMode())
        {
            const newDiv = document.createElement("div");

            const rect = this.cgl.canvas.getBoundingClientRect();

            newDiv.setAttribute("style", "position:absolute;border:5px solid red;padding:15px;background-color:black;color:white;font-family:monospace;");
            newDiv.style.top = rect.top + "px";
            newDiv.style.left = rect.left + "px";
            let str = "cables - An error occured:<br/>";
            str += "[" + errorId + "] - " + errorMessage;
            if (ex)str += "<br/>Exception: " + ex.message;
            newDiv.innerHTML = str;

            const pe = this.cgl.canvas.parentElement;

            while (pe.hasChildNodes()) pe.removeChild(pe.lastChild);

            document.body.appendChild(newDiv);
        }
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
    this._log.log("prerendering...");

    for (let i = 0; i < this.ops.length; i++)
    {
        if (this.ops[i].preRender)
        {
            this.ops[i].preRender();
            this._log.log("prerender " + this.ops[i].objName);
        }
    }
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
    this.cgl.dispose();
};

Patch.prototype.pushTriggerStack = function (p)
{
    this._triggerStack.push(p);
};

Patch.prototype.popTriggerStack = function ()
{
    this._triggerStack.pop();
};

Patch.prototype.printTriggerStack = function ()
{
    if (this._triggerStack.length == 0)
    {
        // console.log("stack length", this._triggerStack.length); // eslint-disable-line
        return;
    }
    console.groupCollapsed( // eslint-disable-line
        "trigger port stack " + this._triggerStack[this._triggerStack.length - 1].op.name + "." + this._triggerStack[this._triggerStack.length - 1].name,
    );

    const rows = [];
    for (let i = 0; i < this._triggerStack.length; i++)
    {
        rows.push(i + ". " + this._triggerStack[i].op.name + " " + this._triggerStack[i].name);
    }

    console.table(rows); // eslint-disable-line
    console.groupEnd(); // eslint-disable-line
};

/**
 * returns document object of the patch could be != global document object when opening canvas ina popout window
 * @function getDocument
 * @memberof Patch
 * @instance
 * @return {Object} document
 */
Patch.prototype.getDocument = function ()
{
    return this.cgl.canvas.ownerDocument;
};

Patch.replaceOpIds = function (json, options)
{
    const opids = {};
    for (const i in json.ops)
    {
        opids[json.ops[i].id] = json.ops[i];
    }

    for (const j in json.ops)
    {
        for (const k in json.ops[j].portsOut)
        {
            const links = json.ops[j].portsOut[k].links;
            if (links)
            {
                let l = links.length;

                while (l--)
                {
                    if (links[l] && (!opids[links[l].objIn] || !opids[links[l].objOut]))
                    {
                        if (!options.doNotUnlinkLostLinks)
                        {
                            links.splice(l, 1);
                        }
                        else
                        {
                            if (options.fixLostLinks)
                            {
                                // console.log("lost link...?", links[l]);
                                const op = gui.corePatch().getOpById(links[l].objIn);
                                if (!op) console.log("op not found!");
                                else
                                {
                                    const outerOp = gui.patchView.getSubPatchOuterOp(op.uiAttribs.subPatch);
                                    if (outerOp)
                                    {
                                        op.storage = op.storage || {};
                                        op.storage.ref = op.storage.ref || CABLES.shortId();
                                        links[l].refOp = op.storage.ref;
                                        links[l].subOpRef = outerOp.storage.ref;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }



    for (const i in json.ops)
    {
        const op = json.ops[i];
        const oldId = op.id;
        let newId = CABLES.shortId();

        if (options.prefixHash) newId = prefixedHash(options.prefixHash + oldId);

        else if (options.prefixId) newId = options.prefixId + oldId;
        else if (options.refAsId) // when saving json
        {
            if (op.storage && op.storage.ref)
            {
                newId = op.storage.ref;
                delete op.storage.ref;
            }
            else
            {
                op.storage = op.storage || {};
                op.storage.ref = newId = CABLES.shortId();
            }
        }

        const newID = op.id = newId;

        if (options.oldIdAsRef) // when loading json
        {
            op.storage = op.storage || {};
            op.storage.ref = oldId;
        }

        for (const j in json.ops)
        {
            if (json.ops[j].portsIn)
                for (const k in json.ops[j].portsIn)
                {
                    if (json.ops[j].portsIn[k].links)
                    {
                        let l = json.ops[j].portsIn[k].links.length;

                        while (l--) if (json.ops[j].portsIn[k].links[l] === null) json.ops[j].portsIn[k].links.splice(l, 1);

                        for (l in json.ops[j].portsIn[k].links)
                        {
                            if (json.ops[j].portsIn[k].links[l].objIn === oldId) json.ops[j].portsIn[k].links[l].objIn = newID;
                            if (json.ops[j].portsIn[k].links[l].objOut === oldId) json.ops[j].portsIn[k].links[l].objOut = newID;
                        }
                    }
                }

            if (json.ops[j].portsOut)
                for (const k in json.ops[j].portsOut)
                {
                    if (json.ops[j].portsOut[k].links)
                    {
                        let l = json.ops[j].portsOut[k].links.length;

                        while (l--) if (json.ops[j].portsOut[k].links[l] === null) json.ops[j].portsOut[k].links.splice(l, 1);

                        for (l in json.ops[j].portsOut[k].links)
                        {
                            if (json.ops[j].portsOut[k].links[l].objIn === oldId) json.ops[j].portsOut[k].links[l].objIn = newID;
                            if (json.ops[j].portsOut[k].links[l].objOut === oldId) json.ops[j].portsOut[k].links[l].objOut = newID;
                        }
                    }
                }
        }
    }

    // set correct subpatch
    const subpatchIds = [];
    const fixedSubPatches = [];

    for (let i = 0; i < json.ops.length; i++)
    {
        // if (CABLES.Op.isSubPatchOpName(json.ops[i].objName))
        if (json.ops[i].storage && json.ops[i].storage.subPatchVer)
        {
            for (const k in json.ops[i].portsIn)
            {
                if (json.ops[i].portsIn[k].name === "patchId")
                {
                    let newId = shortId();

                    if (options.prefixHash) newId = prefixedHash(options.prefixHash + json.ops[i].portsIn[k].value);

                    const oldSubPatchId = json.ops[i].portsIn[k].value;
                    const newSubPatchId = json.ops[i].portsIn[k].value = newId;

                    subpatchIds.push(newSubPatchId);

                    for (let j = 0; j < json.ops.length; j++)
                    {
                        // op has no uiAttribs in export, we don't care about subpatches in export though
                        if (json.ops[j].uiAttribs)
                        {
                            if (json.ops[j].uiAttribs.subPatch === oldSubPatchId)
                            {
                                json.ops[j].uiAttribs.subPatch = newSubPatchId;
                                fixedSubPatches.push(json.ops[j].id);
                            }
                        }
                    }
                }
            }
        }
    }

    for (const kk in json.ops)
    {
        let found = false;
        for (let j = 0; j < fixedSubPatches.length; j++)
        {
            if (json.ops[kk].id === fixedSubPatches[j])
            {
                found = true;
                break;
            }
        }
        // op has no uiAttribs in export, we don't care about subpatches in export though
        if (!found && json.ops[kk].uiAttribs && options.parentSubPatchId != null)
            json.ops[kk].uiAttribs.subPatch = options.parentSubPatchId;
    }

    return json;
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
 * @property {String} [prefixAssetPath=''] prefix for path to assets
 * @property {String} [assetPath=''] path to assets
 * @property {String} [jsPath=''] path to javascript files
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

