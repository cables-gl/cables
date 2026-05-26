import { Events, Logger } from "cables-shared-client";
import { generateUUID } from "./utils.js";
import { Patch } from "./core_patch.js";
import { Op } from "./core_op.js";

/**
 * @typedef LoadingTask
 * @property {Op} [op]
 * @property {String} [id]
 * @property {string} [type]
 */

/**
 * LoadingStatus class, manages asynchronous loading jobs
 */
export class LoadingStatus extends Events
{

    /** @type {Function[]} */
    _cbFinished = [];

    /** @type {Function[]} */
    _assetTasks = [];

    _percent = 0;
    _count = 0;
    _countFinished = 0;
    _order = 0;
    _startTime = 0;
    _wasFinishedPrinted = false;
    _loadingAssetTaskCb = false;

    /** @type {Object.<String,LoadingTask>} */
    _loadingAssets = {};

    /**
     * @param {Patch} patch
     */
    constructor(patch)
    {
        super();
        this._log = new Logger("LoadingStatus");
        this._patch = patch;
    }

    /**
     * @param {string} str
     * @param {LoadingTask} loadingTask
     */
    log(str, loadingTask)
    {
        let lstr = "[load] " + str;

        if (loadingTask.op)
        {
            lstr += "op:" + loadingTask.op.name;
            if (loadingTask.op.tags) " (tags " + loadingTask.op.tags + ")";
        }

        console.log(lstr);
    }

    /**
     * @param {Function} cb
     */
    setOnFinishedLoading(cb)
    {
        this._cbFinished.push(cb);
    }

    getNumAssets()
    {
        return this._countFinished;
    }

    getProgress()
    {
        return this._percent;
    }

    checkStatus()
    {
        this._countFinished = 0;
        this._count = 0;

        for (const i in this._loadingAssets)
        {
            this._count++;
            if (!this._loadingAssets[i].finished)
            {
                this._countFinished++;
            }
        }

        this._percent = (this._count - this._countFinished) / this._count;

        if (this._countFinished === 0)
        {
            for (let j = 0; j < this._cbFinished.length; j++)
            {
                if (this._cbFinished[j])
                {
                    const cb = this._cbFinished[j];
                    setTimeout(() => { cb(this._patch); this.emitEvent("finishedAll"); }, 100);
                }
            }

            if (!this._wasFinishedPrinted)
            {
                this._wasFinishedPrinted = true;
                this.print();
            }
            this.emitEvent("finishedAll");
        }
    }

    getList()
    {
        let arr = [];
        for (const i in this._loadingAssets)
        {
            arr.push(this._loadingAssets[i]);
        }

        return arr;
    }

    getListJobs()
    {
        let arr = [];
        for (const i in this._loadingAssets)
        {
            if (!this._loadingAssets[i].finished)arr.push(this._loadingAssets[i].name);
        }

        return arr;
    }

    print()
    {
        if (this._patch.config.silent) return;

        const rows = [];

        for (const i in this._loadingAssets)
        {
            rows.push([
                this._loadingAssets[i].order,
                this._loadingAssets[i].type,
                this._loadingAssets[i].name,
                (this._loadingAssets[i].timeEnd - this._loadingAssets[i].timeStart) / 1000 + "s",
            ]);
        }

        this._log.groupCollapsed("finished loading " + this._order + " assets in " + (Date.now() - this._startTime) / 1000 + "s");
        this._log.table(rows);
        this._log.groupEnd();
    }

    /**
     * @param {string} id
     */
    finished(id)
    {
        const l = this._loadingAssets[id];
        if (l)
        {
            if (l.finished) this._log.warn("loading job was already finished", l);
            if (l.op) l.op.setUiAttribs({ "loading": false });
            l.finished = true;
            l.timeEnd = Date.now();
        }
        this.log("finished", l);

        this.checkStatus();
        this.emitEvent("finishedTask");
        return null;
    }

    _startAssetTasks()
    {
        for (let i = 0; i < this._assetTasks.length; i++)
            CABLES.idleCallback(this._assetTasks[i]);

        this._assetTasks.length = 0;
    }

    /**
     * delay an asset loading task, mainly to wait for ui to be finished loading and showing, and only then start loading assets
     * @param {function} cb callback
     */
    addAssetLoadingTask(cb)
    {
        if (this._patch.isEditorMode() && !CABLES.UI.loaded)
        {
            this._assetTasks.push(cb);

            if (!this._loadingAssetTaskCb)window.gui.addEventListener("uiloaded", this._startAssetTasks.bind(this));
            this._loadingAssetTaskCb = true;
        }
        else
        {
            CABLES.idleCallback(cb);
        }
        this.emitEvent("addAssetTask");
    }

    /**
     * @param {string} name
     */
    existByName(name)
    {
        for (let i in this._loadingAssets)
        {
            if (this._loadingAssets[i].name == name && !this._loadingAssets[i].finished)
                return true;
        }
    }

    /**
     * @param {string} type
     * @param {string} name
     * @param {Op} [op]
     */
    start(type, name, op)
    {
        if (this._startTime == 0) this._startTime = Date.now();
        const id = generateUUID();

        name = name || "unknown";
        if (name.length > 100)name = name.substring(0, 100);

        if (op)op.setUiAttrib({ "loading": true });

        this._loadingAssets[id] = {
            "id": id,
            "op": op,
            "type": type,
            "name": name,
            "finished": false,
            "timeStart": Date.now(),
            "order": this._order,
        };
        this._order++;
        this.log("start loading", this._loadingAssets[id]);

        this.emitEvent("startTask");

        return id;
    }
}
