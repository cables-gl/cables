import { generateUUID } from "./utils";
// eslint-disable-next-line
import { CGL } from "./cgl"; // * if you remove this, the project wont build CGL properly.. wtf?

// "use strict";

const LoadingStatus = function (patch)
{
    this._loadingAssets = {};
    this._cbFinished = [];
    this._percent = 0;
    this._count = 0;
    this._countFinished = 0;
    this._order = 0;
    this._startTime = 0;
    this._patch = patch;
};

LoadingStatus.prototype.setOnFinishedLoading = function (cb)
{
    this._cbFinished.push(cb);
};

LoadingStatus.prototype.getNumAssets = function ()
{
    return this._countFinished;
};

LoadingStatus.prototype.getProgress = function ()
{
    return this._percent;
};

LoadingStatus.prototype.checkStatus = function ()
{
    this._countFinished = 0;
    this._count = 0;

    for (var i in this._loadingAssets)
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
        for (var j = 0; j < this._cbFinished.length; j++)
        {
            setTimeout(this._cbFinished[j], 200);
        }
        this.print();
    }
};

LoadingStatus.prototype.print = function ()
{
    if (this._patch.config.silent) return;

    var rows = [];

    for (var i in this._loadingAssets)
    {
        rows.push([
            this._loadingAssets[i].order,
            this._loadingAssets[i].type,
            this._loadingAssets[i].name,
            (this._loadingAssets[i].timeEnd - this._loadingAssets[i].timeStart) / 1000 + "s",
        ]);
    }

    console.groupCollapsed(
        "finished loading " + this._order + " assets in " + (Date.now() - this._startTime) / 1000 + "s",
    );
    console.table(rows);
    console.groupEnd();
};

LoadingStatus.prototype.finished = function (id)
{
    if (this._loadingAssets[id])
    {
        this._loadingAssets[id].finished = true;
        this._loadingAssets[id].timeEnd = Date.now();
    }

    this.checkStatus();
};

LoadingStatus.prototype.start = function (type, name)
{
    if (this._startTime == 0) this._startTime = Date.now();
    var id = generateUUID();

    this._loadingAssets[id] = {
        id,
        type,
        name,
        finished: false,
        timeStart: Date.now(),
        order: this._order,
    };
    this._order++;

    return id;
};

export { LoadingStatus };
