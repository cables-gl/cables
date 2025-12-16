import { Events, Logger } from "cables-shared-client";
import { cleanJson, shortId } from "./utils.js";
import { CONSTANTS } from "./constants.js";
import { Port } from "./core_port.js";
import { SwitchPort } from "./core_port_switch.js";
import { ValueSelectPort } from "./core_port_select.js";
import { MultiPort } from "./core_port_multi.js";
import { Patch } from "./core_patch.js";
import { MultiPort2 } from "./core_port_multi2.js";

/**
 * @typedef Translation
 * @property {number} [x]
 * @property {number} [y]
 */

/**
 * configuration object for loading a patch
 * @typedef OpUiAttribs
 * @property {string} [title] overwrite op title
 * @property {string} [hidePort] hidePort
 * @property {string} [title] overwrite op title
 * @property {String} [title=''] overwrite title of port (by default this is portname)
 * @property {string} [extendTitle] extended op title, shown in grey next to op name
 * @property {object} [storage]
 * @property {boolean} [working]
 * @property {boolean} [bookmarked]
 * @property {boolean} [selected]
 * @property {boolean} [disabled]
 * @property {boolean} [loading]
 * @property {boolean} [resizable]
 * @property {boolean} [hidden]
 * @property {object} [uierrors]
 * @property {string} [color]
 * @property {object} [area]
 * @property {string} [comment]
 * @property {number} [height]
 * @property {number} [width]
 * @property {Translation} [translate]
 * @property {string|number} [subPatch]
 * @property {string} [comment_title]
 * @property {boolean} [highlighted]
 * @property {boolean} [highlightedMore]
 * @property {string} [mathTitle]
 * @property {string} [extendTitlePort]
 * @property {string} [display]
 * @property {string} [hasArea]
 * @property {number} [resizableX]
 * @property {number} [resizableY]
 * @property {number} [tlOrder]
 * @property {number} [heatmapIntensity]
 * @property {string} [commentOverwrite]
 */

/**
 * @typedef CorePatch
 * @type Patch
 */
export class Op extends Events
{
    static OP_VERSION_PREFIX = "_v";
    static EVENT_INIT = "init";
    static EVENT_UIATTR_CHANGE = "onUiAttribsChange";

    static UI_ERRORLEVEL_HINT = 0;
    static UI_ERRORLEVEL_WARNING = 1;
    static UI_ERRORLEVEL_ERROR = 2;
    static UI_ERRORLEVEL_NOTWORKING = 3;

    #objName = "";
    _log = new Logger("core_op");
    //    #name = "";
    #shortOpName = "";

    opId = ""; // unique op id

    /** @type {Array<Port>} */
    portsOut = [];

    /** @type {Patch} */
    patch = null;

    data = {}; // UNUSED, DEPRECATED, only left in for backwards compatibility with userops
    storage = {}; // op-specific data to be included in export

    /** @type {Array<Port>} */
    portsIn = [];
    portsInData = []; // original loaded patch data

    /** @type {OpUiAttribs} */
    uiAttribs = {};
    enabled = true;

    onAnimFrame = null;

    preservedPortTitles = {};
    preservedPortValues = {};
    preservedPortLinks = {};

    linkTimeRules = {
        "needsLinkedToWork": [],
        "needsStringToWork": [],
        "needsParentOp": null
    };

    shouldWork = {};
    hasUiErrors = 0;

    /** @type {Object} */
    uiErrors = {};
    hasAnimPort = false;

    /** @type {Port} */
    patchId = null; // will be defined by subpatchops

    /**
     * @param {Patch} _patch
     * @param {String} _objName
     * @param {String} _id=null
    */
    constructor(_patch, _objName, _id = null)
    {
        super();

        // this.#name = _objName;
        this.opId = _id;
        this.#objName = _objName;
        this.patch = _patch;

        this.#shortOpName = CABLES.getShortOpName(_objName);
        this.getTitle();

        this.id = _id || shortId(); // instance id
        this.onAddPort = null;
        this.onCreate = null;
        this.onResize = null;
        this.onLoaded = null;
        this.onDelete = null;
        this.onError = null;

        this._instances = null;

        /**
         * overwrite this to prerender shader and meshes / will be called by op `loadingStatus`
         */
        this.preRender = null;

        /**
         * overwrite this to initialize your op
         */
        this.init = null;

        /**
         * Implement to render 2d canvas based graphics from in an op - optionaly defined in op instance
         * @param {CanvasRenderingContext2D} context of canvas 2d
         * @param {Object} layer info
         * @param {number} layer.x x position on canvas
         * @param {number} layer.y y position on canvas
         * @param {number} layer.width width of canvas
         * @param {number} layer.height height of canvas
         * @param {number} layer.scale current scaling of patchfield view
         */
    }

    isInBlueprint2() // will be overwritten in ui
    {
        return false;
    }

    getSubPatch()// will be overwritten in ui
    {
        return 0;
    }

    get name()
    {
        return this.getTitle();
    }

    set name(n)
    {
        this.setTitle(n);
    }

    /**
     * @param {string} on
     */
    set _objName(on)
    {
        this.#objName = on;
        this._log = new Logger("op " + on);
    }

    get objName()
    {
        return this.#objName;
    }

    get shortName()
    {
        return this.#shortOpName;
    }

