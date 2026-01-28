import { Events, Logger } from "cables-shared-client";
import { ajax, prefixedHash, cleanJson, shortId, map } from "./utils.js";
import { LoadingStatus } from "./loadingstatus.js";
import { Link } from "./core_link.js";
import { Profiler } from "./core_profiler.js";
import { PatchVariable } from "./core_variable.js";
import { Op } from "./core_op.js";
import { Port } from "./core_port.js";
import { Timer } from "./timer.js";
import { RenderLoop } from "./renderloop.js";

/** @global CABLES.OPS  */

/**
 * @typedef {import("./core_op.js").OpUiAttribs} OpUiAttribs
 */

/**
 * @typedef PatchConfig
 * @property {String} [prefixAssetPath=''] prefix for path to assets
 * @property {String} [assetPath=''] path to assets
 * @property {String} [jsPath=''] path to javascript files
 * @property {String} [glCanvasId='glcanvas'] dom element id of canvas element
 * @property {Function} [onError=null] called when an error occurs
 * @property {Function} [onFinishedLoading=null] called when patch finished loading all assets
 * @property {Function} [onFirstFrameRendered=null] called when patch rendered it's first frame
 * @property {Boolean} [glCanvasResizeToWindow=false] resize canvas automatically to window size
 * @property {Boolean} [glCanvasResizeToParent] resize canvas automatically to parent element
 * @property {Boolean} [doRequestAnimation=true] do requestAnimationFrame set to false if you want to trigger exec() from outside (only do if you know what you are doing)
 * @property {Boolean} [clearCanvasColor=true] clear canvas in transparent color every frame
 * @property {Boolean} [clearCanvasDepth=true] clear depth every frame
 * @property {Boolean} [glValidateShader=true] enable/disable validation of shaders *
 * @property {Boolean} [silent=false]
 * @property {Number} [fpsLimit=0] 0 for maximum possible frames per second
 * @property {String} [glslPrecision='mediump'] default precision for glsl shader
 * @property {String} [prefixJsPath]
 * @property {Function} [onPatchLoaded]
 * @property {Object} [canvas]
 * @property {Object} [patch]
 * @property {String} [patchFile]
 * @property {String} [subPatch] internal use
 * @property {Number} [masterVolume] 0 for maximum possible frames per second
 * @property {HTMLCanvasElement} [glCanvas]
 * @property {HTMLElement} [containerElement]
 * @property {boolean} [editorMode]
 * @property {Object} [variables] object of key value pairs, that initialize variables
*/

/**
 * @typedef CoreOp
 * @type Op
 */

