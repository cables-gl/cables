import { Events, Logger } from "cables-shared-client";
import { CONSTANTS } from "./constants.js";
import { cleanJson } from "./utils.js";
import { Link } from "./core_link.js";
import { Anim } from "./anim.js";
import { PatchVariable } from "./core_variable.js";
import { Op } from "./core_op.js";

/**
 * @typedef {"text"|"tsrne" } PortUiAttribsDisplay // seems not to work
 */

/**
 * @typedef PortUiAttribs
 * @property  {String} [title] overwrite title of port (by default this is portname)
 * @property  {String} [display] how the port is displayed and interacted in the paramerer panel
 * @property  {Boolean} [greyout] port paramater will appear greyed out, can not be
 * @property  {Boolean} [hidePort] port will be hidden from op
 * @property  {Boolean} [hideParam] port params will be hidden from parameter panel
 * @property  {Boolean} [showIndex] only for dropdowns - show value index (e.g. `0 - normal` )
 * @property  {String} [editorSyntax] set syntax highlighting theme for editor port
 * @property  {Boolean} [ignoreObjTypeErrors] do not auto check object types
 * @property  {string} [group] do not set manually - group ports, usually set by op.setPortGroup...
 * @property  {Boolean} [isAnimated] internal: do not set manually
 * @property  {Boolean} [useVariable] internal: do not set manually
 * @property  {string} [variableName] internal: do not set manually
 * @property  {Number} [order] internal: do not set manually
 * @property  {Number} [stride] internal: do not set manually
 * @property  {Boolean} [expose] internal: do not set manually
 * @property  {Boolean} [multiPortManual] internal: do not set manually
 * @property  {String} [increment] internal: do not set manually
 * @property  {Number} [multiPortNum] internal: do not set manually
 * @property  {PortUiAttribsDisplay} display internal: do not set manually
 * @property  {String} [axis] internal: do not set manually
 * @property  {String} [type] internal: do not set manually
 * @property  {String} [objType] internal: do not set manually
 * @property  {String} [filter] internal: do not set manually
 * @property  {boolean} [hideFormatButton] internal: do not set manually
 * @property  {boolean} [editShortcut] internal: do not set manually
 * @property  {String} [filter] internal: do not set manually
 * @property  {boolean} [preview] internal: do not set manually
 * @property  {boolean} [colorPick] internal: do not set manually
 * @property  {Array<String>} [values] internal: do not set manually
 * @property  {boolean} [boundToVar] internal: do not set manually
 * @property  {boolean} [addPort] internal: do not set manually
 * @property  {boolean} [notWorking] internal: do not set manually
 * @property  {number} [glPortIndex] internal: do not set manually
 * @property  {boolean} [readOnly] internal: do not set manually
 * @property  {boolean} [multiPort] internal: do not set manually
 * @property  {number} [longPort]
 * @property  {boolean} [tlDrawKeys]
 * @property  {number} [tlEase] default easing when animating parameter
 * @property  {boolean} [hover]
*/

/**
 * data is coming into and out of ops through input and output ports
 * @namespace external:CABLES#Port
 * @module Port
 * @class
 * @example
 * const myPort=op.inString("String Port");
 */
export class Port extends Events
{
    static DIR_IN = 0;
    static DIR_OUT = 1;

    static TYPE_VALUE = 0;
    static TYPE_NUMBER = 0;
    static TYPE_FUNCTION = 1;
    static TYPE_TRIGGER = 1;
    static TYPE_OBJECT = 2;
    static TYPE_TEXTURE = 2;
    static TYPE_ARRAY = 3;
    static TYPE_DYNAMIC = 4;
    static TYPE_STRING = 5;

    static EVENT_UIATTRCHANGE = "onUiAttrChange";
    static EVENT_VALUE_CHANGE = "change";

    static EVENT_LINK_CHANGED = "onLinkChanged";
    static EVENT_LINK_REMOVED = "onLinkRemoved";

    #log = new Logger("core_port");
    #oldAnimVal = -5711;

    animMuted = false;

    lastAnimTime = 0;
    #uiActiveState = true;
    #valueBeforeLink = null;
    #animated = false;
    #useVariableName = null;

    /** @type {Op} */
    #op = null;