    /**
     * op.require
     *
     * @param {String} _name - module name
     * @returns {Object}
     */
    require(_name)
    {
        if (CABLES.platform && CABLES.StandaloneElectron && !CABLES.platform.frontendOptions.isElectron)
            this.setUiError("notstandalone", "This op will only work in cables standalone version", 3);

        return null;
    }

    checkMainloopExists()
    {
        if (!CABLES.UI) return;
        if (!this.patch.tempData.mainloopOp) this.setUiError("nomainloop", "patch should have a mainloop to use this op");
        else this.setUiError("nomainloop", null);
    }

    /** @returns {string} */
    getTitle()
    {
        if (!this.uiAttribs) return "nouiattribs" + this.shortName;

        /*
         * if ((this.uiAttribs.title === undefined || this.uiAttribs.title === "") && this.objName.indexOf("Ops.Ui.") == -1)
         *     this.uiAttribs.title = this._shortOpName;
         */

        return this.uiAttribs.title || this.#shortOpName;
    }

    /**
     * @param {string} title
     */
    setTitle(title)
    {

        /*
         * this._log.log("settitle", title);
         * this._log.log(
         *     (new Error()).stack
         * );
         */

        if (title != this.getTitle()) this._setUiAttrib({ "title": title });
    }

    /**
     * @param {Object} newAttribs
     */
    setStorage(newAttribs)
    {
        if (!newAttribs) return;
        this.storage = this.storage || {};

        let changed = false;
        for (const p in newAttribs)
        {
            if (this.storage[p] != newAttribs[p]) changed = true;
            this.storage[p] = newAttribs[p];
        }

        if (changed) this.emitEvent("onStorageChange", newAttribs);
    }

    isSubPatchOp()
    {
        if (this.patchId && this.storage) return (this.storage.subPatchVer || this.storage.blueprintVer || 0);
        return false;
    }

    /**
     * setUiAttrib
     * possible values:
     * <pre>
     * warning - warning message - showing up in op parameter panel
     * error - error message - showing up in op parameter panel
     * extendTitle - op title extension, e.g. [ + ]
     * </pre>
     // * @param {OpUiAttribs} newAttribs, e.g. {"attrib":value}
     * @example
     * op.setUiAttrib({"extendTitle":str});
     */
    setUiAttrib(newAttribs)
    {
        this._setUiAttrib(newAttribs);
    }

    /**
     * @param {OpUiAttribs} a
     */
    setUiAttribs(a)
    {
        this._setUiAttrib(a);
    }

    /**
     * @deprecated
     * @param {OpUiAttribs} a
     */
    uiAttr(a)
    {
        this._setUiAttrib(a);
    }

    /**
     * @TODO  move to ui extend class.....
     * @param {OpUiAttribs} newAttribs
     */
    _setUiAttrib(newAttribs)
    {
        if (!newAttribs) return;

        if (typeof newAttribs != "object") this._log.error("op.uiAttrib attribs are not of type object");
        if (!this.uiAttribs) this.uiAttribs = {};

        let changed = false;
        let emitMove = false;
        if (
            CABLES.UI &&
            newAttribs.hasOwnProperty("translate") &&
            (
                !this.uiAttribs.translate ||
                this.uiAttribs.translate.x != newAttribs.translate.x ||
                this.uiAttribs.translate.y != newAttribs.translate.y
            )) emitMove = true;

        if (newAttribs.hasOwnProperty("title") && newAttribs.title != this.uiAttribs.title)
        {
            this.uiAttribs.title = newAttribs.title;
            changed = true;
        }

        if (newAttribs.hasOwnProperty("disabled"))
        {
            changed = true;
            this.setEnabled(!newAttribs.disabled);
        }

        for (const p in newAttribs)
        {
            if (this.uiAttribs[p] != newAttribs[p]) changed = true;
            this.uiAttribs[p] = newAttribs[p];
        }

        if (this.uiAttribs.hasOwnProperty("highlighted") && this.uiAttribs.highlighted == false) delete this.uiAttribs.highlighted;
        if (this.uiAttribs.hasOwnProperty("highlightedMore") && this.uiAttribs.highlightedMore == false) delete this.uiAttribs.highlightedMore;
        if (this.uiAttribs.hasOwnProperty("selected") && this.uiAttribs.selected == false) delete this.uiAttribs.selected;
        if (this.uiAttribs.hasOwnProperty("selected")) changed = true;

        if (changed)
        {
            this.emitEvent(Op.EVENT_UIATTR_CHANGE, newAttribs);
            this.patch.emitEvent("onUiAttribsChange", this, newAttribs);
        }

        if (emitMove) this.emitEvent("move");
    }

    getName()
    {
        return this.#shortOpName;
    }

    /**
     * @param {Port} p
     */
    addOutPort(p)
    {
        p.direction = CONSTANTS.PORT.PORT_DIR_OUT;
        if (p.op != this)console.error("port op is not this...");
        // p._op = this; // remove if above does never happen....

        this.portsOut.push(p);
        this.emitEvent("onPortAdd", p);
        return p;
    }

    hasDynamicPort()
    {
        let i = 0;
        for (i = 0; i < this.portsIn.length; i++)
        {
            if (this.portsIn[i].type == Port.TYPE_DYNAMIC) return true;
            if (this.portsIn[i].getName() == "dyn") return true;
        }
        for (i = 0; i < this.portsOut.length; i++)
        {
            if (this.portsOut[i].type == Port.TYPE_DYNAMIC) return true;
            if (this.portsOut[i].getName() == "dyn") return true;
        }

        return false;
    }

