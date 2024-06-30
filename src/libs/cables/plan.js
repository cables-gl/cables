import { Events } from "cables-shared-client";
import { CONSTANTS } from "../../core/constants.js";

const Plan = class extends Events
{
    constructor(patch, name)
    {
        super();

        patch.plans = patch.plans || {};
        this._patch = patch;
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

    // setPlaces(placeOps)
    // {

    // }

    // getCurrentExits()
    // {

    // }
};

Plan.prototype.getPlan = function (patch, name)
{
    if (patch.plans && patch.plans[name]) return patch.plans[name];
};

CABLES.Plan = Plan;