    /**
     * @param {Op} ___op
     * @param {string} name
     * @param {number} type
     * @param {PortUiAttribs} uiAttribs
     */
    constructor(___op, name, type, uiAttribs = {})
    {
        super();
        this.data = {}; // UNUSED, DEPRECATED, only left in for backwards compatibility with userops

        /**
         * @type {Number}
         * @description direction of port (input(0) or output(1))
         */
        this.direction = Port.DIR_IN;
        this.id = String(CABLES.simpleId());

        /** @type {Op} */
        this.#op = ___op;

        /** @type {Array<Link>} */
        this.links = [];

        /** @type {any} */
        this.value = 0.0;

        this.name = name;

        /** @type {number} */
        this.type = type || Port.TYPE_VALUE;

        /** @type {PortUiAttribs} */
        this.uiAttribs = uiAttribs || {};

        /** @type {Anim} */
        this.anim = null;

        this.defaultValue = null;

        this.ignoreValueSerialize = false;
        this.onLinkChanged = null;
        this.crashed = false;

        this.onValueChanged = null;
        this.onTriggered = null;
        this.changeAlways = false;
        this.forceRefChange = false;

        this.activityCounter = 0;
        this.apf = 0;
        this.activityCounterStartFrame = 0;

        this.canLink = null; // function can be overwritten
        this.preserveLinks = null;
        this.indexPort = null;
    }

    get parent()
    {
        this.#log.stack("use port.op, not .parent");
        return this.op;
    }

    get title()
    {
        return this.uiAttribs.title || this.name;
    }

    get op()
    {
        return this.#op;
    }

    get val()
    {
        return this.get();
    }

    set val(v)
    {
        this.setValue(v);
    }

    /**
     * copy over a uiattrib from an external connected port to another port
     * @param {string} which attrib name
     * @param {Port} port source port
     * @example
     *
     *  inArray.onLinkChanged=()=>
     *  {
     *      if(inArray) inArray.copyLinkedUiAttrib("stride", outArray);
     *  };
     *
     */
    copyLinkedUiAttrib(which, port)
    {

        /* minimalcore:start */
        if (!CABLES.UI) return;
        if (!this.isLinked()) return;

        const attr = {};
        attr[which] = this.links[0].getOtherPort(this).getUiAttrib(which);
        port.setUiAttribs(attr);

    /* minimalcore:end */
    }

    /*
     * TODO make extend class for ports, like for ops only for ui
     */
    getValueForDisplay()
    {

        /* minimalcore:start */
        let str = this.value;

        if (typeof this.value === "string" || this.value instanceof String)
        {
            if (str.length > 1000)
            {
                str = str.substring(0, 999);
                str += "...";
            }
            if (this.uiAttribs && (this.uiAttribs.display == "boolnum"))
            {
                str += " - ";

                if (!this.value) str += "false";
                else str += "true";
            }

            str = str.replace(/[\u00A0-\u9999<>&]/g, function (/** @type {String} */ i)
            {
                return "&#" + i.charCodeAt(0) + ";";
            });

            if (str.length > 100) str = str.substring(0, 100);
        }
        else
        {
            str = String(this.value);
        }
        return str;

    /* minimalcore:end */
    }

    /**
     * change listener for input value ports, overwrite to react to changes
     * @example
     * const myPort=op.inString("MyPort");
     * myPort.onChange=function()
     * {
     *   console.log("was changed to: ",myPort.get());
     * }
     *
     */
    onAnimToggle() {}

    _onAnimToggle()
    {
        this.onAnimToggle();
    }

    /**
     * @description remove port
     */
    remove()
    {
        this.removeLinks();
        this.#op.removePort(this);
    }

    /**
     * set ui attributes
     * @param {PortUiAttribs} newAttribs
     * @example
     * myPort.setUiAttribs({greyout:true});
     */
    setUiAttribs(newAttribs)
    {

        /* minimalcore:start */
        let changed = false;
        if (!this.uiAttribs) this.uiAttribs = {};

        for (const p in newAttribs)
        {
            if (newAttribs[p] === undefined)
            {
                delete this.uiAttribs[p];
                continue;
            }
            if (this.uiAttribs[p] != newAttribs[p]) changed = true;
            this.uiAttribs[p] = newAttribs[p];

            if (p == "group" && this.indexPort) this.indexPort.setUiAttribs({ "group": newAttribs[p] });
        }

        if (newAttribs.hasOwnProperty("expose")) this.#op.patch.emitEvent("subpatchExpose", this.#op.uiAttribs.subPatch);

        if (changed) this.emitEvent(Port.EVENT_UIATTRCHANGE, newAttribs, this);

    /* minimalcore:end */
    }

