import { Patch } from "./core_patch.js";
import { now } from "./timer.js";

/**
 * @typedef ProfilerItem
 * @property  {String} [title] overwrite title of port (by default this is portname)
 * @property numTriggers {number}
 * @property timeUsed {number}
 * @property timeUsedFrame {number}
 * @property opid {string}
 * @property subPatch {string}

 * @property timePsMsAvg {number}
 * @property timePsMs {number}
 * @property timePsCount {number}
 * @property _timePsCount {number}
 * @property _timePsStart {number}
 * @property _timePsMs {number}
 */

export class Profiler
{

    /**
     * @param {Patch} patch
     */
    constructor(patch)
    {
        this.startFrame = patch.getFrameNum();

        /** @type {Object.<string, ProfilerItem>} */
        this.items = {};
        this.currentId = null;
        this.currentStart = 0;
        this._patch = patch;
    }

    getItems()
    {
        return this.items;
    }

    clear()
    {
        this.currentStart = performance.now();
        if (this.paused) return;
        this.items = {};
    }

    togglePause()
    {
        this.paused = !this.paused;
        if (!this.paused)
        {
            this.items = {};
            this.currentStart = performance.now();
        }
    }

    /**
     * @param {any} type
     * @param {Object} object
     */
    add(type, object)
    {
        if (this.paused) return;

        if (this.currentId !== null)
        {
            if (!object || object.id != this.currentId)
            {
                const item = this.items[this.currentId];
                if (item)
                {
                    item.timeUsed += performance.now() - this.currentStart;
                    item._timePsCount++;
                    item._timePsMs += performance.now() - this.currentStart;

                    if (item._timePsStart == 0 || performance.now() > item._timePsStart + 1000)
                    {
                        item.timePsMs = item._timePsMs;
                        item.timePsMsAvg = item._timePsMs / item._timePsCount;
                        item.timePsCount = item._timePsCount;
                        item._timePsCount = 0;
                        item._timePsMs = 0;
                        item._timePsStart = performance.now();
                    }

                    if (!item.peakTime || now() - item.peakTime > 5000)
                    {
                        item.peak = 0;
                        item.peakTime = now();
                    }
                    item.peak = Math.max(item.peak, performance.now() - this.currentStart);
                }
            }
        }

        if (object !== null)
        {
            if (!this.items[object.id])
            {
                this.items[object.id] = {
                    "numTriggers": 0,
                    "timeUsed": 0,
                    "timeUsedFrame": 0,
                    "timePsMsAvg": 0,
                    "timePsMs": 0,
                    "_timePsCount": 0,
                    "_timePsMs": 0,
                    "_timePsStart": performance.now()
                };
            }

            if (this.items[object.id].lastFrame != this._patch.getFrameNum()) this.items[object.id].numTriggers = 0;

            this.items[object.id].lastFrame = this._patch.getFrameNum();
            this.items[object.id].numTriggers++;
            this.items[object.id].opid = object.op.id;
            this.items[object.id].title = object.op.name + "." + object.name;
            this.items[object.id].subPatch = object.op.uiAttribs.subPatch;

            this.currentId = object.id;
            this.currentStart = performance.now();
        }
        else
        {
            this.currentId = null;
        }
    }

    print()
    {
        console.log("--------");
        for (const i in this.items)
        {
            console.log(this.items[i].title + ": " + this.items[i].numTriggers + " / " + this.items[i].timeUsed);
        }
    }
}
