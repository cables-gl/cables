import { Events, Logger } from "cables-shared-client";
import { CONSTANTS } from "./constants.js";
import { cleanJson } from "./utils.js";
import { Link } from "./core_link.js";
import { Op } from "./core_op.js";
import { Anim } from "./anim.js";
import { PatchVariable } from "./core_variable.js";

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
 * @property  {String} [display] internal: do not set manually
 * @property  {String} [axis] internal: do not set manually
 * @property  {String} [type] internal: do not set manually
 * @property  {String} [objType] internal: do not set manually
 * @property  {String} [filter] internal: do not set manually
 * @property  {boolean} [preview] internal: do not set manually
 * @property  {Array<String>} [values] internal: do not set manually
 *
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

    #oldAnimVal = -5711;

    #uiActiveState = true;
    #valueBeforeLink = null;
    // #lastAnimFrame = -1;
    #animated = false;
    // #tempLastUiValue = null;
    #useVariableName = null;

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
        this._log = new Logger("core_port");

        /**
         * @type {Number}
         * @name direction
         * @instance
         * @memberof Port
         * @description direction of port (input(0) or output(1))
         */
        this.direction = Port.DIR_IN;
        this.id = String(CABLES.simpleId());

        /** @type {Op} */
        this._op = ___op;

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
        this._log.stack("use port.op, not .parent");
        return this.op;
    }

    get title()
    {
        return this.uiAttribs.title || this.name;
    }

    get op()
    {
        return this._op;
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
     * @function copyLinkedUiAttrib
     * @memberof Port
     * @param {string} which attrib name
     * @param {Port} port source port
     * @instance
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
        if (!CABLES.UI) return;
        if (!this.isLinked()) return;

        const attr = {};
        attr[which] = this.links[0].getOtherPort(this).getUiAttrib(which);
        port.setUiAttribs(attr);
    }

    /*
     * sdjksdjklsd
     * TODO make extend class for ports, like for ops only for ui
     */
    getValueForDisplay()
    {
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

            str = str.replace(/[\u00A0-\u9999<>\&]/g, function (/** @type {String} */ i)
            {
                return "&#" + i.charCodeAt(0) + ";";
            });

            if (str.length > 100) str = str.substring(0, 100);
        }
        else
        {
            str = this.value;
        }
        return str;
    }

    /**
     * change listener for input value ports, overwrite to react to changes
     * @function onChange
     * @memberof Port
     * @instance
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
     * @function remove
     * @memberof Port
     * @instance
     * @description remove port
     */
    remove()
    {
        this.removeLinks();
        this._op.removePort(this);
    }

    /**
     * set ui attributes
     * @function setUiAttribs
     * @memberof Port
     * @instance
     * @param {PortUiAttribs} newAttribs

     * @example
     * myPort.setUiAttribs({greyout:true});
     */
    setUiAttribs(newAttribs)
    {
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

        if (newAttribs.hasOwnProperty("expose")) this._op.patch.emitEvent("subpatchExpose", this._op.uiAttribs.subPatch);

        if (changed) this.emitEvent("onUiAttrChange", newAttribs, this);
    }

    /**
     * get ui attributes
     * @function getUiAttribs
     * @memberof Port
     * @example
     * myPort.getUiAttribs();
     */
    getUiAttribs()
    {
        return this.uiAttribs;
    }

    /**
     * get ui attribute
     * @function getUiAttrib
     * @memberof Port
     * @instance
     * @param {String} attribName
     * <pre>
     * attribName - return value of the ui-attribute, or null on unknown attribute
     * </pre>
     * @example
     * myPort.setUiAttribs("values");
     */
    getUiAttrib(attribName)
    {
        if (!this.uiAttribs || !this.uiAttribs.hasOwnProperty(attribName)) return null;
        return this.uiAttribs[attribName];
    }

    /**
     * @function get
     * @memberof Port
     * @instance
     * @description get value of port
     */
    get()
    {
        if (this.#animated && this.lastAnimFrame != this._op.patch.getFrameNum())
        {
            this.lastAnimFrame = this._op.patch.getFrameNum();

            let animval = this.anim.getValue(this._op.patch.timer.getTime());

            if (this.value != animval)
            {
                this.value = animval;
                this.#oldAnimVal = this.value;
                this.forceChange();
            }
        }

        return this.value;
    }

    setRef(v)
    {
        this.forceRefChange = true;
        this.set(v);
    }

    /**
     * @function setValue
     * @memberof Port
     * @instance
     * @description set value of port / will send value to all linked ports (only for output ports)
     */
    set(v)
    {
        this.setValue(v);
    }

    setValue(v)
    {
        if (v === undefined) v = null;

        if (CABLES.UI && CABLES.UI.showDevInfos)
            if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT && this.type == Port.TYPE_OBJECT && v && !this.forceRefChange)
                this._log.warn("object port [" + this.name + "] uses .set [" + this.op.objName + "]");

        if (this._op.enabled && !this.crashed)
        {
            if (v !== this.value || this.changeAlways || this.type == Port.TYPE_TEXTURE || this.type == Port.TYPE_ARRAY)
            {
                if (this.#animated)
                {
                    this.anim.setValue(this._op.patch.timer.getTime(), v);
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
                        this.onTriggered = function (a) {};

                        this._log.error("exception in ", this._op);
                        this._log.error(ex);

                        this._op.patch.emitEvent("exception", ex, this._op);
                    }

                    if (this._op && this._op.patch && this._op.patch.isEditorMode() && this.type == Port.TYPE_TEXTURE) gui.texturePreview().updateTexturePort(this);
                }

                if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) for (let i = 0; i < this.links.length; ++i) this.links[i].setValue();
            }
        }
    }

    updateAnim()
    {
        if (this.#animated)
        {
            this.value = this.get();

            if (this.#oldAnimVal != this.value || this.changeAlways)
            {
                this.#oldAnimVal = this.value;
                this.forceChange();
            }
            this.#oldAnimVal = this.value;
        }
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
        this.emitEvent("change", this.value, this);

        if (this.onChange) this.onChange(this, this.value);
        else if (this.onValueChanged) this.onValueChanged(this, this.value); // deprecated
    }

    /**
     * @function getTypeString
     * @memberof Port
     * @instance
     * @description get port type as string, e.g. "Function","Value"...
     * @return {String} type
     */
    getTypeString()
    {
        if (this.type == Port.TYPE_VALUE) return "Number";
        if (this.type == Port.TYPE_FUNCTION) return "Trigger";
        if (this.type == Port.TYPE_OBJECT) return "Object";
        if (this.type == Port.TYPE_DYNAMIC) return "Dynamic";
        if (this.type == Port.TYPE_ARRAY) return "Array";
        if (this.type == Port.TYPE_STRING) return "String";
        return "Unknown";
    }

    /**
     * @param {Object} objPort
     */
    deSerializeSettings(objPort)
    {
        if (!objPort) return;
        if (objPort.animated) this.setAnimated(objPort.animated);
        if (objPort.useVariable) this.setVariableName(objPort.useVariable);
        if (objPort.title) this.setUiAttribs({ "title": objPort.title });
        if (objPort.expose) this.setUiAttribs({ "expose": true });
        if (objPort.order) this.setUiAttribs({ "order": objPort.order });

        if (objPort.multiPortManual) this.setUiAttribs({ "multiPortManual": objPort.multiPortManual });
        if (objPort.multiPortNum) this.setUiAttribs({ "multiPortNum": objPort.multiPortNum });

        if (objPort.anim)
        {
            if (!this.anim) this.anim = new Anim({ "name": "port " + this.name });
            this._op.hasAnimPort = true;
            this.anim.on("onChange", () =>
            {
                this._op.patch.emitEvent("portAnimUpdated", this._op, this, this.anim);
            });
            if (objPort.anim.loop) this.anim.loop = objPort.anim.loop;
            for (const ani in objPort.anim.keys)
            {
                this.anim.keys.push(new CABLES.AnimKey(objPort.anim.keys[ani], this.anim));
            }
            this._op.patch.emitEvent("portAnimUpdated", this._op, this, this.anim);

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

        // console.log(obj);
        cleanJson(obj);

        return obj;
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
     * @function removeLinks
     * @memberof Port
     * @instance
     * @description remove all links from port
     */
    removeLinks()
    {
        let count = 0;
        while (this.links.length > 0)
        {
            count++;
            if (count > 5000)
            {
                this._log.warn("could not delete links... / infinite loop");
                this.links.length = 0;
                break;
            }
            this.links[0].remove();
        }
    }

    /**
     * @function removeLink
     * @memberof Port
     * @instance
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

        if (CABLES.UI && this._op.checkLinkTimeWarnings) this._op.checkLinkTimeWarnings();

        try
        {
            if (this.onLinkChanged) this.onLinkChanged();
            this.emitEvent("onLinkChanged");
            this.emitEvent("onLinkRemoved");
            this._op.emitEvent("onLinkChanged");
        }
        catch (e)
        {
            this._log.error(e);
        }
    }

    /**
     * @function getName
     * @memberof Port
     * @instance
     * @description return port name
     */
    getName()
    {
        return this.name;
    }

    /**
     * @function getTitle
     * @memberof Port
     * @instance
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
        if (CABLES.UI && this._op.checkLinkTimeWarnings) this._op.checkLinkTimeWarnings();

        try
        {
            if (this.onLinkChanged) this.onLinkChanged();
            this.emitEvent("onLinkChanged");
            this._op.emitEvent("onLinkChanged");
        }
        catch (e)
        {
            this._log.error(e);
        }
    }

    /**
     * @function getLinkTo
     * @memberof Port
     * @instance
     * @param {Port} p2 otherPort
     * @description return link, which is linked to otherPort
     */
    getLinkTo(p2)
    {
        for (const i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return this.links[i];
    }

    /**
     * @function removeLinkTo
     * @memberof Port
     * @instance
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
                if (CABLES.UI && this._op.checkLinkTimeWarnings) this._op.checkLinkTimeWarnings();

                if (this.onLinkChanged) this.onLinkChanged();
                this.emitEvent("onLinkChanged");
                this.emitEvent("onLinkRemoved");
                return;
            }
        }
    }

    /**
     * @function isLinkedTo
     * @memberof Port
     * @instance
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
     * @function trigger
     * @memberof Port
     * @instance
     * @description trigger the linked port (usually invoked on an output function port)
     */
    trigger()
    {
        const linksLength = this.links.length;

        this._activity();
        if (linksLength === 0) return;
        if (!this._op.enabled) return;

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
                        console.log(portTriggered, portTriggered._onTriggered);
                    }
                    portTriggered._onTriggered(null);

                    portTriggered.op.patch.popTriggerStack();
                }
                if (this.links[i]) this.links[i].activity();
            }
        }
        catch (ex)
        {
            portTriggered.op.enabled = false;

            if (this._op.patch.isEditorMode())
            {
                if (portTriggered.op.onError) portTriggered.op.onError(ex);
            }
            this._log.error("exception in port: ", portTriggered.name, portTriggered.op.name, portTriggered.op);
            this._log.error(ex);
        }
    }

    call()
    {
        this._log.warn("call deprecated - use trigger() ");
        this.trigger();
    }

    execute()
    {
    }

    /**
     * @param {string} n
     */
    setVariableName(n)
    {
        this.#useVariableName = n;

        this._op.patch.on("variableRename", (oldname, newname) =>
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
            this._variableIn = this._op.patch.getVar(v);

            if (!this._variableIn)
            {
                this._log.warn("PORT VAR NOT FOUND!!!", v);
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
        this._op.patch.emitEvent("portSetVariable", this._op, this, v);
    }

    /**
     * @param {boolean} a
     */
    _handleNoTriggerOpAnimUpdates(a)
    {
        let hasTriggerPort = false;
        for (let i = 0; i < this._op.portsIn.length; i++)
        {
            if (this._op.portsIn[i].type == Port.TYPE_FUNCTION)
            {
                hasTriggerPort = true;
                break;
            }
        }

        if (!hasTriggerPort)
        {
            if (a) this._notriggerAnimUpdate = this._op.patch.on("onRenderFrame", () =>
            {
                this.updateAnim();
            });
            else if (this._notriggerAnimUpdate) this._notriggerAnimUpdate = this._op.patch.off(this._notriggerAnimUpdate);
        }
    }

    /**
     * @param {boolean} a
     */
    setAnimated(a)
    {
        if (this.#animated != a)
        {
            this.#animated = a;
            this._op.hasAnimPort = true;

            if (this.#animated && !this.anim)
            {
                this.anim = new Anim({ "name": "port " + this.name });
                this.anim.on("onChange", () =>
                {
                    this._op.patch.emitEvent("portAnimUpdated", this._op, this, this.anim);
                });
            }
            this._onAnimToggle();
        }

        this._handleNoTriggerOpAnimUpdates(a);
        if (!a)
        {
            this.anim = null;
        }

        this._op.patch.emitEvent("portAnimToggle", this._op, this, this.anim);

        this.setUiAttribs({ "isAnimated": this.#animated });
    }

    toggleAnim()
    {
        this.#animated = !this.#animated;
        if (this.#animated && !this.anim)
        {
            this.anim = new Anim({ "name": "port " + this.name });
            this.anim.on("onChange", () =>
            {
                this._op.patch.emitEvent("portAnimUpdated", this._op, this, this.anim);
            });
        }
        this.setAnimated(this.#animated);
        this._onAnimToggle();
        this.setUiAttribs({ "isAnimated": this.#animated });
        this._op.patch.emitEvent("portAnimUpdated", this._op, this, this.anim);
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
     * @function getType
     * @memberof Port
     * @instance
     * @return {Number} type of port
     */
    getType()
    {
        return this.type;
    }

    /**
     * @function isLinked
     * @memberof Port
     * @instance
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
     * @function isHidden
     * @memberof Port
     * @instance
     * @return {Boolean} true if port is hidden
     */
    isHidden()
    {
        return this.uiAttribs.hidePort;
    }

    /**
     * @function onTriggered
     * @memberof Port
     * @instance
     * @param {function} a onTriggeredCallback
     * @description set callback, which will be executed when port was triggered (usually output port)
     */
    _onTriggered(a)
    {
        this._activity();
        this._op.updateAnims();
        if (this._op.enabled && this.onTriggered) this.onTriggered(a);

        if (this._op.enabled) this.emitEvent("trigger");
    }

    /**
     * @param {any} v
     */
    _onSetProfiling(v) // used in editor: profiler tab
    {
        this._op.patch.profiler.add("port", this);
        this.setValue(v);
        this._op.patch.profiler.add("port", null);
    }

    _onTriggeredProfiling() // used in editor: profiler tab
    {
        if (this._op.enabled && this.onTriggered)
        {
            this._op.patch.profiler.add("port", this);
            this.onTriggered();
            this._op.patch.profiler.add("port", null);
        }
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
}

/**
 * Returns the port type string, e.g. "value" based on the port type number
 * @function portTypeNumberToString
 * @instance
 * @memberof Port
 * @param {Number} type - The port type number
 * @returns {String} - The port type as string
 */
Port.portTypeNumberToString = function (type)
{
    if (type == Port.TYPE_VALUE) return "value";
    if (type == Port.TYPE_FUNCTION) return "function";
    if (type == Port.TYPE_OBJECT) return "object";
    if (type == Port.TYPE_ARRAY) return "array";
    if (type == Port.TYPE_STRING) return "string";
    if (type == Port.TYPE_DYNAMIC) return "dynamic";
    return "unknown";
};