    /**
     * @param {any | Port | MultiPort} p
     * @param {Port} [afterPort] insert the port after given port
     */
    addInPort(p, afterPort)
    {
        p.direction = Port.DIR_IN;
        p._op = this;

        if (!afterPort)
        {
            this.portsIn.push(p);
        }
        else
        {
            const idx = this.portsIn.indexOf(afterPort);
            this.portsIn.splice(idx + 1, 0, p);
        }
        this.emitEvent("onPortAdd", p);

        return p;
    }

    /**
     *
     * @param {string} name
     * @param {string} v
     */
    inFunction(name, v)
    {
        return this.inTrigger(name, v);
    }

    /**
     * create a trigger input port
     * @param {String} name
     * @param {String} v
     * @return {Port} created port
     *
     */
    inTrigger(name, v)
    {
        const p = this.addInPort(this.newPort(this, name, Port.TYPE_FUNCTION));
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * create multiple UI trigger buttons
     * @param {String} name
     * @param {Array} v
     * @return {Port} created port
     */
    inTriggerButton(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_FUNCTION, {
                "display": "button"
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @param {string} name
     * @param {any} v
     */
    inUiTriggerButtons(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_FUNCTION, {
                "display": "buttons"
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {number} v
     */
    inValueFloat(name, v)
    {
        return this.inFloat(name, v);
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {number} v
     */
    inValue(name, v)
    {
        return this.inFloat(name, v);
    }

    /**
     * create a number value input port
     * @param {String} name
     * @param {Number} v
     * @return {Port} created port
     */
    inFloat(name, v)
    {
        const p = this.addInPort(this.newPort(this, name, Port.TYPE_VALUE));

        p.setInitialValue(v);

        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {number | boolean} v
     */
    inValueBool(name, v)
    {
        return this.inBool(name, v);
    }

    /**
     * create a boolean input port, displayed as a checkbox
     * @param {String} name
     * @param {Boolean|number} v
     * @return {Port} created port
     */
    inBool(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_NUMBER, {
                "display": "bool"
            })
        );

        if (v === true)v = 1;
        if (v === false)v = 0;
        p.setInitialValue(v);

        return p;
    }

    /**
     * @param {string} name
     * @param {number} type
     */
    inMultiPort(name, type, uiAttrs)
    {
        const attrs =
            {
                "addPort": true,
                "hidePort": true
            };

        const p = new MultiPort(this, name, type, Port.DIR_IN, attrs, uiAttrs);

        p.ignoreValueSerialize = true;

        this.addInPort(p);
        p.initPorts();

        return p;
    }

    /**
     * @param {string} name
     * @param {number} type
     * @param {import("./core_port.js").PortUiAttribs} uiAttrs
     */
    inMultiPort2(name, type, uiAttrs)
    {
        const attrs =
            {
                "addPort": true,
                "hidePort": true
            };

        const p = new MultiPort2(this, name, type, Port.DIR_IN, attrs, uiAttrs);
        p.ignoreValueSerialize = true;

        this.addInPort(p);
        p.initPorts();

        return p;
    }

    /**
     * @param {string} name
     * @param {number} type
     */
    outMultiPort(name, type, uiAttribsPort = {})
    {
        const p = new MultiPort(
            this,
            name,
            type,
            CONSTANTS.PORT.PORT_DIR_OUT,
            {
                "display": "multiport",
                "hidePort": true
            },
            uiAttribsPort
        );
        p.ignoreValueSerialize = true;

        this.addOutPort(p);
        p.initPorts();

        return p;
    }

    /**
     * @param {string} name
     * @param {number} type
     */
    outMultiPort2(name, type, uiAttribsPort = {})
    {
        const p = new MultiPort2(
            this,
            name,
            type,
            CONSTANTS.PORT.PORT_DIR_OUT,
            {
                "display": "multiport",
                "hidePort": true
            },
            uiAttribsPort
        );
        p.ignoreValueSerialize = true;

        this.addOutPort(p);
        p.initPorts();

        return p;
    }

    /**
     * @param {string} name
     * @param {string} v
     */
    inValueString(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "type": "string"
            })
        );
        p.value = "";

        p.setInitialValue(v);
        return p;
    }

    /**
     * create a String value input port
     * @param {String} name
     * @param {String} v default value
     * @return {Port} created port
     */
    inString(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string"
            })
        );
        v = v || "";

