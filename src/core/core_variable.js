import { EventTarget } from "./eventtarget";

/**
 * @type {Object}
 * @name Variable
 * @param {String} name
 * @param {String|Number} value
 * @memberof Patch
 * @constructor
 */
class PatchVariable extends EventTarget
{
    constructor(name, val, type)
    {
        super();
        this._name = name;
        this.type = type;
        this.setValue(val);
    }


    /**
     * @function Variable.getValue
     * @memberof Variable
     * @returns {String|Number|Boolean}
     */

    getValue()
    {
        return this._v;
    }

    /**
     * @function getName
     * @memberof Variable
     * @instance
     * @returns {String|Number|Boolean}
     * @function
     */
    getName()
    {
        return this._name;
    }

    /**
     * @function setValue
     * @memberof Variable
     * @instance
     * @returns {String|Number|Boolean}
     * @function
     */
    setValue(v)
    {
        this._v = v;
        this.emitEvent("change", v, this);
    }
}

export default PatchVariable;