    /**
     * get ui attributes
     * @example
     * myPort.getUiAttribs();
     */
    getUiAttribs()
    {
        return this.uiAttribs;
    }

    /**
     * get ui attribute
     * @param {String} attribName
     * <pre>
     * attribName - return value of the ui-attribute, or null on unknown attribute
     * </pre>
     * @example
     * myPort.setUiAttribs("values");
     */
    getUiAttrib(attribName)
    {

        /* minimalcore:start */
        if (!this.uiAttribs || !this.uiAttribs.hasOwnProperty(attribName)) return null;
        return this.uiAttribs[attribName];

    /* minimalcore:end */
    }

    /**
     * @description get value of port
     */
    get()
    {
        if (CABLES.UI && this.#animated && this.lastAnimTime == this.#op.patch.timer.getTime() && !CABLES.UI.keyframeAutoCreate)
        {
            return this.value;
        }
        if (!this.animMuted && this.#animated && this.lastAnimFrame != this.#op.patch.getFrameNum())
        {
            this.lastAnimTime = this.#op.patch.timer.getTime();
            this.lastAnimFrame = this.#op.patch.getFrameNum();

            let animval = this.anim.getValue(this.#op.patch.timer.getTime());

            if (this.value != animval)
            {
                this.value = animval;
                this.#oldAnimVal = this.value;
                this.forceChange();
            }
        }

        return this.value;
    }

    /**
     * @description set value of port / will send value to all linked ports (only for output ports)
     * @param {string | number | boolean | any[]} v
     */
    set(v)
    {
        this.setValue(v);
    }

    /**
     * @param {object|array} v
     */
    setRef(v)
    {
        this.forceRefChange = true;
        this.setValue(v);
    }

    /**
     * @param {string|boolean|number} v
     */
    setValue(v)
    {
        if (v === undefined) v = null;

        if (CABLES.UI && CABLES.UI.showDevInfos)
        {
            CABLES.UI.countSetWarns = CABLES.UI.countSetWarns || 0;
            if (CABLES.UI.countSetWarns < 20 && this.direction == CONSTANTS.PORT.PORT_DIR_OUT && this.type == Port.TYPE_OBJECT && v && !this.forceRefChange)
            {
                this.#log.warn("object port [" + this.name + "] uses .set [" + this.op.objName + "]");

                CABLES.UI.countSetWarns++;
            }
        }

        if (this.#op.enabled && !this.crashed)
        {
            if (v !== this.value || this.changeAlways || this.type == Port.TYPE_TEXTURE || this.type == Port.TYPE_ARRAY)
            {
                if (CABLES.UI && this.#animated)
                {
                    CABLES.UI.PREVISKEYVAL = null;
                    if (!CABLES.UI.keyframeAutoCreate) CABLES.UI.PREVISKEYVAL = v;
                }

                if (CABLES.UI && this.#animated && CABLES.UI.keyframeAutoCreate)
                {
                    let t = this.#op.patch.timer.getTime();
                    if (CABLES.UI && CABLES.Patch.getGui().glTimeline) CABLES.Patch.getGui().glTimeline.createKey(this.anim, t, v);
                    else this.anim.setValue(t, v);
                }
                else
                {
                    try
                    {
                        this.value = v;
                        this.forceChange();
                    }
                    catch (ex)
                    {
                        this.crashed = true;

                        this.setValue = function (_v) {};
                        this.onTriggered = function () {};

                        this.#log.error("exception in ", this.#op);
                        this.#log.error(ex);

                        this.#op.patch.emitEvent("exception", ex, this.#op);
                    }

                    if (this.#op && this.#op.patch && this.#op.patch.isEditorMode() && this.type == Port.TYPE_TEXTURE)CABLES.Patch.getGui().texturePreview().updateTexturePort(this);
                }

                if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) for (let i = 0; i < this.links.length; ++i) this.links[i].setValue();
            }
        }
    }

    updateAnim()
    {
        if (!this.#animated || this.animMuted) return;
        this.value = this.get();

        if (this.#oldAnimVal != this.value || this.changeAlways)
        {
            this.#oldAnimVal = this.value;
            this.forceChange();
        }
        this.#oldAnimVal = this.value;

    }

    forceChange()
    {
        if (this.onValueChanged || this.onChange)
        {

        /*
         * very temporary: deprecated warning!!!!!!!!!
         * if(params.length>0) this._log.warn('TOM: port has onchange params!',this._op.objName,this.name);
         */
        }
        this._activity();
        this.emitEvent(Port.EVENT_VALUE_CHANGE, this.value, this);

        if (this.onChange) this.onChange(this, this.value);
        else if (this.onValueChanged) this.onValueChanged(this, this.value); // deprecated
    }

    /**
     * @description get port type as string, e.g. "Function","Value"...
     * @return {String} type
     */
    getTypeString()
    {
        return Port.getTypeString(this.type);
    }

    /**
     * @param {Object} objPort
     */
    deSerializeSettings(objPort)
    {
        if (!objPort) return;
        if (objPort.animated) this.setAnimated(objPort.animated);
        if (objPort.useVariable) this.setVariableName(objPort.useVariable);

        /* minimalcore:start */
        if (objPort.title) this.setUiAttribs({ "title": objPort.title });
        if (objPort.expose) this.setUiAttribs({ "expose": true });
        if (objPort.order) this.setUiAttribs({ "order": objPort.order });

        /* minimalcore:end */

        if (objPort.multiPortManual) this.setUiAttribs({ "multiPortManual": objPort.multiPortManual });
        if (objPort.multiPortNum) this.setUiAttribs({ "multiPortNum": objPort.multiPortNum });

        if (objPort.anim)
        {
            if (!this.anim) this.anim = new Anim({ "name": "port " + this.name });
            this.#op.hasAnimPort = true;
            this.anim.port = this;

            this.anim.deserialize(objPort.anim, true, this.op.patch.clipAnims);
            this.#op.patch.emitEvent("portAnimUpdated", this.#op, this, this.anim);

            this.bindAnimListeners();
            this.anim.sortKeys();
        }
    }

    /**
     * @param {any} v
     */
    setInitialValue(v)
    {
        if (this.op.preservedPortLinks[this.name])
        {
            for (let i = 0; i < this.op.preservedPortLinks[this.name].length; i++)
            {
                const lobj = this.op.preservedPortLinks[this.name][i];
                this.op.patch._addLink(
                    lobj.objIn,
                    lobj.objOut,
                    lobj.portIn,
                    lobj.portOut);
            }
        }

        if (this.op.preservedPortValues && this.op.preservedPortValues.hasOwnProperty(this.name) && this.op.preservedPortValues[this.name] !== undefined)
        {
            this.set(this.op.preservedPortValues[this.name]);
        }
        else
        if (v !== undefined) this.set(v);
        if (v !== undefined) this.defaultValue = v;
    }

    getSerialized()
    {

        /* minimalcore:start */
        let obj = { "name": this.getName() };

        if (!this.ignoreValueSerialize && this.links.length === 0)
        {
            if (this.type == Port.TYPE_OBJECT && this.value && this.value.tex) {}
            else obj.value = this.value;
        }
        if (this.#useVariableName) obj.useVariable = this.#useVariableName;
        if (this.#animated) obj.animated = true;
        if (this.anim) obj.anim = this.anim.getSerialized();
        if (this.uiAttribs.multiPortNum) obj.multiPortNum = this.uiAttribs.multiPortNum;
        if (this.uiAttribs.multiPortManual) obj.multiPortManual = this.uiAttribs.multiPortManual;

        if (this.uiAttribs.display == "file") obj.display = this.uiAttribs.display;
        if (this.uiAttribs.expose)
        {
            obj.expose = true;
            if (this.uiAttribs.hasOwnProperty("order")) obj.order = this.uiAttribs.order;
        }
        if (this.uiAttribs.title) obj.title = this.uiAttribs.title;
        if ((this.preserveLinks || this.direction == CONSTANTS.PORT.PORT_DIR_OUT) && this.links.length > 0)
        {
            obj.links = [];
            for (const i in this.links)
            {
                if (!this.links[i].ignoreInSerialize && (this.links[i].portIn && this.links[i].portOut)) obj.links.push(this.links[i].getSerialized());
            }
        }

        if (this.direction == Port.DIR_IN && this.links.length > 0)
        {
            for (const i in this.links)
            {
                if (!this.links[i].portIn || !this.links[i].portOut) continue;

                const otherp = this.links[i].getOtherPort(this);
                // check if functions exist, are defined in core_extend_ops code in ui
                if (otherp.op.isInBlueprint2 && this.op.isInBlueprint2)
                {
                    if (otherp.op.isInBlueprint2() && !this.op.isInBlueprint2())
                    {
                        obj.links = obj.links || [];
                        obj.links.push(this.links[i].getSerialized());
                    }
                }
            }
        }

        if (obj.links && obj.links.length == 0) delete obj.links;
        if (this.type === Port.TYPE_FUNCTION) delete obj.value;
        if (this.type === Port.TYPE_FUNCTION && this.links.length == 0) obj = null;
        if (obj && Object.keys(obj).length == 1 && obj.name)obj = null; // obj is null if there is no real information other than name

        cleanJson(obj);

        return obj;

        /* minimalcore:end */
    }

    /**
     * will be overwritten in ui
     * @param {Port} port1
     * @param {Port} port2
     * @returns {boolean}
     */
    shouldLink(port1, port2)
    {
        return !!(port1 && port2);
    }

    /**
     * @description remove all links from port
     */
    removeLinks()
    {
        let count = 0;
        while (this.links.length > 0)
        {
            count++;

            /* minimalcore:start */
            if (count > 5000)
            {
                this.#log.warn("could not delete links... / infinite loop");
                this.links.length = 0;
                break;
            }

            /* minimalcore:end */
            this.links[0].remove();
        }
    }

    /**
     * @description remove all link from port
     * @param {Link} link
     */
    removeLink(link)
    {
        for (let i = 0; i < this.links.length; i++)
            if (this.links[i] == link)
                this.links.splice(i, 1);

        if (this.direction == Port.DIR_IN)
        {
            if (this.type == Port.TYPE_VALUE) this.setValue(this.#valueBeforeLink || 0);
            else this.setValue(this.#valueBeforeLink || null);
        }

        /* minimalcore:start */
        if (CABLES.UI && this.#op.checkLinkTimeWarnings) this.#op.checkLinkTimeWarnings();

        /* minimalcore:end */

        try
        {
            if (this.onLinkChanged) this.onLinkChanged();
            this.emitEvent(Port.EVENT_LINK_CHANGED);
            this.emitEvent(Port.EVENT_LINK_REMOVED);
            this.#op.emitEvent(Port.EVENT_LINK_CHANGED);
        }
        catch (e)
        {
            this.#log.error(e);
        }
    }

    /**
     * @description return port name
     */
    getName()
    {
        return this.name;
    }

    /**
     * @description return port name or title
     */
    getTitle()
    {
        if (this.uiAttribs.title) return this.uiAttribs.title;
        return this.name;
    }

    /**
     * @param {Link} l
     */
    addLink(l)
    {
        this.#valueBeforeLink = this.value;
        this.links.push(l);

        /* minimalcore:start */
        if (CABLES.UI && this.#op.checkLinkTimeWarnings) this.#op.checkLinkTimeWarnings();

        /* minimalcore:end */

        try
        {
            if (this.onLinkChanged) this.onLinkChanged();
            this.emitEvent(Port.EVENT_LINK_CHANGED);
            this.#op.emitEvent(Port.EVENT_LINK_CHANGED);
        }
        catch (e)
        {
            this.#log.error(e);
        }
    }

    /**
     * @param {Port} p2 otherPort
     * @description return link, which is linked to otherPort
     */
    getLinkTo(p2)
    {
        for (const i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return this.links[i];
    }

    /**
     * @param {Port} p2 otherPort
     * @description removes link, which is linked to otherPort
     */
    removeLinkTo(p2)
    {
        for (const i in this.links)
        {
            if (this.links[i].portIn == p2 || this.links[i].portOut == p2)
            {
                this.links[i].remove();

                /* minimalcore:start */
                if (CABLES.UI && this.#op.checkLinkTimeWarnings) this.#op.checkLinkTimeWarnings();

                /* minimalcore:end */

                if (this.onLinkChanged) this.onLinkChanged();
                this.emitEvent(Port.EVENT_LINK_CHANGED);
                this.emitEvent(Port.EVENT_LINK_REMOVED);
                return;
            }
        }
    }

    /**
     * @param {Port} p2 otherPort
     * @description returns true if port is linked to otherPort
     */
    isLinkedTo(p2)
    {
        for (const i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return true;

        return false;
    }

    _activity()
    {
        this.activityCounter++;
    }

    /**
     * @description trigger the linked port (usually invoked on an output function port)
     */
    trigger()
    {
        const linksLength = this.links.length;

        this._activity();
        if (linksLength === 0) return;
        if (!this.#op.enabled) return;

        let portTriggered = null;
        try
        {
            for (let i = 0; i < linksLength; ++i)
            {
                if (this.links[i].portIn)
                {
                    portTriggered = this.links[i].portIn;

                    portTriggered.op.patch.pushTriggerStack(portTriggered);
                    if (!portTriggered._onTriggered)
                    {
                        this.#log.log("no porttriggered?!", portTriggered, portTriggered._onTriggered); // eslint-disable-line
                    }
                    else
                        portTriggered._onTriggered();

                    portTriggered.op.patch.popTriggerStack();
                }
                if (this.links[i]) this.links[i].activity();
            }
        }
        catch (ex)
        {
            if (!portTriggered) return this.#log.error("unknown port error");

            /* minimalcore:start */
            portTriggered.op.enabled = false;
            portTriggered.op.setUiError("crash", "op crashed, port exception " + portTriggered.name, 3);

            if (this.#op.patch.isEditorMode())
            {
                if (portTriggered.op.onError) portTriggered.op.onError(ex);
            }

            /* minimalcore:end */
            this.#log.error("exception in port: ", portTriggered.name, portTriggered.op.name, portTriggered.op.id);
            this.#log.error(ex);
        }
    }

    /* minimalcore:start */
    call()
    {
        this.#log.warn("call deprecated - use trigger() ");
        this.trigger();
    }

    /* minimalcore:end */

    execute()
    {
    }

    /**
     * @param {string} n
     */
    setVariableName(n)
    {
        this.#useVariableName = n;

        this.#op.patch.on("variableRename", (oldname, newname) =>
        {
            if (oldname != this.#useVariableName) return;
            this.#useVariableName = newname;
        });
    }

    getVariableName()
    {
        return this.#useVariableName;
    }

    /**
     * @param {String} v
     */
    setVariable(v)
    {
        this.setAnimated(false);
        const attr = { "useVariable": false };

        if (this._variableIn && this._varChangeListenerId)
        {
            this._variableIn.off(this._varChangeListenerId);
            this._variableIn = null;
        }

        if (v)
        {
            this._variableIn = this.#op.patch.getVar(v);

            if (!this._variableIn)
            {
                // this._log.warn("PORT VAR NOT FOUND!!!", v);
            }
            else
            {
                if (this.type == Port.TYPE_OBJECT)
                {
                    this._varChangeListenerId = this._variableIn.on("change", () => { this.set(null); this.set(this._variableIn.getValue()); });
                }
                else
                {
                    this._varChangeListenerId = this._variableIn.on("change", this.set.bind(this));
                }

                this.set(this._variableIn.getValue());
            }
            this.#useVariableName = v;
            attr.useVariable = true;
            attr.variableName = this.#useVariableName;
        }
        else
        {
            attr.variableName = this.#useVariableName = null;
            attr.useVariable = false;
        }

        this.setUiAttribs(attr);
        this.#op.patch.emitEvent("portSetVariable", this.#op, this, v);
    }

    /**
     * @param {boolean} a
     */
    _handleNoTriggerOpAnimUpdates(a)
    {
        let hasTriggerPort = false;
        // for (let i = 0; i < this._op.portsIn.length; i++)
        // {
        //     if (this._op.portsIn[i].type == Port.TYPE_FUNCTION)
        //     {
        //         hasTriggerPort = true;
        //         break;
        //     }
        // }

        if (!hasTriggerPort)
        {
            if (a)
                this._notriggerAnimUpdate = this.#op.patch.on("onRenderFrame", () =>
                {
                    this.updateAnim();
                });
            else if (this._notriggerAnimUpdate) this._notriggerAnimUpdate = this.#op.patch.off(this._notriggerAnimUpdate);
        }
    }

    bindAnimListeners()
    {
        this.anim.on(Anim.EVENT_CHANGE, () =>
        {
            this.#op.patch.emitEvent("portAnimUpdated", this.#op, this, this.anim);
            this.#op.patch.updateAnimMaxTimeSoon();
        });
        this.anim.on(Anim.EVENT_KEY_DELETE, () =>
        {
            this.#op.patch.updateAnimMaxTimeSoon();
        });

    }

    /**
     * @param {boolean} a
     */
    setAnimated(a)
    {
        let changed = false;
        if (this.#animated != a)
        {
            this.#animated = a;
            this.#op.hasAnimPort = true;
            changed = true;
        }

        if (this.#animated && !this.anim)
        {
            this.anim = new Anim({ "name": "port " + this.name });
            this.bindAnimListeners();
        }

        if (this.#animated)
        {
            let time = 0;
            if (this.#op.patch.gui && this.#op.patch.gui.glTimeline)time = this.#op.patch.timer.getTime();// if timeline is already used otherwise create first key at 0

            if (this.anim.keys.length == 0) this.anim.setValue(time, this.value);
        }
        else
        {
            this.anim = null;
        }

        this._handleNoTriggerOpAnimUpdates(a);

        this.#op.patch.emitEvent("portAnimToggle", this.#op, this, this.anim);

        this.setUiAttribs({ "isAnimated": this.#animated });
        if (changed) this._onAnimToggle();
    }

    toggleAnim()
    {

        /* minimalcore:start */
        this.setAnimated(!this.#animated);
        this.setUiAttribs({ "isAnimated": this.#animated });
        this.#op.patch.emitEvent("portAnimUpdated", this.#op, this, this.anim);
        this.#op.patch.emitEvent("portAnimToggle", this.#op, this, this.anim);

        /* minimalcore:end */
    }

    /**
     * <pre>
     * CABLES.Port.TYPE_VALUE = 0;
     * CABLES.Port.TYPE_FUNCTION = 1;
     * CABLES.Port.TYPE_OBJECT = 2;
     * CABLES.Port.TYPE_TEXTURE = 2;
     * CABLES.Port.TYPE_ARRAY = 3;
     * CABLES.Port.TYPE_DYNAMIC = 4;
     * CABLES.Port.TYPE_STRING = 5;
     * </pre>
     * @return {Number} type of port
     */
    getType()
    {
        return this.type;
    }

    /**
     * @return {Boolean} true if port is linked
     */
    isLinked()
    {
        return this.links.length > 0 || this.#animated || this.#useVariableName != null;
    }

    isBoundToVar()
    {
        const b = this.#useVariableName != null;
        this.uiAttribs.boundToVar = b;
        return b;
    }

    /**
     * @return {Boolean} true if port is animated
     */
    isAnimated()
    {
        return this.#animated;
    }

    /**
     * @return {Boolean} true if port is hidden
     */
    isHidden()
    {
        return this.uiAttribs.hidePort;
    }

    /**
     * @description set callback, which will be executed when port was triggered (usually output port)
     * @param {string} [name] used for tribberButtons (multiple buttons...)
     */
    _onTriggered(name)
    {
        this._activity();
        this.#op.updateAnims();
        if (this.#op.enabled && this.onTriggered) this.onTriggered();

        if (this.#op.enabled) this.emitEvent("trigger", name);
    }

    /**
     * @deprecated
     * @param {function} cb
     */
    onValueChange(cb)
    {
        this.onChange = cb;
    }

    /**
     * @deprecated
     */
    hidePort() {}

    /**
     * Returns the port type string, e.g. "value" based on the port type number
     * @param {Number} type - The port type number
     * @returns {String} - The port type as string
     */
    static portTypeNumberToString(type)
    {

        /* minimalcore:start */
        if (type == Port.TYPE_VALUE) return "value";
        if (type == Port.TYPE_FUNCTION) return "function";
        if (type == Port.TYPE_OBJECT) return "object";
        if (type == Port.TYPE_ARRAY) return "array";
        if (type == Port.TYPE_STRING) return "string";
        if (type == Port.TYPE_DYNAMIC) return "dynamic";
        return "unknown";

        /* minimalcore:end */
    }

    static getTypeString(t)
    {
        // todo:needed only in ui ?remove from core?

        /* minimalcore:start */
        if (t == Port.TYPE_VALUE) return "Number";
        if (t == Port.TYPE_FUNCTION) return "Trigger";
        if (t == Port.TYPE_OBJECT) return "Object";
        if (t == Port.TYPE_DYNAMIC) return "Dynamic";
        if (t == Port.TYPE_ARRAY) return "Array";
        if (t == Port.TYPE_STRING) return "String";
        return "Unknown";

        /* minimalcore:end */
    }

}