        p.setInitialValue(v);
        return p;
    }

    // /**
    //  * create a String value input port displayed as TextArea
    //  * @memberof Op
    //  * @param {String} name
    //  * @param {String} v default value
    //  * @return {Port} created port
    //  */
    // inValueText(name, v)
    // {
    //     const p = this.addInPort(
    //         this.newPort(this, name, Port.TYPE_VALUE, {
    //             "type": "string",
    //             "display": "text"
    //         })
    //     );
    //     p.value = "";

    //     p.setInitialValue(v);

    //     /*
    //      * if (v !== undefined)
    //      * {
    //      *     p.set(v);
    //      *     p.defaultValue = v;
    //      * }
    //      */
    //     return p;
    // }

    /**
     * @param {string} name
     * @param {string} v
     */
    inTextarea(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string",
                "display": "text"
            })
        );
        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a String value input port displayed as editor
     * @param {String} name
     * @param {String} v default value
     * @param {String} syntax language
     * @param {Boolean} hideFormatButton
     * @return {Port} created port
     */
    inStringEditor(name, v, syntax, hideFormatButton = true)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string",
                "display": "editor",
                "editShortcut": true,
                "editorSyntax": syntax,
                "hideFormatButton": hideFormatButton
            }));

        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     *
     * @param {string} name
     * @param {String} v
     * @param {String} syntax
     */
    inValueEditor(name, v, syntax, hideFormatButton = true)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_NUMBER, {
                "type": "string",
                "display": "editor",
                "editorSyntax": syntax,
                "hideFormatButton": hideFormatButton
            })
        );
        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {any[]} values
     * @param {string} v
     * @param {boolean} noindex
     */
    inValueSelect(name, values, v, noindex)
    {
        return this.inDropDown(name, values, v, noindex);
    }

    /**
     * create a string select box
     * @param {String} name
     * @param {Array} values
     * @param {String} v default value
     * @param {boolean} [noindex]
     * @return {Port} created port
     */
    inDropDown(name, values, v, noindex)
    {
        let p = null;
        if (!noindex)
        {
            const indexPort = this.newPort(this, name + " index", Port.TYPE_NUMBER, {
                "increment": "integer",
                "hideParam": true
            });
            const n = this.addInPort(indexPort);

            if (values) for (let i = 0; i < values.length; i++) values[i] = String(values[i]);

            const valuePort = new ValueSelectPort(
                this,
                name,
                Port.TYPE_NUMBER,
                {
                    "display": "dropdown",
                    "hidePort": true,
                    "type": "string",
                    "values": values
                },
                n
            );

            valuePort.indexPort = indexPort;

            valuePort.on("change", (/** @type {any} */ val, /** @type {Port} */ thePort) =>
            {
                if (!thePort.indexPort.isLinked() && thePort.uiAttribs.values)
                {
                    const idx = thePort.uiAttribs.values.indexOf(val);
                    if (idx > -1) thePort.indexPort.set(idx);
                }
            });

            indexPort.onLinkChanged = () =>
            {
                valuePort.setUiAttribs({ "greyout": indexPort.isLinked() });
            };

            p = this.addInPort(valuePort);

            if (v !== undefined)
            {
                p.set(v);
                const index = values.findIndex((item) => { return item == v; });
                n.setValue(index);
                p.defaultValue = v;
                n.defaultValue = index;
            }
        }
        else
        {
            const valuePort = this.newPort(this, name, Port.TYPE_VALUE, {
                "display": "dropdown",
                "hidePort": true,
                "type": "string",
                "values": values
            });

            p = this.addInPort(valuePort);
        }

        return p;
    }

    /**
     * create a string switch box
     * @param {String} name
     * @param {Array} values
     * @param {String} v default value
     * @param {boolean} noindex
     * @return {Port} created port
     */
    inSwitch(name, values, v, noindex)
    {
        let p = null;
        if (!noindex)
        {
            if (!v)v = values[0];
            const indexPort = this.newPort(this, name + " index", Port.TYPE_VALUE, {
                "increment": "integer",
                "values": values,
                "hideParam": true
            });
            const n = this.addInPort(indexPort);

            if (values) for (let i = 0; i < values.length; i++) values[i] = String(values[i]);

            const switchPort = new SwitchPort(
                this,
                name,
                Port.TYPE_STRING,
                {
                    "display": "switch",
                    "hidePort": true,
                    "type": "string",
                    "values": values
                },
                n
            );

            switchPort.indexPort = indexPort;

            switchPort.on("change", (val, thePort) =>
            {
                if (!thePort.indexPort.isLinked() && thePort.uiAttribs.values)
                {
                    const idx = thePort.uiAttribs.values.indexOf(val);
                    if (idx > -1) thePort.indexPort.set(idx);
                }
            });

            indexPort.onLinkChanged = function ()
            {
                switchPort.setUiAttribs({ "greyout": indexPort.isLinked() });
            };
            p = this.addInPort(switchPort);

            if (v !== undefined)
            {
                p.set(v);
                const index = values.findIndex((item) => { return item == v; });
                n.setValue(index);
                p.defaultValue = v;
                n.defaultValue = index;
            }
        }
        else
        {
            const switchPort = this.newPort(this, name, Port.TYPE_STRING, {
                "display": "switch",
                "hidePort": true,
                "type": "string",
                "values": values
            });
            p = this.addInPort(switchPort);
        }

        return p;
    }

    /**
     *
     * @deprecated
     * @param {string} name
     * @param {number} v
     */
    inValueInt(name, v)
    {
        return this.inInt(name, v);
    }

    /**
     * create a integer input port
     * @param {String} name
     * @param {number} v default value
     * @return {Port} created port
     */
    inInt(name, v)
    {
        // old
        const p = this.addInPort(this.newPort(this, name, Port.TYPE_VALUE, { "increment": "integer" }));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a file/URL input port
     * @param {String} name
     * @param {String} filter
     * @param {String} v
     * @return {Port} created port
     */
    inFile(name, filter, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "display": "file",
                "type": "string",
                "filter": filter
            })
        );
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a file/URL input port
     * @param {String} name
     * @param {String} filter
     * @param {String} v
     * @return {Port} created port
     */
    inUrl(name, filter, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "display": "file",
                "type": "string",
                "filter": filter
            })
        );
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * create a texture input port
     * @param {String} name
     * @param {any} v
     * @return {Port} created port
     */
    inTexture(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_OBJECT, {
                "display": "texture",
                "objType": "texture",
                "preview": true
            })
        );
        p.ignoreValueSerialize = true;
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * create a object input port
     * @param {String} name
     * @param {Object} v
     * @param {String} objType
     * @return {Port} created port
     */
    inObject(name, v, objType)
    {
        const p = this.addInPort(this.newPort(this, name, Port.TYPE_OBJECT, { "objType": objType }));
        p.ignoreValueSerialize = true;

        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @param {string} name
     * @param {string} v
     */
    inGradient(name, v)
    {
        const p = this.addInPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "display": "gradient"
                // "hidePort": true
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @param {Port} p
     * returns {number}
     */
    getPortVisibleIndex(p)
    {
        let ports = this.portsIn;
        if (p.direction == CONSTANTS.PORT_DIR_OUT)ports = this.portsOut;

        let index = 0;
        for (let i = 0; i < ports.length; i++)
        {
            if (ports[i].uiAttribs.hidePort) continue;
            index++;
            if (ports[i] == p) return index;
        }
    }

    /**
     * create a array input port
     * @param {String} name
     * @param {Array|Number} v
     * @param {Number} _stride
     * @return {Port} created port
     */
    inArray(name, v = undefined, _stride = undefined)
    {
        let stride = _stride;
        // @ts-ignore
        if (!_stride && CABLES.isNumeric(v))stride = v;

        const p = this.addInPort(this.newPort(this, name, Port.TYPE_ARRAY, { "stride": stride }));

        if (v !== undefined && (Array.isArray(v) || v == null)) p.set(v);

        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {number} v
     * @param {number} min
     * @param {number} max
     */
    inValueSlider(name, v, min, max)
    {
        return this.inFloatSlider(name, v, min, max);
    }

    /**
     * create a value slider input port
     * @param {String} name
     * @param {number} v
     * @param {number} min
     * @param {number} max
     * @return {Port} created port
     */
    inFloatSlider(name, v, min, max)
    {
        const uiattribs = { "display": "range" };

        if (min != undefined && max != undefined)
        {
            uiattribs.min = min;
            uiattribs.max = max;
        }

        const p = this.addInPort(this.newPort(this, name, Port.TYPE_VALUE, uiattribs));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {string} v
     */
    outFunction(name, v)
    {
        return this.outTrigger(name, v);
    }

    /**
     * create output trigger port
     * @param {String} name
     * @param {String} v
     * @return {Port} created port
     */
    outTrigger(name, v)
    {
        // old
        const p = this.addOutPort(this.newPort(this, name, Port.TYPE_FUNCTION));
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {number} v
     */
    outValue(name, v)
    {
        return this.outNumber(name, v);
    }

    /**
     * create output value port
     * @param {String} name
     * @param {number} v default value
     * @return {Port} created port
     */
    outNumber(name, v)
    {
        const p = this.addOutPort(this.newPort(this, name, Port.TYPE_VALUE));
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {boolean} v
     */
    outValueBool(name, v)
    {
        return this.outBool(name, v);
    }

    /**
     * deprecated create output boolean port
     * @deprecated
     * @param {String} name
     * @param {boolean} v default value
     * @return {Port} created port
     */
    outBool(name, v)
    {
        // old: use outBoolNum
        const p = this.addOutPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "display": "bool"
            })
        );
        if (v !== undefined) p.set(v);
        else p.set(0);
        return p;
    }

    /**
     * create output boolean port,value will be converted to 0 or 1
     * @param {String} name
     * @param {string | number | boolean | any[]} v
     * @return {Port} created port
     */
    outBoolNum(name, v)
    {
        const p = this.addOutPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "display": "boolnum"
            })
        );

        p.set = function (b)
        {
            this.setValue(b ? 1 : 0);
        }.bind(p);

        if (v !== undefined) p.set(v);
        else p.set(0);
        return p;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {string} v
     */
    outValueString(name, v)
    {
        const p = this.addOutPort(
            this.newPort(this, name, Port.TYPE_VALUE, {
                "type": "string"
            })
        );
        if (v !== undefined) p.set(v);
        return p;
    }

    /**
     * create output string port
     * @param {string} name
     * @param {String} v
     * @return {Port} created port
     */
    outString(name, v)
    {
        const p = this.addOutPort(
            this.newPort(this, name, Port.TYPE_STRING, {
                "type": "string"
            })
        );
        if (v !== undefined) p.set(v);
        else p.set("");
        return p;
    }

    /**
     * create output object port
     * @param {String} name
     * @return {Port} created port
     * @param {object} v
     * @param {string} objType
     */
    outObject(name, v, objType)
    {
        const p = this.addOutPort(this.newPort(this, name, Port.TYPE_OBJECT, { "objType": objType || null }));
        p.set(v || null);
        p.ignoreValueSerialize = true;
        return p;
    }

    /**
     * create output array port
     * @param {String} name
     * @return {Port} created port
     * @param {array|number} v
     * @param {number} stride
     */
    outArray(name, v, stride)
    {
        if (!stride && CABLES.isNumeric(v))stride = v;
        const p = this.addOutPort(this.newPort(this, name, Port.TYPE_ARRAY, { "stride": stride }));
        if (v !== undefined && (Array.isArray(v) || v == null)) p.set(v);

        p.ignoreValueSerialize = true;
        return p;
    }

    /**
     * create output texture port
     * @abstract
     * @param {String} name
     * @return {Port} created port
     * @param {any} v
     */
    outTexture(name, v)
    {
        console.log("outtexture not overwritte.,..");
        return null;
    }

    /**
     * @deprecated
     * @param {string} name
     * @param {any} filter
     * @param {any} options
     * @param {any} v
     */
    inDynamic(name, filter, options, v)
    {
        const p = this.newPort(this, name, Port.TYPE_DYNAMIC, options);

        p.shouldLink = () =>
        {
            if (filter && Array.isArray(filter)) return false; // types do not match
            return true; // no filter set
        };

        this.addInPort(p);
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    }

    removeLinks()
    {
        for (let i = 0; i < this.portsIn.length; i++) this.portsIn[i].removeLinks();
        for (let i = 0; i < this.portsOut.length; i++) this.portsOut[i].removeLinks();
    }

    // @TODO should be move to extend...
    getSerialized()
    {
        const opObj = {};

        if (this.opId) opObj.opId = this.opId;
        if (this.patch.storeObjNames) opObj.objName = this.objName;

        opObj.id = this.id;
        opObj.uiAttribs = JSON.parse(JSON.stringify(this.uiAttribs)) || {};

        if (this.storage && Object.keys(this.storage).length > 0) opObj.storage = JSON.parse(JSON.stringify(this.storage));
        if (this.uiAttribs.hasOwnProperty("working") && this.uiAttribs.working == true) delete this.uiAttribs.working;
        if (opObj.uiAttribs.hasOwnProperty("uierrors")) delete opObj.uiAttribs.uierrors;
        if (opObj.uiAttribs.hasOwnProperty("highlighted")) delete opObj.uiAttribs.highlighted;
        if (opObj.uiAttribs.hasOwnProperty("highlightedMore")) delete opObj.uiAttribs.highlightedMore;
        if (opObj.uiAttribs.hasOwnProperty("heatmapIntensity")) delete opObj.uiAttribs.heatmapIntensity;

        if (opObj.uiAttribs.title === "") delete opObj.uiAttribs.title;
        if (opObj.uiAttribs.color === null) delete opObj.uiAttribs.color;
        if (opObj.uiAttribs.comment === null) delete opObj.uiAttribs.comment;

        if (opObj.uiAttribs.title == this.#shortOpName ||
            (this.uiAttribs.title || "").toLowerCase() == this.#shortOpName.toLowerCase()) delete opObj.uiAttribs.title;

        opObj.portsIn = [];
        opObj.portsOut = [];

        for (let i = 0; i < this.portsIn.length; i++)
        {
            const s = this.portsIn[i].getSerialized();
            if (s) opObj.portsIn.push(s);
        }

        for (let i = 0; i < this.portsOut.length; i++)
        {
            const s = this.portsOut[i].getSerialized();
            if (s) opObj.portsOut.push(s);
        }

        if (opObj.portsIn.length == 0) delete opObj.portsIn;
        if (opObj.portsOut.length == 0) delete opObj.portsOut;
        cleanJson(opObj);

        return opObj;
    }

    /**
     * @param {number} type
     */
    getFirstOutPortByType(type)
    {
        for (let i = 0; i < this.portsOut.length; i++)
            if (this.portsOut[i].type == type) return this.portsOut[i];
    }

    /**
     * @param {number} type
     */
    getFirstInPortByType(type)
    {
        for (let i = 0; i < this.portsIn.length; i++)
            if (this.portsIn[i].type == type) return this.portsIn[i];
    }

    /**
     * return port by the name portName
     * @param {String} name
     * @param {boolean} [lowerCase]
     * @return {Port}
     */
    getPort(name, lowerCase = false)
    {
        return this.getPortByName(name, lowerCase);
    }

    /**
     * @param {string} name
     * @param {boolean} [lowerCase]
     * @returns {Port}
     */
    getPortByName(name, lowerCase = false)
    {
        if (lowerCase)
        {
            for (let ipi = 0; ipi < this.portsIn.length; ipi++)
                if (this.portsIn[ipi].getName().toLowerCase() == name || this.portsIn[ipi].id.toLowerCase() == name)
                    return this.portsIn[ipi];

            for (let ipo = 0; ipo < this.portsOut.length; ipo++)
                if (this.portsOut[ipo].getName().toLowerCase() == name || this.portsOut[ipo].id.toLowerCase() == name)
                    return this.portsOut[ipo];
        }
        else
        {
            for (let ipi = 0; ipi < this.portsIn.length; ipi++)
                if (this.portsIn[ipi].getName() == name || this.portsIn[ipi].id == name)
                    return this.portsIn[ipi];

            for (let ipo = 0; ipo < this.portsOut.length; ipo++)
                if (this.portsOut[ipo].getName() == name || this.portsOut[ipo].id == name)
                    return this.portsOut[ipo];
        }
    }

    /**
     * return port by the name id
     * @param {String} id
     * @return {Port}
     */
    getPortById(id)
    {
        for (let ipi = 0; ipi < this.portsIn.length; ipi++) if (this.portsIn[ipi].id == id) return this.portsIn[ipi];
        for (let ipo = 0; ipo < this.portsOut.length; ipo++) if (this.portsOut[ipo].id == id) return this.portsOut[ipo];
    }

    updateAnims()
    {
        if (this.hasAnimPort)
            for (let i = 0; i < this.portsIn.length; i++) this.portsIn[i].updateAnim();
    }

    log()
    {
        this._log.log(...arguments);
    }

    /**
     * @deprecated
     */
    error()
    {
        this._log.error(...arguments);
    }

    logError()
    {
        this._log.error(...arguments);
    }

    /**
     * @deprecated
     */
    warn()
    {
        this._log.warn(...arguments);
    }

    logWarn()
    {
        this._log.warn(...arguments);
    }

    /**
     * @deprecated
     */
    verbose()
    {
        this._log.verbose(...arguments);
    }

    logVerbose()
    {
        this._log.verbose(...arguments);
    }

    // todo: check instancing stuff?
    cleanUp()
    {
        if (this._instances)
        {
            for (let i = 0; i < this._instances.length; i++)
                if (this._instances[i].onDelete) this._instances[i].onDelete();

            this._instances.length = 0;
        }

        for (let i = 0; i < this.portsIn.length; i++)
            this.portsIn[i].setAnimated(false);

        if (this.onAnimFrame) this.patch.removeOnAnimFrame(this);
    }

    // todo: check instancing stuff?
    instanced(triggerPort)
    {
        return false;

        /*
         * this._log.log("instanced", this.patch.instancing.numCycles());
         * if (this.patch.instancing.numCycles() === 0) return false;
         */

        /*
         * let i = 0;
         * let ipi = 0;
         * if (!this._instances || this._instances.length != this.patch.instancing.numCycles())
         * {
         *     if (!this._instances) this._instances = [];
         *     this._.log("creating instances of ", this.objName, this.patch.instancing.numCycles(), this._instances.length);
         *     this._instances.length = this.patch.instancing.numCycles();
         */

        /*
         *     for (i = 0; i < this._instances.length; i++)
         *     {
         *         this._instances[i] = this.patch.createOp(this.objName, true);
         *         this._instances[i].instanced ()
         *         {
         *             return false;
         *         };
         *         this._instances[i].uiAttr(this.uiAttribs);
         */

        /*
         *         for (let ipo = 0; ipo < this.portsOut.length; ipo++)
         *         {
         *             if (this.portsOut[ipo].type == Port.TYPE_FUNCTION)
         *             {
         *                 this._instances[i].getPortByName(this.portsOut[ipo].name).trigger = this.portsOut[ipo].trigger.bind(this.portsOut[ipo]);
         *             }
         *         }
         *     }
         */

        /*
         *     for (ipi = 0; ipi < this.portsIn.length; ipi++)
         *     {
         *         this.portsIn[ipi].onChange = null;
         *         this.portsIn[ipi].onValueChanged = null;
         *     }
         * }
         */

        /*
         * const theTriggerPort = null;
         * for (ipi = 0; ipi < this.portsIn.length; ipi++)
         * {
         *     if (
         *         this.portsIn[ipi].type == Port.TYPE_VALUE ||
         *         this.portsIn[ipi].type == Port.TYPE_ARRAY
         *     )
         *     {
         *         this._instances[this.patch.instancing.index()].portsIn[ipi].set(this.portsIn[ipi].get());
         *     }
         *     if (this.portsIn[ipi].type == Port.TYPE_FUNCTION)
         *     {
         *         // if(this._instances[ this.patch.instancing.index() ].portsIn[ipi].name==triggerPort.name)
         *         // theTriggerPort=this._instances[ this.patch.instancing.index() ].portsIn[ipi];
         *     }
         * }
         */

        // if (theTriggerPort) theTriggerPort.onTriggered();

        /*
         * for (ipi = 0; ipi < this.portsOut.length; ipi++)
         * {
         *     if (this.portsOut[ipi].type == Port.TYPE_VALUE)
         *     {
         *         this.portsOut[ipi].set(this._instances[this.patch.instancing.index()].portsOut[ipi].get());
         *     }
         * }
         */

        // return true;
    }

    // todo: check instancing stuff?
    initInstancable()
    {
        //         if(this.isInstanced)
        //         {
        //             this._log.log('cancel instancing');
        //             return;
        //         }
        //         this._instances=[];
        //         for(var ipi=0;ipi<this.portsIn.length;ipi++)
        //         {
        //             if(this.portsIn[ipi].type==Port.TYPE_VALUE)
        //             {
        //
        //             }
        //             if(this.portsIn[ipi].type==Port.TYPE_FUNCTION)
        //             {
        //                 // var piIndex=ipi;
        //                 this.portsIn[ipi].onTriggered=function(piIndex)
        //                 {
        //
        //                     var i=0;
        // // this._log.log('trigger',this._instances.length);
        //
        //                 }.bind(this,ipi );
        //
        //             }
        // };
        // this._instances=null;
    }

    // setValues(obj)
    // {
    //     for (const i in obj)
    //     {
    //         const port = this.getPortByName(i);
    //         if (port) port.set(obj[i]);
    //         else this._log.warn("op.setValues: port not found:", i);
    //     }
    // }

    /**
     * return true if op has this error message id
     * @param {String} id
     * @returns {Boolean} - has id
     */
    hasUiError(id)
    {
        return this.uiErrors.hasOwnProperty(id) && this.uiErrors[id];
    }

    /**
     * show op error message - set message to null to remove error message
     * @param {string} _id error id
     * @param {string} _txt text message
     * @param {number} _level level
     */
    setUiError(_id, _txt, _level = 2, _options = {})
    {
        // overwritten in ui: core_extend_op
    }

    /**
     * enable/disable op
     * @function
     * @param {boolean} b
     */
    setEnabled(b)
    {
        this.enabled = b;
        this.emitEvent("onEnabledChange", b);
    }

    /**
     * organize ports into a group
     * @function
     * @param {String} name
     * @param {Array} ports
     */
    setPortGroup(name, ports)
    {
        for (let i = 0; i < ports.length; i++)
        {
            if (ports[i])
                if (ports[i].setUiAttribs) ports[i].setUiAttribs({ "group": name });
                else this._log.error("setPortGroup: invalid port!");
        }
    }

    /**
     * visually indicate ports that they are coordinate inputs
     * @function
     * @param {Port} px
     * @param {Port} py
     * @param {Port} pz
     */
    setUiAxisPorts(px, py, pz)
    {
        if (px) px.setUiAttribs({ "axis": "X" });
        if (py) py.setUiAttribs({ "axis": "Y" });
        if (pz) pz.setUiAttribs({ "axis": "Z" });
    }

    /**
     * remove port from op
     * @param {Port} port to remove
     */
    removePort(port)
    {
        for (let ipi = 0; ipi < this.portsIn.length; ipi++)
        {
            if (this.portsIn[ipi] == port)
            {
                this.portsIn.splice(ipi, 1);
                this.emitEvent(Op.EVENT_UIATTR_CHANGE, {});
                this.emitEvent("onPortRemoved", {});
                return;
            }
        }
        for (let ipi = 0; ipi < this.portsOut.length; ipi++)
        {
            if (this.portsOut[ipi] == port)
            {
                this.portsOut.splice(ipi, 1);
                this.emitEvent(Op.EVENT_UIATTR_CHANGE, {});
                this.emitEvent("onPortRemoved", {});
                return;
            }
        }
    }

    /**
     * show a warning of this op is not a child of parentOpName
     * @function
     * @param {String} parentOpName
     */
    toWorkNeedsParent(parentOpName)
    {
        this.linkTimeRules.needsParentOp = parentOpName;
    }

    /**
     * show a warning of this op is a child of parentOpName
     * @param {String} parentOpName
     * @param {number} type
     */
    toWorkShouldNotBeChild(parentOpName, type)
    {
        if (!this.patch.isEditorMode()) return;
        this.linkTimeRules.forbiddenParent = parentOpName;
        if (type != undefined) this.linkTimeRules.forbiddenParentType = type;
    }

    toWorkPortsNeedsString()
    {
        if (!this.patch.isEditorMode()) return;
        for (let i = 0; i < arguments.length; i++)
            if (this.linkTimeRules.needsStringToWork.indexOf(arguments[i]) == -1) this.linkTimeRules.needsStringToWork.push(arguments[i]);
    }

    /**
     * show a small X to indicate op is not working when given ports are not linked
     * @param {Array<Port>} port
     */
    toWorkPortsNeedToBeLinked()
    {
        if (!this.patch.isEditorMode()) return;
        for (let i = 0; i < arguments.length; i++)
            if (this.linkTimeRules.needsLinkedToWork.indexOf(arguments[i]) == -1) this.linkTimeRules.needsLinkedToWork.push(arguments[i]);
    }

    toWorkPortsNeedToBeLinkedReset()
    {
        if (!this.patch.isEditorMode()) return;
        this.linkTimeRules.needsLinkedToWork.length = 0;
        if (this.checkLinkTimeWarnings) this.checkLinkTimeWarnings();
    }

    initVarPorts()
    {
        for (let i = 0; i < this.portsIn.length; i++)
            if (this.portsIn[i].getVariableName()) this.portsIn[i].setVariable(this.portsIn[i].getVariableName());
    }

    checkLinkTimeWarnings() {}
    _checkLinksNeededToWork() { }

    /**
     * refresh op parameters, if current op is selected
     */
    refreshParams()
    {
        if (this.patch && this.patch.isEditorMode() && this.isCurrentUiOp()) Patch.getGui().opParams.show(this);
    }

    /**
     * Returns true if op is selected and parameter are shown in the editor, can only return true if in editor/ui
     * @returns {Boolean} - is current ui op
     */
    isCurrentUiOp()
    {
        if (this.patch.isEditorMode()) return Patch.getGui().patchView.isCurrentOp(this);
    }

    /**
     *
     * @param {Number} api graphics api, 1 = webgl, 2 = webgpu
     */
    checkGraphicsApi(api = 1)
    {
        if (this.patch.isEditorMode())
            if (this.patch.cg && this.patch.cg.gApi != api)
                this.setUiError("wronggapi", "Wrong graphics API", 2);

    }

    /**
     * @param {Op} op
     * @param {string} name
     * @param {number} type
     * @param {import("./core_port.js").PortUiAttribs} [uiAttribs]
     */
    newPort(op, name, type, uiAttribs)
    {
        return new CABLES.Port(op, name, type, uiAttribs);
    }

}
