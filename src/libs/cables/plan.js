import { Events } from "cables-shared-client";
import { CONSTANTS } from "../../core/constants.js";

const Plan = class extends Events
{
    constructor(patch, name)
    {
        super();

        patch.plans = patch.plans || {};
        this._patch = patch;
        this._data = null;
        this._currentPlaceName = "";
        this.setName(name);
    }

    get currentPlaceName()
    {
        return this._currentPlaceName;
    }

    setName(name)
    {
        delete this._patch.plans[this.name];
        this.name = name;
        this._patch.plans[this.name] = this;
    }

    setCurrentPlaceName(name)
    {
        this._currentPlaceName = name;
        this.emitEvent("stateChanged");
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

    useExit(exitName)
    {
        if (!this._data) return;
        console.log("use exit", exitName);

        for (let i = 0; i < this._data.places.length; i++)
        {
            const place = this._data.places[i];
            if (place.name == this._currentPlaceName)
            {
                console.log("current place", place);

                for (const e in place.exits)
                {
                    console.log("e", e);

                    if (e == exitName)
                    {
                        console.log("found exit!", place.exits[e]);
                        this.setCurrentPlaceName(place.exits[e].place);
                        return;
                    }
                }
            }
        }
        console.log("exit NOT found :(");
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
