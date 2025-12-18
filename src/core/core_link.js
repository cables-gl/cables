import { Events } from "cables-shared-client";
import { Patch } from "./core_patch.js";
import { Port } from "./core_port.js";

/**
 * @namespace external:CABLES#Link
 * @description a link is a connection between two ops/ports -> one input and one output port
 * @hideconstructor
 * @class
 */
export class Link extends Events
{

    /**
     * @param {Patch} p
     */
    constructor(p)
    {
        super();

        this.id = CABLES.simpleId();

        /**
         * @type {Port}
         */
        this.portIn = null;

        /**
         * @type {Port}
         */
        this.portOut = null;

        /**
         * @type {Patch}
         */
        this._patch = p;
        this.activityCounter = 0;
        this.ignoreInSerialize = false;
    }

    /**
     * @param {any} v
     */
    setValue(v)
    {
        if (v === undefined) this._setValue();
        else this.portIn.set(v);
    }

    activity()
    {
        this.activityCounter++;
    }

    _setValue()
    {
        if (!this.portOut)
        {
            this.remove();
            return;
        }
        const v = this.portOut.get();

        if (v == v) // NaN is the only JavaScript value that is treated as unequal to itself
        {
            if (this.portIn.type != Port.TYPE_FUNCTION) this.activity();

            if (this.portIn.get() !== v)
            {
                this.portIn.set(v);
            }
            else
            {
                if (this.portIn.changeAlways) this.portIn.set(v);
                if (this.portOut.forceRefChange) this.portIn.forceChange();
            }
        }
    }

    /**
     * @function getOtherPort
     * @memberof Link
     * @instance
     * @param {Port} p port
     * @description returns the port of the link, which is not port
     */
    getOtherPort(p)
    {
        if (p == this.portIn) return this.portOut;
        return this.portIn;
    }

    /**
     * @function remove
     * @memberof Link
     * @instance
     * @description unlink/remove this link from all ports
     */
    remove()
    {
        if (this.portIn) this.portIn.removeLink(this);
        if (this.portOut) this.portOut.removeLink(this);
        if (this._patch)
        {
            this._patch.emitEvent("onUnLink", this.portIn, this.portOut, this);
        }

        if (this.portIn && (this.portIn.type == Port.TYPE_OBJECT || this.portIn.type == Port.TYPE_ARRAY))
        {
            this.portIn.set(null);
            if (this.portIn.links.length > 0) this.portIn.set(this.portIn.links[0].getOtherPort(this.portIn).get());
        }

        if (this.portIn) this.portIn.op._checkLinksNeededToWork();
        if (this.portOut) this.portOut.op._checkLinksNeededToWork();

        this.portIn = null;
        this.portOut = null;
        this._patch = null;
    }

    /**
     * @function link
     * @memberof Link
     * @instance
     * @description link those two ports
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     */
    link(p1, p2)
    {
        if (!Link.canLink(p1, p2))
        {
            console.warn("[core_link] cannot link ports!", p1, p2);
            return false;
        }

        if (p1.direction == Port.DIR_IN)
        {
            this.portIn = p1;
            this.portOut = p2;
        }
        else
        {
            this.portIn = p2;
            this.portOut = p1;
        }

        p1.addLink(this);
        p2.addLink(this);

        this.setValue();

        p1.op._checkLinksNeededToWork();
        p2.op._checkLinksNeededToWork();
    }

    getSerialized()
    {

        /* minimalcore:start */
        const obj = {};

        obj.portIn = this.portIn.getName();
        obj.portOut = this.portOut.getName();
        obj.objIn = this.portIn.op.id;
        obj.objOut = this.portOut.op.id;

        return obj;

        /* minimalcore:end */
    }

    /**
     * return a text message with human readable reason if ports can not be linked, or can be
     *
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     */
    static canLinkText(p1, p2)
    {

        /* minimalcore:start */
        if (p1.direction == p2.direction)
        {
            let txt = "(out)";
            if (p2.direction == Port.DIR_IN) txt = "(in)";
            return "can not link: same direction " + txt;
        }
        if (p1.op == p2.op) return "can not link: same op";
        if (p1.type != Port.TYPE_DYNAMIC && p2.type != Port.TYPE_DYNAMIC)
        {
            if (p1.type != p2.type) return "can not link: different type";
        }

        if (CABLES.UI && p1.type == Port.TYPE_OBJECT && p2.type == Port.TYPE_OBJECT)
        {
            if (p1.uiAttribs.objType && p2.uiAttribs.objType)
                if (p1.uiAttribs.objType != p2.uiAttribs.objType)
                    return "incompatible objects";
        }

        if (!p1) return "can not link: port 1 invalid";
        if (!p2) return "can not link: port 2 invalid";

        if (p1.direction == Port.DIR_IN && p1.isAnimated()) return "can not link: is animated";
        if (p2.direction == Port.DIR_IN && p2.isAnimated()) return "can not link: is animated";

        if (p1.isLinkedTo(p2)) return "ports already linked";

        if ((p1.canLink && !p1.canLink(p2)) || (p2.canLink && !p2.canLink(p1))) return "Incompatible";

        return "can link";

        /* minimalcore:end */
    }

    /**
     * return true if ports can be linked
     *
     * @param {Port} p1 port1
     * @param {Port} p2 port2
     * @returns {Boolean}
     */
    static canLink(p1, p2)
    {

        /* minimalcore:start */
        if (!p1) return false;
        if (!p2) return false;
        if (p1.direction == Port.DIR_IN && p1.isAnimated()) return false;
        if (p2.direction == Port.DIR_IN && p2.isAnimated()) return false;

        if (p1.isHidden() || p2.isHidden()) return false;

        if (p1.isLinkedTo(p2)) return false;

        if (p1.direction == p2.direction) return false;

        if (CABLES.UI && p1.type == Port.TYPE_OBJECT && p2.type == Port.TYPE_OBJECT)
        {
            if (p1.uiAttribs.objType && p2.uiAttribs.objType)
            {
                if (p1.uiAttribs.objType.indexOf("sg_") == 0 && p2.uiAttribs.objType.indexOf("sg_") == 0) return true;
                if (p1.uiAttribs.objType != p2.uiAttribs.objType)
                    return false;
            }
        }

        if (p1.type != p2.type && (p1.type != Port.TYPE_DYNAMIC && p2.type != Port.TYPE_DYNAMIC)) return false;
        if (p1.type == Port.TYPE_DYNAMIC || p2.type == Port.TYPE_DYNAMIC) return true;

        if (p1.op == p2.op) return false;

        if (p1.canLink && !p1.canLink(p2)) return false;
        if (p2.canLink && !p2.canLink(p1)) return false;

        /* minimalcore:end */
        return true;
    }
}

// --------------------------------------------
