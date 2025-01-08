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

        this.durationIn = 0.25;
        this.durationOut = 0.5;

        this._anims = {};
        this._anims.__level = new CABLES.Anim();

        this._data = null;
        this._currentPlaceName = "";
        this.setName("unknown");
        this._patch.emitEvent("plansChanged");
    }

    get currentPlaceName()
    {
        return this._currentPlaceName;
    }

    setEasing(enter, exit)
    {
        this.easingEnter = enter;
        this.easingExit = exit;
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

    getProgress(name)
    {
        this._anims[name] = this._anims[name] || new CABLES.Anim();
        return this._anims[name].getValue(CABLES.now() / 1000);
    }

    _animPlace(name, from, to)
    {
        let dur = this.durationIn;
        this._anims[name] = this._anims[name] || new CABLES.Anim();

        if (to == 0)
        {
            dur = this.durationOut;
            this._anims[name].defaultEasing = this.easingExit;
        }
        else
        {
            dur = this.durationIn;
            this._anims[name].defaultEasing = this.easingEnter;
        }

        this._anims[name].clear();
        this._anims[name].setValue(CABLES.now() / 1000, from);
        this._anims[name].setValue(CABLES.now() / 1000 + dur, to);
    }

    setCurrentPlaceName(name)
    {
        this._animPlace("__levelAnim" + this.getCurrentPlace().level, 1, 0);

        this._animPlace(this._currentPlaceName, 1, 0);
        this._animPlace(name, 0, 1);

        this._currentPlaceName = name;

        this._animPlace("__level", this._anims.__level.getValue(CABLES.now() / 1000), this.getCurrentPlace().level);
        this._animPlace("__levelAnim" + this.getCurrentPlace().level, 0, 1);

        this.emitEvent("stateChanged");
    }

    getCurrentPlaceName()
    {
        const p = this.getCurrentPlace();
        if (p) return p.name;
    }

    getCurrentPlaceLevel()
    {
        return this.getCurrentPlace().level || 0;
    }


    getCurrentPlace()
    {
        if (!this._data) return { "name": "no plan data" };
        for (let i = 0; i < this._data.places.length; i++)
        {
            const place = this._data.places[i];
            if (place.name == this._currentPlaceName) return place;
        }
        return { "name": "" };
    }

    getCurrentExitNames()
    {
        const place = this.getCurrentPlace();
        const names = [];
        for (const e in place.exits) names.push(e);
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