/**
 * @template T Op
 *
 * Patch class, contains all operators,values,links etc. manages loading and running of the whole patch
 *
 * see {@link PatchConfig}
 *
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
export class Patch extends Events
{
    static EVENT_OP_DELETED = "onOpDelete";
    static EVENT_OP_ADDED = "onOpAdd";
    static EVENT_PAUSE = "pause";
    static EVENT_RESUME = "resume";
    static EVENT_PATCHLOADEND = "patchLoadEnd";
    static EVENT_VARIABLES_CHANGED = "variablesChanged";
    static EVENT_RENDER_FRAME = "onRenderFrame";
    static EVENT_RENDERED_ONE_FRAME = "renderedOneFrame";
    static EVENT_LINK = "onLink";
    static EVENT_VALUESSET = "loadedValueSet";
    static EVENT_DISPOSE = "dispose";
    static EVENT_ANIM_MAXTIME_CHANGE = "animmaxtimechange";
    static EVENT_INIT_CGL = "INIT_CGL";

    #log;
    #renderOneFrame = false;
    #initialDeserialize = true;

    /** @type {Array<Op>} */
    ops = [];
    settings = {};
    animMaxTime = 0;
    missingClipAnims = {};

    profiler = null;
    aborted = false;
    _crashedOps = [];
    animFrameOps = [];
    _animReq = null;
    _opIdCache = {};
    _triggerStack = [];
    storeObjNames = false; // remove after may release
    _volumeListeners = [];
    namedTriggers = {};

    _origData = null;
    tempData = {};
    frameStore = {};

    /** @param {PatchConfig} cfg */
    constructor(cfg)
    {
        super();

        /** @type {RenderLoop} */
        this.renderloop = null;

        /** @type {PatchConfig} */
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

        this.#log = new Logger("core_patch", { "onError": cfg.onError });
        this.timer = new Timer();
        this.freeTimer = new Timer();
        this.gui = null;
        CABLES.logSilent = this.silent = true;

        /** @type {LoadingStatus} */
        this.loading = new LoadingStatus(this);

        /* minimalcore:start */
        if (!(function () { return !this; }())) this.#log.warn("not in strict mode: core patch");

        if (this.config.hasOwnProperty("silent")) this.silent = CABLES.logSilent = this.config.silent;
        if (!this.config.hasOwnProperty("doRequestAnimation")) this.config.doRequestAnimation = true;

        if (!this.config.prefixAssetPath) this.config.prefixAssetPath = "";
        if (!this.config.prefixJsPath) this.config.prefixJsPath = "";
        if (!this.config.masterVolume) this.config.masterVolume = 1.0;

        /* minimalcore:end */

        /** @type {Object<string,PatchVariable>} */
        this._variables = {};

        this.vars = {};
        if (cfg && cfg.vars) this.vars = cfg.vars; // vars is old!

        this.cgl = null;// new CGL.Context(this);
        this.cgp = null;

        this._subpatchOpCache = {};
        window.dispatchEvent(new CustomEvent(Patch.EVENT_INIT_CGL, { "detail": this }));

        this.loading.setOnFinishedLoading(this.config.onFinishedLoading);

        if (!CABLES.OPS)
        {
            this.aborted = true;
            throw new Error("no CABLES.OPS found");
        }

        this.freeTimer.play();
        // if (this.renderloop) this.renderloop.exec(0);

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
                    try
                    {
                        const data = JSON.parse(_data);
                        if (err)
                        {
                            const txt = "";
                            this.#log.error("err", err);
                            this.#log.error("data", data);
                            this.#log.error("data", data.msg);
                            return;
                        }
                        this.deSerialize(data);
                    }
                    catch (e)
                    {
                        this.#log.error("could not load/parse patch ", e);
                    }
                }
            );
        }
        this.timer.play();

        console.log("made with https://cables.gl"); // eslint-disable-line
        this.cg = undefined;
    }

    /* minimalcore:start */
    static getGui()
    {
        // @ts-ignore
        return window.gui;
    }

    /* minimalcore:end */

    isPlaying()
    {
        if (this.renderloop) return !this.renderloop.paused;
        return false;
    }

    /** @deprecated */
    renderOneFrame()
    {
    }

    /**
     * returns true if patch is opened in editor/gui mode
     * @return {Boolean} editor mode
     */
    isEditorMode()
    {
        return this.config.editorMode === true;
    }

    /**
     * pauses patch execution
     */
    pause()
    {
        this.emitEvent(Patch.EVENT_PAUSE);
        if (this.renderloop) this.renderloop.pause();
        this.freeTimer.pause();
    }

    /**
     * resumes patch execution
     */
    resume()
    {
        this.freeTimer.play();
        this.emitEvent(Patch.EVENT_RESUME);
        if (this.renderloop) this.renderloop.resume();
    }

    /**
     * set volume [0-1]
     * @param {Number} v volume
     */
    setVolume(v)
    {
        this.config.masterVolume = v;
        for (let i = 0; i < this._volumeListeners.length; i++) this._volumeListeners[i].onMasterVolumeChanged(v);
    }

    /**
     * get asset path
     * @returns {string}
     */
    getAssetPath(patchId = null)
    {
        if (this.config.hasOwnProperty("assetPath"))
        {
            return this.config.assetPath;
        }
        else if (this.isEditorMode())
        {
            let id = patchId || Patch.getGui().project()._id;
            return "/assets/" + id + "/";
        }
        else if (document.location.href.indexOf("cables.gl") > 0 || document.location.href.indexOf("cables.local") > 0)
        {
            const parts = document.location.pathname.split("/");
            let id = patchId || parts[parts.length - 1];
            return "/assets/" + id + "/";
        }
        else
        {
            return "assets/";
        }
    }

    /**
     * get js path
     * @returns {string}
     */
    getJsPath()
    {
        if (this.config.hasOwnProperty("jsPath"))
        {
            return this.config.jsPath;
        }
        else
        {
            return "js/";
        }
    }

    /**
     * get url/filepath for a filename
     * this uses prefixAssetpath in exported patches
     * @param {String} filename
     * @return {String} url
     */
    getFilePath(filename)
    {
        if (!filename) return filename;
        filename = String(filename);
        if (filename.indexOf("https:") === 0 || filename.indexOf("http:") === 0) return filename;
        if (filename.indexOf("data:") === 0) return filename;
        if (filename.indexOf("file:") === 0) return filename;
        filename = filename.replace("//", "/");
        if (filename.startsWith(this.config.prefixAssetPath)) filename = filename.replace(this.config.prefixAssetPath, "");
        return this.config.prefixAssetPath + filename + (this.config.suffixAssetPath || ""); //
    }

    clear()
    {
        this.emitEvent("patchClearStart");
        this.animFrameOps.length = 0;
        this.timer = new Timer();
        while (this.ops.length > 0) this.deleteOp(this.ops[0].id);

        this._opIdCache = {};
        this.emitEvent("patchClearEnd");
    }

    /**
     * @param {string} identifier
     * @param {string} id
     * @param {string} [opName]
     * @returns {Op}
     */
    createOp(identifier, id, opName = null)
    {

        /**
         * @type {Op}
         */
        let op = null;
        let objName = "";

        try
        {
            if (!identifier)
            {
                console.error("createop identifier false", identifier);// eslint-disable-line
                console.log((new Error()).stack);// eslint-disable-line
                return;
            }
            if (identifier.indexOf("Ops.") === -1)
            {

                /*
                 * this should be a uuid, not a namespace
                 * creating ops by id should be the default way from now on!
                 */
                const opId = identifier;

                if (CABLES.OPS[opId])
                {
                    objName = CABLES.OPS[opId].objName;
                    try
                    {
                        op = new CABLES.OPS[opId].f(this, objName, id, opId);
                    }
                    catch (e)
                    {
                        this._crashedOps.push(objName);
                        this.#log.error("[instancing error] constructor: " + objName, e);

                        /* minimalcore:start */
                        if (!this.isEditorMode())
                        {
                            this.#log.error("INSTANCE_ERR", "Instancing Error: " + objName, e);
                        }
                        else
                        {
                            // construct a "empty" op, use CABLES.Op here to get UiOp class in editor
                            op = new CABLES.Op(this, objName, id);
                            op.setUiError("instancingError", "Failed to instanciate op", 3);
                            op.setEnabled(false);
                            if (this.#initialDeserialize) Patch.getGui().patchView.store.opCrashed = true;
                        }

                        /* minimalcore:end */
                    }
                    op.opId = opId;
                }
                else
                {
                    if (opName)
                    {
                        identifier = opName;
                        this.#log.warn("could not find op by id: " + opId);
                    }
                    else
                    {
                        throw new Error("could not find op by id: " + opId, { "cause": "opId:" + opId });
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
                    this.emitEvent("criticalError", { "title": "Unknown op: " + objName, "text": "Unknown op: " + objName });

                    this.#log.error("unknown op: " + objName);
                    throw new Error("unknown op: " + objName);
                }
                else
                {
                    op = new opObj(this, objName, id);
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

            this.#log.error("[instancing error] " + objName, e);

            /* minimalcore:start */
            if (!this.isEditorMode())
            {
                this.#log.error("INSTANCE_ERR", "Instancing Error: " + objName, e);

                // throw new Error("instancing error 1" + objName);
            }
            else
            {
                if (this.#initialDeserialize) Patch.getGui().patchView.store.opCrashed = true;
            }

            /* minimalcore:end */
        }

        if (op)
        {
            op._objName = objName;
            op.patch = this;
        }
        else
        {
            this.#log.log("no op was created!?", identifier, id);
        }
        return op;
    }

    /**
     * create a new op in patch
     * @param {string} opIdentifier uuid or name, e.g. Ops.Math.Sum
     * @param {OpUiAttribs} uiAttribs Attributes
     * @param {string} [id]
     * @param {boolean} [fromDeserialize]
     * @param {string} [opName] e.g. Ops.Math.Sum
     * @example
     * // add invisible op
     * patch.addOp('Ops.Math.Sum', { showUiAttribs: false });
     */
    addOp(opIdentifier, uiAttribs, id, fromDeserialize = false, opName = null)
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

            if (op.hasOwnProperty("onAnimFrame") && op.onAnimFrame) this.addOnAnimFrame(op);
            if (op.hasOwnProperty("onMasterVolumeChanged")) this._volumeListeners.push(op);

            if (this._opIdCache[op.id])
            {
                this.#log.warn("opid with id " + op.id + " already exists in patch!");
                this.deleteOp(op.id); // strange with subpatch ops: why is this needed, somehow ops get added twice ???.....
                // return;
            }

            this.ops.push(op);
            this._opIdCache[op.id] = op;

            if (this._subPatchCacheAdd) this._subPatchCacheAdd(uiAttribs.subPatch, op);
            this.emitEvent(Patch.EVENT_OP_ADDED, op, fromDeserialize);

            if (op.init) op.init();

            op.emitEvent(Op.EVENT_INIT, fromDeserialize);
        }
        else
        {
            this.#log.error("addop: op could not be created: ", opIdentifier);
        }

        return op;
    }

    /**
     * @param {Op} op
     */
    addOnAnimFrame(op)
    {
        for (let i = 0; i < this.animFrameOps.length; i++) if (this.animFrameOps[i] == op) { return; }

        this.animFrameOps.push(op);
    }

    /**
     * @param {Op} op
     */
    removeOnAnimFrame(op)
    {
        for (let i = 0; i < this.animFrameOps.length; i++)
        {
            if (this.animFrameOps[i] == op)
            {
                this.animFrameOps.splice(i, 1);
                return;
            }
        }
    }

    /**
     * @param {function} cb
     */
    addOnAnimFrameCallback(cb)
    {
        this.animFrameCallbacks.push(cb);
    }

    /**
     * @param {function} cb
     */
    removeOnAnimCallback(cb)
    {
        for (let i = 0; i < this.animFrameCallbacks.length; i++)
        {
            if (this.animFrameCallbacks[i] == cb)
            {
                this.animFrameCallbacks.splice(i, 1);
                return;
            }
        }
    }

    updateAnimMaxTimeSoon()
    {
        if (this.toAnimMaxTime)clearTimeout(this.toAnimMaxTime);
        this.toAnimMaxTime = setTimeout(() =>
        {
            this.updateAnimMaxTime();
        }, 50);
    }

    updateAnimMaxTime()
    {
        let maxTime = 0;
        for (let i = 0; i < this.ops.length; i++)
        {
            if (this.ops[i].hasAnimPort)
            {
                for (let j = 0; j < this.ops[i].portsIn.length; j++)
                {
                    if (this.ops[i].portsIn[j].anim)
                    {
                        if (this.ops[i].portsIn[j].anim.lastKey && this.ops[i].portsIn[j].anim.lastKey.time > maxTime)
                        {
                            maxTime = this.ops[i].portsIn[j].anim.lastKey.time;
                        }
                    }
                }
            }
        }
        if (maxTime != this.animMaxTime)
        {
            this.animMaxTime = maxTime;
            this.emitEvent(Patch.EVENT_ANIM_MAXTIME_CHANGE);
        }
    }

    // @todo move to ui ?
    /**
     * @param {string} opid
     * @param {boolean} [tryRelink]
     * @param {boolean} [reloadingOp]
     */
    deleteOp(opid, tryRelink, reloadingOp)
    {
        let found = false;
        for (let i = 0; i < this.ops.length; i++)
        {
            if (this.ops[i].id == opid)
            {
                const op = this.ops[i];

                /** @type {Port} */
                let reLinkP1 = null;

                /** @type {Port} */
                let reLinkP2 = null;

                if (op)
                {
                    found = true;

                    /* minimalcore:start */
                    if (tryRelink)
                    {
                        if (op.portsIn.length > 0 && op.getFirstPortIn() && op.getFirstPortIn().isLinked() && (op.portsOut.length > 0 && op.getFirstPortOut() && op.getFirstPortOut().isLinked()))
                        {
                            if (op.getFirstPortIn().getType() == op.getFirstPortOut().getType() &&
                                op.getFirstPortIn().isLinked())
                            {
                                reLinkP1 = op.getFirstPortIn()?.links[0]?.getOtherPort(op.getFirstPortIn());
                                reLinkP2 = op.getFirstPortOut()?.links[0]?.getOtherPort(op.getFirstPortOut());
                            }
                        }
                    }

                    /* minimalcore:end */

                    const opToDelete = this.ops[i];
                    opToDelete.removeLinks();

                    this.ops.splice(i, 1);
                    opToDelete.emitEvent("delete", opToDelete);
                    this.emitEvent(Patch.EVENT_OP_DELETED, opToDelete, reloadingOp);

                    if (this.clearSubPatchCache) this.clearSubPatchCache(opToDelete.uiAttribs.subPatch);

                    if (opToDelete.onDelete) opToDelete.onDelete(reloadingOp);
                    opToDelete.cleanUp();

                    /* minimalcore:start */
                    if (reLinkP1 && reLinkP2 && reLinkP1.op && reLinkP2.op)
                    {
                        this.link(reLinkP1.op, reLinkP1.getName(), reLinkP2.op, reLinkP2.getName());
                    }

                    /* minimalcore:end */

                    delete this._opIdCache[opid];
                    break;
                }
            }
        }

        if (!found) this.#log.warn("core patch deleteop: not found...", opid);
    }

    getFrameNum()
    {
        if (this.renderloop) return this.renderloop.frameNum;
    }

    /**
     * @param {number} [time]
     * @param {number} [delta]
     * @param {number} [timestamp]
     */
    updateAnims(time, delta, timestamp)
    {
        if (!this.renderloop) return;
        this.timer.update(timestamp);
        this.freeTimer.update(timestamp);

        time = time || this.timer.getTime();

        for (let i = 0; i < this.animFrameOps.length; ++i)
            if (this.animFrameOps[i].onAnimFrame)
                this.animFrameOps[i].onAnimFrame(time, this.renderloop.frameNum, delta);
    }

    /**
     * link two ops/ports
     * @param {Op} op1
     * @param {String} port1Name
     * @param {Op} op2
     * @param {String} port2Name
     * @param {boolean} lowerCase
     * @param {boolean} fromDeserialize
     */
    link(op1, port1Name, op2, port2Name, lowerCase = false, fromDeserialize = false)
    {

        /* minimalcore:start */
        if (!op1) return this.#log.warn("link: op1 is null ");
        if (!op2) return this.#log.warn("link: op2 is null");

        /* minimalcore:end */

        const port1 = op1.getPort(port1Name, lowerCase);
        const port2 = op2.getPort(port2Name, lowerCase);

        /* minimalcore:start */
        if (!port1) return this.#log.warn("port1 not found! " + port1Name + " (" + op1.objName + ")");
        if (!port2) return this.#log.warn("port2 not found! " + port2Name + " of " + op2.name + "(" + op2.objName + ")", op2);

        if (!port1.shouldLink(port1, port2) || !port2.shouldLink(port1, port2)) return false;

        /* minimalcore:end */
        if (Link.canLink(port1, port2))
        {
            const link = new Link(this);
            if (port1 && port2)
                link.link(port1, port2);

            this.emitEvent(Patch.EVENT_LINK, port1, port2, link, fromDeserialize);
            return link;
        }
    }

    /**
     * @param {Object} options
     * @returns {Object|String}
     */
    serialize(options)
    {

        /* minimalcore:start */
        const obj = {};

        options = options || {};
        obj.ops = [];
        obj.settings = this.settings;
        for (let i = 0; i < this.ops.length; i++)
        {
            const op = this.ops[i];
            if (op && op.getSerialized)obj.ops.push(op.getSerialized());
        }

        cleanJson(obj);

        if (options.asObject) return obj;
        return JSON.stringify(obj);

        /* minimalcore:end */
    }

    /* minimalcore:start */
    getOpsByRefId(refId) // needed for instancing ops ?
    {

        // const perf = Patch.getGui().uiProfiler.start("[corepatchetend] getOpsByRefId");
        const refOps = [];
        // const ops = gui.corePatch().ops;
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].storage && this.ops[i].storage.ref == refId) refOps.push(this.ops[i]);
        // perf.finish();
        return refOps;
    }

    /* minimalcore:end */

    /**
     * @param {String} opid
     * @returns {T}
     */
    getOpById(opid)
    {
        return this._opIdCache[opid];
    }

    /**
     * @param {String} name
     */
    getOpsByObjName(name)
    {
        const arr = [];
        // for (const i in this.ops
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].objName == name) arr.push(this.ops[i]);
        return arr;
    }

    /**
     * @param {String} opid
     */
    getOpsByOpId(opid)
    {
        const arr = [];
        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].opId == opid) arr.push(this.ops[i]);
        return arr;
    }

    getSubPatchOpsByName(patchId, objName)
    {
        const arr = [];
        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId && this.ops[i].objName == objName)
                arr.push(this.ops[i]);

        return arr;
    }

    getSubPatchOp(patchId, objName)
    {
        return this.getFirstSubPatchOpByName(patchId, objName);
    }

    /**
     * @param {string} patchId
     * @param {string} objName
     * @returns {Op}
     */
    getFirstSubPatchOpByName(patchId, objName)
    {
        for (let i = 0; i < this.ops.length; i++)
            if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId && this.ops[i].objName == objName)
                return this.ops[i];

        return null;
    }

    _addLink(opinid, opoutid, inName, outName)
    {
        return this.link(this.getOpById(opinid), inName, this.getOpById(opoutid), outName, false, true);
    }

    /**
     * @param {String} s
     */
    logStartup(s)
    {
        if (window.logStartup)window.logStartup(s);
    }

    /**
     * @typedef DeserializeOptions
     * @property {boolean} [genIds]
     * @property {boolean} [createRef]
     */

    /**
     * Description
     * @param {Object} obj
     * @param {DeserializeOptions} options
     * @returns {any}
     */
    deSerialize(obj, options = { "genIds": false, "createRef": false })
    {
        if (this.aborted) return;
        const newOps = [];
        const loadingId = this.loading.start("core", "deserialize");

        if (typeof obj === "string") obj = JSON.parse(obj);

        if (this.#initialDeserialize)
        {
            this.namespace = obj.namespace || "";
            this.name = obj.name || "";
            this.settings = obj.settings;
        }

        this.emitEvent("patchLoadStart");

        obj.ops = obj.ops || [];

        this.logStartup("add " + obj.ops.length + " ops... ");

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
                this.#log.error("[instancing error] op data:", opData, e);
                // throw new Error("could not create op by id: <b>" + (opData.objName || opData.opId) + "</b> (" + opData.id + ")");
            }

            if (op)
            {
                addedOps.push(op);
                if (options.genIds) op.id = shortId();
                op.portsInData = opData.portsIn;
                op._origData = structuredClone(opData);
                op.storage = opData.storage;
                // if (opData.hasOwnProperty("disabled"))op.setEnabled(!opData.disabled);

                // for (const ipi in opData.portsIn)
                if (opData.portsIn)
                    for (let ipi = 0; ipi < opData.portsIn.length; ipi++)
                    {
                        const objPort = opData.portsIn[ipi];
                        if (objPort && objPort.hasOwnProperty("name"))
                        {
                            const port = op.getPort(objPort.name);

                            if (port && (port.uiAttribs.display == "bool" || port.uiAttribs.type == "bool") && !isNaN(objPort.value)) objPort.value = objPort.value == true ? 1 : 0;
                            if (port && objPort.value !== undefined && port.type != Port.TYPE_TEXTURE) port.set(objPort.value);

                            if (port)
                            {
                                port.deSerializeSettings(objPort);
                            }
                            else
                            {
                                op.preservedPortValues = op.preservedPortValues || {};
                                op.preservedPortValues[objPort.name] = objPort.value;
                            }
                        }
                    }

                if (opData.portsOut)
                    for (let ipo = 0; ipo < opData.portsOut.length; ipo++)
                    {
                        const objPort = opData.portsOut[ipo];
                        if (objPort && objPort.hasOwnProperty("name"))
                        {
                            const port2 = op.getPort(objPort.name);

                            if (port2)
                            {
                                port2.deSerializeSettings(objPort);

                                if (port2.uiAttribs.hasOwnProperty("title"))
                                {
                                    op.preservedPortTitles = op.preservedPortTitles || {};
                                    op.preservedPortTitles[port2.name] = port2.uiAttribs.title;
                                }

                                if (port2.type != Port.TYPE_TEXTURE && objPort.hasOwnProperty("value"))
                                    port2.set(obj.ops[iop].portsOut[ipo].value);

                                if (objPort.expose) port2.setUiAttribs({ "expose": true });
                            }
                        }
                    }
                newOps.push(op);
            }

            const timeused = Math.round(100 * (CABLES.now() - start)) / 100;
            if (!this.silent && timeused > 5) console.log("long op init ", obj.ops[iop].objName, timeused); // eslint-disable-line
        }
        this.logStartup("add ops done");

        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
        {
            // deprecated use event
            if (this.ops[i].onLoadedValueSet)
            {
                this.ops[i].onLoadedValueSet(this.ops[i]._origData);
                this.ops[i].onLoadedValueSet = null;
                this.ops[i]._origData = null;
            }

            // this is only emited when the patch is loaded from serializid data, e.g. loading from api
            // NOT when op is created by hand!
            this.ops[i].emitEvent(Patch.EVENT_VALUESSET);
        }

        this.logStartup("creating links");

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
                                this._addLink(
                                    obj.ops[iop].portsIn[ipi2].links[ili].objIn,
                                    obj.ops[iop].portsIn[ipi2].links[ili].objOut,
                                    obj.ops[iop].portsIn[ipi2].links[ili].portIn,
                                    obj.ops[iop].portsIn[ipi2].links[ili].portOut);

                                /*
                                 * const took = performance.now - startTime;
                                 * if (took > 100)console.log(obj().ops[iop].portsIn[ipi2].links[ili].objIn, obj.ops[iop].portsIn[ipi2].links[ili].objOut, took);
                                 */
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

                                        if (!dstOp) this.#log.warn("could not find op for lost link");
                                        else
                                        {
                                            this._addLink(
                                                dstOp.id,
                                                obj.ops[iop].portsOut[ipi2].links[ili].objOut,

                                                obj.ops[iop].portsOut[ipi2].links[ili].portIn,
                                                obj.ops[iop].portsOut[ipi2].links[ili].portOut);
                                        }
                                    }
                                    else
                                    {
                                        const l = this._addLink(obj.ops[iop].portsOut[ipi2].links[ili].objIn, obj.ops[iop].portsOut[ipi2].links[ili].objOut, obj.ops[iop].portsOut[ipi2].links[ili].portIn, obj.ops[iop].portsOut[ipi2].links[ili].portOut);

                                        if (!l)
                                        {
                                            const op1 = this.getOpById(obj.ops[iop].portsOut[ipi2].links[ili].objIn);
                                            const op2 = this.getOpById(obj.ops[iop].portsOut[ipi2].links[ili].objOut);

                                            if (!op1)console.log("could not find link op1");// eslint-disable-line
                                            if (!op2)console.log("could not find link op2");// eslint-disable-line

                                            const p1Name = obj.ops[iop].portsOut[ipi2].links[ili].portIn;

                                            if (op1 && !op1.getPort(p1Name))
                                            {
                                                // console.log("PRESERVE port 1 not found", p1Name);

                                                op1.preservedPortLinks[p1Name] = op1.preservedPortLinks[p1Name] || [];
                                                op1.preservedPortLinks[p1Name].push(obj.ops[iop].portsOut[ipi2].links[ili]);
                                            }

                                            const p2Name = obj.ops[iop].portsOut[ipi2].links[ili].portOut;
                                            if (op2 && !op2.getPort(p2Name))
                                            {
                                                // console.log("PRESERVE port 2 not found", obj.ops[iop].portsOut[ipi2].links[ili].portOut);
                                                op2.preservedPortLinks[p1Name] = op2.preservedPortLinks[p1Name] || [];
                                                op2.preservedPortLinks[p1Name].push(obj.ops[iop].portsOut[ipi2].links[ili]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
            }
        }

        this.logStartup("calling ops onloaded");

        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
        {
            if (this.ops[i].onLoaded)
            {
                // TODO: deprecated - use even
                this.ops[i].onLoaded();
                this.ops[i].onLoaded = null;
            }
        }

        this.logStartup("initializing ops...");
        for (let i = 0; i < this.ops.length; i++)
        // for (const i in this.ops)
        {
            if (this.ops[i].init)
            {
                try
                {
                    this.ops[i].init();
                    this.ops[i].init = null;
                }
                catch (e)
                {
                    console.error("op.init crash", e); // eslint-disable-line
                }
            }
        }

        this.logStartup("initializing vars...");

        if (this.config.variables)
            for (const varName in this.config.variables)
                this.setVarValue(varName, this.config.variables[varName]);

        this.logStartup("initializing var ports");

        // for (const i in this.ops)
        for (let i = 0; i < this.ops.length; i++)
        {
            this.ops[i].initVarPorts();
            delete this.ops[i].uiAttribs.pasted;
        }

        setTimeout(() => { this.loading.finished(loadingId); }, 100);

        this.updateAnimMaxTime();
        if (this.config.onPatchLoaded) this.config.onPatchLoaded(this);

        this.emitEvent(Patch.EVENT_PATCHLOADEND, newOps, obj, options.genIds);
        this.#initialDeserialize = false;
    }

    // ----------------------

    /**
     * set variable value
     * @function setVariable
     * @memberof Patch
     * @param {String} name of variable
     * @param {Number|String|Boolean} val value
     */
    setVariable(name, val)
    {
        if (this._variables[name] !== undefined)
        {
            this._variables[name].setValue(val);
        }
        else
        {
            this.#log.warn("variable " + name + " not found!");
        }
    }

    _sortVars()
    {

        /* minimalcore:start */
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

        /* minimalcore:end */
    }

    /**
     * has variable
     * @param {String} name of variable
     */
    hasVar(name)
    {
        return this._variables[name] !== undefined;
    }

    // used internally
    /**
     * @param {string} name
     * @param {string | number} val
     * @param {number} [type]
     */
    setVarValue(name, val, type)
    {
        if (this.hasVar(name))
        {
            this._variables[name].setValue(val);
        }
        else
        {
            this._variables[name] = new PatchVariable(name, val, type);
            this._sortVars();
            this.emitEvent(Patch.EVENT_VARIABLES_CHANGED);
        }
        return this._variables[name];
    }

    // old?
    getVarValue(name, val)
    {
        if (this._variables.hasOwnProperty(name)) return this._variables[name].getValue();
    }

    /**
     * @param {String} name
     * @return {PatchVariable} variable
     */
    getVar(name)
    {
        if (this._variables.hasOwnProperty(name)) return this._variables[name];
    }

    /**
     * @param {string} name
     */
    deleteVar(name)
    {
        for (let i = 0; i < this.ops.length; i++)
            for (let j = 0; j < this.ops[i].portsIn.length; j++)
                if (this.ops[i].portsIn[j].getVariableName() == name)
                    this.ops[i].portsIn[j].setVariable(null);

        delete this._variables[name];
        this.emitEvent("variableDeleted", name);
        this.emitEvent("variablesChanged");
    }

    /**
     * @param {number} t
     * @returns {PatchVariable[]}
     */
    /* minimalcore:start */
    getVars(t)
    {
        if (t === undefined) return this._variables;
        if (t === 1) return {};

        // const perf = Patch.getGui().uiProfiler.start("[corepatchetend] getVars");// todo should work event based

        const vars = [];
        let tStr = "";
        if (t == Port.TYPE_STRING) tStr = "string";
        else if (t == Port.TYPE_VALUE) tStr = "number";
        else if (t == Port.TYPE_ARRAY) tStr = "array";
        else if (t == Port.TYPE_OBJECT) tStr = "object";
        else if (t == Port.TYPE_DYNAMIC) tStr = "dynamic";
        else
        {
            console.log("unknown port type", t); // eslint-disable-line
            console.log(new Error().stack); // eslint-disable-line
        }

        for (const i in this._variables)
        {
            if (!this._variables[i].type || this._variables[i].type == tStr || this._variables[i].type == t) vars.push(this._variables[i]);
        }

        // perf.finish();

        return vars;
    }

    /* minimalcore:end */

    /**
     * @description invoke pre rendering of ops
     */
    preRenderOps()
    {
        this.#log.log("prerendering...");

        for (let i = 0; i < this.ops.length; i++)
        {
            if (this.ops[i].preRender)
            {
                this.ops[i].preRender();
                this.#log.log("prerender " + this.ops[i].objName);
            }
        }
    }

    /**
     * @description stop, dispose and cleanup patch
     */
    dispose()
    {
        this.pause();
        this.clear();
        this.emitEvent(Patch.EVENT_DISPOSE);
    }

    /**
     * @param {Port} p
     */
    pushTriggerStack(p)
    {
        this._triggerStack.push(p);
    }

    popTriggerStack()
    {
        this._triggerStack.pop();
    }

    printTriggerStack()
    {

        /* minimalcore:start */
        if (this._triggerStack.length == 0)
        {
            // console.log("stack length", this._triggerStack.length); // eslint-disable-line
            return;
        }
        console.groupCollapsed( // eslint-disable-line
            "trigger port stack " + this._triggerStack[this._triggerStack.length - 1].op.objName + "." + this._triggerStack[this._triggerStack.length - 1].name,
        );

        const rows = [];
        for (let i = 0; i < this._triggerStack.length; i++)
        {
            rows.push(i + ". " + this._triggerStack[i].op.objName + " " + this._triggerStack[i].name);
        }

        console.table(rows); // eslint-disable-line
        console.groupEnd(); // eslint-disable-line
        /* minimalcore:end */
    }

    get containerElement()
    {
        if (this.config.containerElement) return this.config.containerElement;
        if (this.cg && this.cg.canvas.parentElement) return this.cg.canvas.parentElement;
        if (this.cgl && this.cgl.canvas.parentElement) return this.cgl.canvas.parentElement;
        return document.body;
    }

    /**
     * returns document object of the patch could be != global document object when opening canvas ina popout window
     * @return {Object} document
     */
    getDocument()
    {
        return this.containerElement.ownerDocument;
        // return this.cgl.canvas.ownerDocument;
    }

    /**
     * @param {string} objName
     */
    static getOpClass(objName)
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
    }

    /**
     * @param {Object} json
     * @param {Object} options
     */
    static replaceOpIds(json, options)
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

                            /* minimalcore:start */
                            else
                            {
                                if (options.fixLostLinks)
                                {
                                    const op = Patch.getGui().corePatch().getOpById(links[l].objIn);
                                    if (!op) console.log("op not found!"); // eslint-disable-line
                                    else
                                    {
                                        const outerOp = Patch.getGui().patchView.getSubPatchOuterOp(op.uiAttribs.subPatch);
                                        if (outerOp)
                                        {
                                            op.storage = op.storage || {};
                                            op.storage.ref = op.storage.ref || shortId();
                                            links[l].refOp = op.storage.ref;
                                            links[l].subOpRef = outerOp.storage.ref;
                                        }
                                    }
                                }
                            }

                            /* minimalcore:end */
                        }
                    }
                }
            }
        }

        for (const i in json.ops)
        {
            const op = json.ops[i];
            const oldId = op.id;
            let newId = shortId();

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
                    op.storage.ref = newId = shortId();
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
            // for (const k in json.ops[i].portsInckkkkk
                for (let k = 0; k < json.ops[i].portsIn.length; k++)
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
    }
}

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
