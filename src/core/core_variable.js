import { Events } from "cables-shared-client";

export class PatchVariable extends Events
{
    #name;

    /**
     * @param {String} name
     * @param {String|Number} val
     * @param {number} type
     */
    constructor(name, val, type)
    {
        super();
        this.#name = name;
        this.type = type;
        this.setValue(val);
    }

    /**
     * keeping this for backwards compatibility in older
     * exports before using eventtarget
     *
     * @param cb
     */
    addListener(cb)
    {
        this.on("change", cb, "var");
    }

    /**
     * @returns {String|Number|Boolean|Object}
     */
    getValue()
    {
        return this._v;
    }

    get name()
    {
        return this.#name;
    }

    /**
     * @returns {String|Number|Boolean}
     */
    getName()
    {
        return this.#name;
    }

    /**
     * @param {string | number} v
     * @returns {any}
     */
    setValue(v)
    {
        this._v = v;
        this.emitEvent("change", v, this);
    }
}
