import { Events } from "cables-shared-client";
import { CONSTANTS } from "../../core/constants.js";

const Plan = class extends Events
{
    constructor(op)
    {
        super();
        this._op = op;
        this._patch = op.patch;
        this._patch.plans = this._patch.plans || {};

        this._data = null;
        this._currentPlaceName = "";
        this.setName("unknown");
        this._patch.emitEvent("plansChanged");
    }

    get currentPlaceName()
    {
        return this._currentPlaceName;
    }

    update()
    {
        this._op.updatePlan();
    }

    setName(name)
    {
        delete this._patch.plans[this.name];
        this.name = name;
        this._patch.plans[this.name] = this;
        this._patch.emitEvent("plansChanged");
    }

    setCurrentPlaceName(name)
    {
        this._currentPlaceName = name;
        this.emitEvent("stateChanged");
    }

    getCurrentPlaceName()
    {
        return this.getCurrentPlace().name;
    }

    getCurrentPlace()
    {
        for (let i = 0; i < this._data.places.length; i++)
        {
            const place = this._data.places[i];
            if (place.name == this._currentPlaceName)
            {
                return place;
            }
        }
        return { "name": "" };
    }

    getCurrentExitNames()
    {
        const place = this.getCurrentPlace();
        const names = [];
        for (const e in place.exits)
        {
            names.push(e);
        }
        return names;
    }

    getCurrentExits()
    {
        const place = this.getCurrentPlace();
        const names = [];
        return place.exits;
    }

    gotoPlace(placeName)
    {
        if (!this._data) return;

        for (let i = 0; i < this._data.places.length; i++)
        {
            const place = this._data.places[i];
            if (place.name == this._currentPlaceName)
            {
                for (const e in place.exits)
                {
                    if (place.exits[e].place == placeName)
                    {
                        this.setCurrentPlaceName(placeName);
                        return;
                    }
                }
                break;
            }
        }
        console.log("NO exit to " + placeName + " found :(");
    }

    useExit(exitName)
    {
        if (!this._data) return;

        for (let i = 0; i < this._data.places.length; i++)
        {
            const place = this._data.places[i];
            if (place.name == this._currentPlaceName)
            {
                for (const e in place.exits)
                {
                    if (e == exitName)
                    {
                        this.setCurrentPlaceName(place.exits[e].place);
                        return;
                    }
                }
                break;
            }
        }
        console.log("exit " + exitName + " NOT found :(");
    }

    setData(data)
    {
        this._data = data;
    }
};

Plan.prototype.getPlan = function (patch, name)
{
    if (patch.plans && patch.plans[name]) return patch.plans[name];
};

CABLES.Plan = Plan;
