import { uuid, UTILS } from "./utils";

import { CONSTANTS } from "./constants";
import { Port, SwitchPort, ValueSelectPort } from "./core_port";
import { Link } from "./core_link";
import { Log } from "./log";

/**
 * op the class of all operators
 * @external CABLES
 * @namespace Op
 * @hideconstructor
 */

/**
 * @type {Object}
 * @name attachments
 * @instance
 * @memberof Op
 * @description access file attachments as String values
 * @example
 * // set shader source to attached files (files are called shader.vert / shader.frag)
 * shader.setSource(attachments.shader_vert,attachments.shader_frag);
 */

var Ops = {};
// var CABLES=CABLES || {};

// export const OP_PORT_TYPE_VALUE = 0;
// export const OP_PORT_TYPE_FUNCTION = 1;
// export const OP_PORT_TYPE_OBJECT = 2;
// export const OP_PORT_TYPE_TEXTURE = 2;
// export const OP_PORT_TYPE_ARRAY = 3;
// export const OP_PORT_TYPE_DYNAMIC = 4;
// export const OP_PORT_TYPE_STRING = 5;

// export const OP_VERSION_PREFIX = "_v";

const Op = function ()
{
    this.data = {}; // reserved for op-specific user-data
    this.objName = "";
    this.portsOut = [];
    this.portsIn = [];
    this.portsInData = []; // original loaded patch data
    this.opId = ""; // unique op id
    this.uiAttribs = {};
    this.enabled = true;
    this.patch = arguments[0];
    this.name = arguments[1];
    this._needsLinkedToWork = [];
    this._needsParentOp = null;
    this._shortOpName = "";
    
    this._hasUiErrors=false;
    this._uiErrors = {};
    

    if (arguments[1])
    {
        this._shortOpName = arguments[1].split(".")[arguments[1].split(".").length - 1];

        if (this._shortOpName.indexOf(CONSTANTS.OP.OP_VERSION_PREFIX) > 0)
        {
            var n = this._shortOpName.split(CONSTANTS.OP.OP_VERSION_PREFIX)[1];
            this._shortOpName = this._shortOpName.substring(0, this._shortOpName.length - (CONSTANTS.OP.OP_VERSION_PREFIX + n).length);
        }

        this.uiAttribs.title = this._shortOpName;
    }

    this.id = arguments[2] || uuid(); // instance id
    this.onAddPort = null;
    this.onCreate = null;
    this.onResize = null;
    this.onLoaded = null;
    this.onDelete = null;
    this.onUiAttrChange = null;
    this._eventCallbacks = {};
    this._instances = null;

    /**
     * overwrite this to prerender shader and meshes / will be called by op `loadingStatus`
     * @function preRender
     * @memberof Op
     * @instance
     */
    this.preRender = null;

    /**
     * overwrite this to initialize your op
     * @function init
     * @memberof Op
     * @instance
     */
    this.init = null;
};

{
    Op.prototype.clearUiAttrib = function (name)
    {
        var obj = {};
        obj.name = null;
        this.uiAttrib(obj);
    };

    Op.prototype.setTitle = function (name)
    {
        var doFireEvent = this.name != name;

        this.name = name;
        this.uiAttr({ title: name });

        if (doFireEvent) this.fireEvent("onTitleChange", name);
    };

    const _setUiAttrib = function (newAttribs)
    {
        if (!this.uiAttribs) this.uiAttribs = {};
        for (var p in newAttribs)
        {
            this.uiAttribs[p] = newAttribs[p];
        }

        this.fireEvent("onUiAttribsChange", newAttribs);
    };
    /**
     * setUiAttrib
     * possible values:
     * <pre>
     * warning - warning message - showing up in op parameter panel
     * error - error message - showing up in op parameter panel
     * extendTitle - op title extension, e.g. [ + ]
     * </pre>
     * @function setUiAttrib
     * @param {Object} newAttribs, e.g. {"attrib":value}
     * @memberof Op
     * @instance
     * @example
     * op.setUiAttrib({"extendTitle":str});
     */
    Op.prototype.setUiAttrib = _setUiAttrib;
    Op.prototype.uiAttr = _setUiAttrib;

    Op.prototype.getName = function ()
    {
        if (this.uiAttribs.name) return this.uiAttribs.name;

        return this.objName.split(".");

        // return this.name;
    };

    Op.prototype.addOutPort = function (p)
    {
        p.direction = CONSTANTS.PORT.PORT_DIR_OUT;
        p.parent = this;
        this.portsOut.push(p);
        if (this.onAddPort) this.onAddPort(p);
        // this.fireEvent("onPortsChanged",{});
        return p;
    };

    Op.prototype.hasPort = function (name)
    {
        for (var ipi = 0; ipi < this.portsIn.length; ipi++) if (this.portsIn[i].getName() == name) return true;
        return false;
    };

    Op.prototype.hasDynamicPort = function ()
    {
        var i = 0;
        for (i = 0; i < this.portsIn.length; i++)
        {
            if (this.portsIn[i].type == CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC) return true;
            if (this.portsIn[i].getName() == "dyn") return true;
        }
        for (i = 0; i < this.portsOut.length; i++)
        {
            if (this.portsOut[i].type == CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC) return true;
            if (this.portsOut[i].getName() == "dyn") return true;
        }

        return false;
    };

    Op.prototype.addInPort = function (p)
    {
        if (!(p instanceof Port))
        {
            throw new Error("parameter is not a port!");
        }
        p.direction = CONSTANTS.PORT.PORT_DIR_IN;
        p.parent = this;
        this.portsIn.push(p);
        if (this.onAddPort) this.onAddPort(p);
        // this.fireEvent("onPortsChanged",{});
        return p;
    };

    /**
     * create a trigger input port
     * @function inTrigger
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     *
     */
    Op.prototype.inFunction = Op.prototype.inTrigger = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_FUNCTION));
        if (v !== undefined) p.set(v);
        return p;
    };

    /**
     * create multiple UI trigger buttons
     * @function inTriggerButton
     * @memberof Op
     * @instance
     * @param {String} name
     * @param {Array} names
     * @return {Port} created port
     */
    Op.prototype.inFunctionButton = Op.prototype.inTriggerButton = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_FUNCTION, { display: "button" }));
        if (v !== undefined) p.set(v);
        return p;
    };


    Op.prototype.inFunctionButton = Op.prototype.inUiTriggerButtons = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_FUNCTION, { display: "buttons" }));
        if (v !== undefined) p.set(v);
        return p;
    };


    /**
     * create a number value input port
     * @function inFloat
     * @memberof Op
     * @instance
     * @param {String} name
     * @param {Number} value
     * @return {Port} created port

     */

    Op.prototype.inValueFloat = Op.prototype.inValue = Op.prototype.inFloat = function (name, v)
    {
        // old // old
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    /**
     * create a boolean input port, displayed as a checkbox
     * @function inBool
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {Boolean} value
     * @return {Port} created port
     */

    Op.prototype.inValueBool = Op.prototype.inBool = function (name, v)
    {
        // old
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { display: "bool" }));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    /**
     * create a String value input port
     * @function inString
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {String} value default value
     * @return {Port} created port
     */
    Op.prototype.inValueString = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { type: "string" }));
        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    // new string
    Op.prototype.inString = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_STRING, { type: "string" }));
        v = v || "";
        p.value = v;
        p.set(v);
        p.defaultValue = v;
        return p;
    };

    /**
     * create a String value input port displayed as TextArea
     * @function inValueText
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {String} value default value
     * @return {Port} created port
     */
    Op.prototype.inValueText = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { type: "string", display: "text" }));
        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    /**
     * create a String value input port displayed as editor
     * @function inStringEditor
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {String} value default value
     * @return {Port} created port
     */
    // new string
    Op.prototype.inStringEditor = function (name, v, syntax)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_STRING, { type: "string", display: "editor", editorSyntax: syntax }));
        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    // old
    Op.prototype.inValueEditor = function (name, v, syntax)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { type: "string", display: "editor", editorSyntax: syntax }));
        p.value = "";
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    /**
     * create a string select box
     * @function inDropDown
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {Array} values
     * @param {String} value default value
     * @return {Port} created port
     */
    Op.prototype.inValueSelect = Op.prototype.inDropDown = function (name, values, v,noindex)
    {
        var p=null;
        if(!noindex)
        {
            const indexPort = new Port(this, name + " index", CONSTANTS.OP.OP_PORT_TYPE_VALUE, { increment: "integer",hideParam:true });
            const n = this.addInPort(indexPort);

            const valuePort = new ValueSelectPort(
                this,
                name,
                CONSTANTS.OP.OP_PORT_TYPE_VALUE,
                {
                    display: "dropdown",
                    hidePort: true,
                    type: "string",
                    values,
                },
                n,
            );
    
            indexPort.onLinkChanged=function()
            {
                valuePort.setUiAttribs({ greyout: indexPort.isLinked() });
            };

            p = this.addInPort(valuePort);

            if (v !== undefined)
            {
                p.set(v);
                const index = values.findIndex(item => item == v);
                n.setValue(index);
                p.defaultValue = v;
                n.defaultValue = index;
            }
        }
        else
        {
            const valuePort = new Port(
                this,
                name,
                CONSTANTS.OP.OP_PORT_TYPE_VALUE,
                {
                    display: "dropdown",
                    hidePort: true,
                    type: "string",
                    values,
                }
            );

             p = this.addInPort(valuePort);

        }


        return p;
    };

    /**
     * create a string switch box
     * @function inSwitch
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {Array} values
     * @param {String} value default value
     * @return {Port} created port
     */
    Op.prototype.inSwitch = function (name, values, v,noindex)
    {
        var p=null;
        if(!noindex)
        {
            const indexPort = new Port(this, name + " index", CONSTANTS.OP.OP_PORT_TYPE_VALUE, { increment: "integer",hideParam:true });
            const n = this.addInPort(indexPort);

            const switchPort = new SwitchPort(
                this,
                name,
                CONSTANTS.OP.OP_PORT_TYPE_STRING,
                {
                    display: "switch",
                    hidePort: true,
                    type: "string",
                    values,
                },
                n
            );
    
            indexPort.onLinkChanged=function()
            {
                switchPort.setUiAttribs({ greyout: indexPort.isLinked() });
            };
            p = this.addInPort(switchPort);

            if (v !== undefined)
            {
                p.set(v);
                const index = values.findIndex(item => item == v);
                n.setValue(index);
                p.defaultValue = v;
                n.defaultValue = index;
            }

        }
        else
        {
            const switchPort = new Port(
                this,
                name,
                CONSTANTS.OP.OP_PORT_TYPE_STRING,
                {
                    display: "switch",
                    hidePort: true,
                    type: "string",
                    values,
                }
            );
            p = this.addInPort(switchPort);

        }


        return p;
    };

    /**
     * create a integer input port
     * @function inInt
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {number} value default value
     * @return {Port} created port
     */
    Op.prototype.inValueInt = Op.prototype.inInt = function (name, v)
    {
        // old
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { increment: "integer" }));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    /**
     * create a file/URL input port
     * @function inURL
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.inFile = function (name, filter, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { display: "file", filter:filter }));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    Op.prototype.inUrl = function (name, filter, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_STRING, { display: "file", filter }));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    /**
     * create a texture input port
     * @function inTexture
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.inTexture = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_OBJECT, { display: "texture", preview: true }));
        if (v !== undefined) p.set(v);
        return p;
    };

    /**
     * create a object input port
     * @function inObject
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.inObject = function (name, v, options)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_OBJECT, options));
        if (v !== undefined) p.set(v);
        return p;
    };

    Op.prototype.inGradient = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { display: "gradient", hidePort: true }));
        if (v !== undefined) p.set(v);
        return p;
    };

    /**
     * create a array input port
     * @function inArray
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.inArray = function (name, v)
    {
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_ARRAY));
        if (v !== undefined) p.set(v);
        return p;
    };

    /**
     * create a value slider input port
     * @function inFloatSlider
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {number} name
     * @return {Port} created port
     */
    Op.prototype.inValueSlider = Op.prototype.inFloatSlider = function (name, v)
    {
        // old
        var p = this.addInPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { display: "range" }));
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    /**
     * create output trigger port
     * @function outTrigger
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.outFunction = Op.prototype.outTrigger = function (name, v)
    {
        // old
        var p = this.addOutPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_FUNCTION));
        if (v !== undefined) p.set(v);
        return p;
    };

    /**
     * create output value port
     * @function outNumber
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {number} default value
     * @return {Port} created port
     */
    Op.prototype.outValue = Op.prototype.outNumber = function (name, v)
    {
        // old
        var p = this.addOutPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE));
        if (v !== undefined) p.set(v);
        return p;
    };

    /**
     * create output boolean port
     * @function outBool
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.outValueBool = Op.prototype.outBool = function (name, v)
    {
        // old
        var p = this.addOutPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { display: "bool" }));
        if (v !== undefined) p.set(v);
        else p.set(false);
        return p;
    };

    /**
     * create output string port
     * @function outString
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.outValueString = function (name, v)
    {
        var p = this.addOutPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_VALUE, { type: "string" }));
        if (v !== undefined) p.set(v);
        return p;
    };
    Op.prototype.outString = function (name, v)
    {
        var p = this.addOutPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_STRING, { type: "string" }));
        if (v !== undefined) p.set(v);
        else p.set("");
        return p;
    };

    /**
     * create output object port
     * @function outObject
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.outObject = function (name, v)
    {
        var p = this.addOutPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_OBJECT));
        if (v !== undefined) p.set(v);
        p.ignoreValueSerialize = true;
        return p;
    };

    /**
     * create output array port
     * @function outArray
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.outArray = function (name, v)
    {
        var p = this.addOutPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_ARRAY));
        if (v !== undefined) p.set(v);
        p.ignoreValueSerialize = true;
        return p;
    };

    /**
     * create output texture port
     * @function outTexture
     * @instance
     * @memberof Op
     * @param {String} name
     * @return {Port} created port
     */
    Op.prototype.outTexture = function (name, v)
    {
        var p = this.addOutPort(new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_OBJECT, { preview: true }));
        if (v !== undefined) p.set(v);
        p.ignoreValueSerialize = true;
        return p;
    };

    Op.prototype.inDynamic = function (name, filter, options, v)
    {
        var p = new Port(this, name, CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC, options);

        p.shouldLink = function (p1, p2)
        {
            if (filter && UTILS.isArray(filter))
            {
                for (var i = 0; i < filter.length; i++)
                {
                    if (p1 == this && p2.type === filter[i]) return true;
                    if (p2 == this && p1.type === filter[i]) return true;
                }
                return false; // types do not match
            }
            return true; // no filter set
        };

        this.addInPort(p);
        if (v !== undefined)
        {
            p.set(v);
            p.defaultValue = v;
        }
        return p;
    };

    Op.prototype.printInfo = function ()
    {
        for (var i = 0; i < this.portsIn.length; i++) Log.log("in: " + this.portsIn[i].getName());

        for (var ipo in this.portsOut) Log.log("out: " + this.portsOut[ipo].getName());
    };

    Op.prototype.getOutChilds = function ()
    {
        var childs = [];
        for (var ipo in this.portsOut)
        {
            for (var l in this.portsOut[ipo].links)
            {
                if (this.portsOut[ipo].type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION) childs.push(this.portsOut[ipo].links[l].portIn.parent);
            }
        }
        return childs;
    };

    Op.prototype.markChilds = function ()
    {
        this.marked = true;
        for (var ipo in this.portsOut)
        {
            for (var l in this.portsOut[ipo].links)
            {
                this.portsOut[ipo].parent.marked = true;
                if (this.portsOut[ipo].links[l].portIn.parent != this) this.portsOut[ipo].links[l].portIn.parent.markChilds();
            }
        }
    };

    Op.prototype.deleteChilds = function ()
    {
        var opsToDelete = [];
        for (var ipo in this.portsOut)
        {
            for (var l in this.portsOut[ipo].links)
            {
                if (this.portsOut[ipo].links[l].portIn.parent != this)
                {
                    if (this.portsOut[ipo].parent != this) opsToDelete.push(this.portsOut[ipo].parent);
                    opsToDelete.push(this.portsOut[ipo].links[l].portIn.parent);
                    this.portsOut[ipo].links[l].portIn.parent.deleteChilds();
                }
            }
        }

        for (var i in opsToDelete)
        {
            this.patch.deleteOp(opsToDelete[i].id);
        }
    };

    Op.prototype.removeLinks = function ()
    {
        for (var i = 0; i < this.portsIn.length; i++) this.portsIn[i].removeLinks();
        for (var ipo = 0; ipo < this.portsOut.length; ipo++) this.portsOut[ipo].removeLinks();
    };

    Op.prototype.countFittingPorts = function (otherPort)
    {
        var count = 0;
        for (var ipo in this.portsOut) if (Link.canLink(otherPort, this.portsOut[ipo])) count++;

        for (var ipi in this.portsIn) if (Link.canLink(otherPort, this.portsIn[ipi])) count++;

        return count;
    };

    Op.prototype.findFittingPort = function (otherPort)
    {
        for (var ipo in this.portsOut) if (Link.canLink(otherPort, this.portsOut[ipo])) return this.portsOut[ipo];

        for (var ipi in this.portsIn) if (Link.canLink(otherPort, this.portsIn[ipi])) return this.portsIn[ipi];
    };

    Op.prototype.getSerialized = function ()
    {
        var op = {};
        // op.name=this.getName();
        // var nameParts=this.objName.split('.');
        // if(nameParts.length>0) if(op.name==nameParts[nameParts.length-1])delete op.name;

        if (this.opId) op.opId = this.opId;
        op.objName = this.objName; // id opid exists, this should not be needed, but for fallback reasons still here.

        op.id = this.id;
        op.uiAttribs = this.uiAttribs;

        if (this.uiAttribs.title == this._shortOpName) delete this.uiAttribs.title;
        if (this.uiAttribs.hasOwnProperty("working") && this.uiAttribs.working == true) delete this.uiAttribs.working;

        op.portsIn = [];
        op.portsOut = [];

        for (var i = 0; i < this.portsIn.length; i++) op.portsIn.push(this.portsIn[i].getSerialized());
        for (var ipo in this.portsOut) op.portsOut.push(this.portsOut[ipo].getSerialized());

        return op;
    };

    Op.prototype.getFirstOutPortByType = function (type)
    {
        for (var ipo in this.portsOut) if (this.portsOut[ipo].type == type) return this.portsOut[ipo];
    };

    /**
     * return port by the name portName
     * @function getPort
     * @instance
     * @memberof Op
     * @param {String} portName
     * @return {Port}
     */
    Op.prototype.getPort = Op.prototype.getPortByName = function (name)
    {
        for (var ipi = 0; ipi < this.portsIn.length; ipi++) if (this.portsIn[ipi].getName() == name) return this.portsIn[ipi];
        for (var ipo = 0; ipo < this.portsOut.length; ipo++) if (this.portsOut[ipo].getName() == name) return this.portsOut[ipo];
    };

    /**
     * return port by the name id
     * @function getPortById
     * @instance
     * @memberof Op
     * @param {String} id
     * @return {Port}
     */
    Op.prototype.getPortById = function (id)
    {
        for (var ipi = 0; ipi < this.portsIn.length; ipi++) if (this.portsIn[ipi].id == id) return this.portsIn[ipi];
        for (var ipo = 0; ipo < this.portsOut.length; ipo++) if (this.portsOut[ipo].id == id) return this.portsOut[ipo];
    };

    Op.prototype.updateAnims = function ()
    {
        for (var i = 0; i < this.portsIn.length; i++) this.portsIn[i].updateAnim();
    };

    Op.prototype.log = function ()
    {
        if (this.patch.silent) return;
        var args = ["[op "+this._shortOpName+"]"];
        args.push.apply(args, arguments);
        Function.prototype.apply.apply(console.log, [console, args]);
    };

    Op.prototype.error = function ()
    {
        if (this.patch.silent) return;
        var args = ["[op "+this._shortOpName+"]"];
        args.push.apply(args, arguments);
        Function.prototype.apply.apply(console.error, [console, args]);
    };

    Op.prototype.warn = function ()
    {
        if (this.patch.silent) return;
        var args = ["[op "+this._shortOpName+"]"];
        args.push.apply(args, arguments);
        Function.prototype.apply.apply(console.warn, [console, args]);
    };


    /**
     * disconnect all links
     * @function
     * @instance
     * @memberof Op
     */
    Op.prototype.unLink = function ()
    {
        for (var ipo = 0; ipo < this.portsOut.length; ipo++) this.portsOut[ipo].removeLinks();
        for (var ipi = 0; ipi < this.portsIn.length; ipi++) this.portsIn[ipi].removeLinks();
    };

    Op.unLinkTempReLinkP1 = null;
    Op.unLinkTempReLinkP2 = null;

    Op.prototype.undoUnLinkTemporary = function ()
    {
        if (this.shakeLink) this.shakeLink.remove();
        this.shakeLink = null;

        if (this.oldLinks)
        {
            for (var i = 0; i < this.oldLinks.length; i++)
            {
                this.patch.link(this.oldLinks[i].in.parent, this.oldLinks[i].in.getName(), this.oldLinks[i].out.parent, this.oldLinks[i].out.getName());
            }
            this.oldLinks.length = 0;
        }

        Op.unLinkTempReLinkP1 = null;
        Op.unLinkTempReLinkP2 = null;

    };


    Op.prototype.unLinkTemporary = function ()
    {
        var tryRelink = true;
        var i = 0;

        this.shakeLink = null;
        this.oldLinks = [];

        if (tryRelink)
        {
            if (this.portsIn.length > 0 && this.portsIn[0].isLinked() && (this.portsOut.length > 0 && this.portsOut[0].isLinked()))
            {
                if (this.portsIn[0].getType() == this.portsOut[0].getType())
                {
                    Op.unLinkTempReLinkP1 = this.portsIn[0].links[0].getOtherPort(this.portsIn[0]);
                    Op.unLinkTempReLinkP2 = this.portsOut[0].links[0].getOtherPort(this.portsOut[0]);
                }
            }
        }

        for (var ipi = 0; ipi < this.portsIn.length; ipi++)
        {
            for (i = 0; i < this.portsIn[ipi].links.length; i++)
            {
                this.oldLinks.push({
                    in: this.portsIn[ipi].links[i].portIn,
                    out: this.portsIn[ipi].links[i].portOut,
                });
            }
        }

        for (var ipo = 0; ipo < this.portsOut.length; ipo++)
        {
            for (i = 0; i < this.portsOut[ipo].links.length; i++)
            {
                this.oldLinks.push({
                    in: this.portsOut[ipo].links[i].portIn,
                    out: this.portsOut[ipo].links[i].portOut,
                });
            }
        }

        this.unLink();

        if (Op.unLinkTempReLinkP1 && Op.unLinkTempReLinkP2)
        {
            this.shakeLink = this.patch.link(Op.unLinkTempReLinkP1.parent, Op.unLinkTempReLinkP1.getName(), Op.unLinkTempReLinkP2.parent, Op.unLinkTempReLinkP2.getName());
        }
    };

    Op.prototype.profile = function (enable)
    {
        for (var ipi = 0; ipi < this.portsIn.length; ipi++)
        {
            this.portsIn[ipi]._onTriggered = this.portsIn[ipi]._onTriggeredProfiling;
            this.portsIn[ipi].set = this.portsIn[ipi]._onSetProfiling;
        }

    };

    Op.prototype.findParent = function (objName)
    {
        for (var ipi = 0; ipi < this.portsIn.length; ipi++)
        {
            if (this.portsIn[ipi].isLinked())
            {
                if (this.portsIn[ipi].links[0].portOut.parent.objName == objName) return this.portsIn[ipi].links[0].portOut.parent;

                var found = null;
                found = this.portsIn[ipi].links[0].portOut.parent.findParent(objName);
                if (found) return found;
            }
        }
        return null;
    };

    Op.prototype.cleanUp = function ()
    {
        if (this._instances)
        {
            for (var i = 0; i < this._instances.length; i++)
            {
                if (this._instances[i].onDelete) this._instances[i].onDelete();
            }
            this._instances.length = 0;
        }
    };

    Op.prototype.instanced = function (triggerPort)
    {
        if (this.patch.instancing.numCycles() === 0) return false;

        var i = 0;
        var ipi = 0;
        if (!this._instances || this._instances.length != this.patch.instancing.numCycles())
        {
            if (!this._instances) this._instances = [];
            Log.log("creating instances of ", this.objName, this.patch.instancing.numCycles(), this._instances.length);
            this._instances.length = this.patch.instancing.numCycles();
            for (i = 0; i < this._instances.length; i++)
            {
                this._instances[i] = this.patch.createOp(this.objName, true);
                this._instances[i].instanced = function ()
                {
                    return false;
                };
                this._instances[i].uiAttr(this.uiAttribs);

                for (var ipo = 0; ipo < this.portsOut.length; ipo++)
                {
                    if (this.portsOut[ipo].type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION)
                    {
                        this._instances[i].getPortByName(this.portsOut[ipo].name).trigger = this.portsOut[ipo].trigger.bind(this.portsOut[ipo]);
                    }
                }
            }

            for (ipi = 0; ipi < this.portsIn.length; ipi++)
            {
                this.portsIn[ipi].onChange = null;
                this.portsIn[ipi].onValueChanged = null;
            }
        }

        var theTriggerPort = null;
        for (ipi = 0; ipi < this.portsIn.length; ipi++)
        {
            if (this.portsIn[ipi].type == CONSTANTS.OP.OP_PORT_TYPE_VALUE || this.portsIn[ipi].type == CONSTANTS.OP.OP_PORT_TYPE_ARRAY)
            {
                this._instances[this.patch.instancing.index()].portsIn[ipi].set(this.portsIn[ipi].get());
            }
            if (this.portsIn[ipi].type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION)
            {
                // Log.log(this.patch.instancing.index());
                // Log.log(this._instances.length);
                // if(this._instances[ this.patch.instancing.index() ].portsIn[ipi].name==triggerPort.name)
                // theTriggerPort=this._instances[ this.patch.instancing.index() ].portsIn[ipi];
            }
        }

        if (theTriggerPort) theTriggerPort.onTriggered();

        for (ipi = 0; ipi < this.portsOut.length; ipi++)
        {
            if (this.portsOut[ipi].type == CONSTANTS.OP.OP_PORT_TYPE_VALUE)
            {
                this.portsOut[ipi].set(this._instances[this.patch.instancing.index()].portsOut[ipi].get());
            }
        }

        return true;
    };

    Op.prototype.initInstancable = function ()
    {
        //         if(this.isInstanced)
        //         {
        //             Log.log('cancel instancing');
        //             return;
        //         }
        //         this._instances=[];
        //         for(var ipi=0;ipi<this.portsIn.length;ipi++)
        //         {
        //             if(this.portsIn[ipi].type==CONSTANTS.OP.OP_PORT_TYPE_VALUE)
        //             {
        //
        //             }
        //             if(this.portsIn[ipi].type==CONSTANTS.OP.OP_PORT_TYPE_FUNCTION)
        //             {
        //                 // var piIndex=ipi;
        //                 this.portsIn[ipi].onTriggered=function(piIndex)
        //                 {
        //
        //                     var i=0;
        // // Log.log('trigger',this._instances.length);
        //
        //                 }.bind(this,ipi );
        //
        //             }
        // };
        // this._instances=null;
    };

    Op.prototype.setValues = function (obj)
    {
        for (var i in obj)
        {
            var port = this.getPortByName(i);
            if (port) port.set(obj[i]);
            else Log.log("op.setValues: port not found:", i);
        }
    };

    /**
     * show op error message - set message to null to remove error message
     * @function setUiError
     * @instance
     * @memberof Op
     * @param {id} error id
     * @param {txt} text message
     * @param {level} level 
     */
    Op.prototype.setUiError=function(id,txt,level)
    {
        if(!txt && !this._hasUiErrors)return;
        if(!txt && !this._uiErrors.hasOwnProperty(id))return;
        if(this._uiErrors.hasOwnProperty(id) && this._uiErrors[id].txt==txt) return;

        if(!txt && this._uiErrors.hasOwnProperty(id)) delete this._uiErrors[id];
        else
        {
            if(txt && (!this._uiErrors.hasOwnProperty(id) || this._uiErrors[id].txt!=txt))
            {
                if(level==undefined)level=2;
                this._uiErrors[id]={"txt":txt,"level":level};
            }
        }
        
        var errorArr=[];
        for(var i in this._uiErrors) errorArr.push(this._uiErrors[i]);
        
        this.uiAttr({ "error": null });
        this.uiAttr({ "uierrors": errorArr });
        this._hasUiErrors=Object.keys(this._uiErrors).length;
    }

    // todo: remove 
    Op.prototype.setError =
    Op.prototype.error = function (id, txt)
    {
        console.warn("old error message op.error() - use op.setUiError()");
        
        if(txt===undefined)
        {
            this.uiAttr({ error: id });
        }
        else
        {
            if(this._uiErrors[id]!=txt)
            {
                this._uiErrors[id]=txt;
                if(!txt)delete this._uiErrors[id];

                var errorArr=[];
                for(var i in this._uiErrors)errorArr.push(this._uiErrors[i]);
                this.uiAttr({ "errors": errorArr });
                console.log(errorArr);
            }
        }
    };

    // // todo: remove 
    // Op.prototype.setHint = function (txt)
    // {
    //     if(txt!=this.uiAttribs.hint) this.uiAttr({ hint: txt });
    // };

    // // todo: remove 
    // Op.prototype.setWarning = function (txt)
    // {
    //     if(txt!=this.uiAttribs.warning) this.uiAttr({ warning: txt });
    // };

    /**
     *  add an eventlistener ot op
     * currently implemented:  "onEnabledChange", "onTitleChange", "onUiAttribsChange"
     * @function addEventListener
     * @instance
     * @memberof Op
     * @description
     * @param {which} name of event
     * @param {function} callback
     */
    Op.prototype.addListener = Op.prototype.addEventListener = function (which, cb)
    {
        if (!this._eventCallbacks[which]) this._eventCallbacks[which] = [cb];
        else this._eventCallbacks[which].push(cb);
    };

    Op.prototype.hasEventListener = function (which, cb)
    {
        if (which && cb)
        {
            if (this._eventCallbacks[which])
            {
                var idx = this._eventCallbacks[which].indexOf(cb);
                if (idx == -1) return false;
                return true;
            }
        }
        else
        {
            Log.log("hasListener: missing parameters");
        }
    };

    /**
     * remove an eventlistener
     * @function removeEventListener
     * @instance
     * @memberof Op
     * @param {which} name of event
     * @param {function} callback
     */
    Op.prototype.removeEventListener = function (which, cb)
    {
        if (this._eventCallbacks[which])
        {
            var idx = this._eventCallbacks[which].indexOf(cb);
            if (idx == -1) Log.log("eventlistener " + which + " not found...");
            else this._eventCallbacks[which].slice(idx);
        }
    };

    Op.prototype.fireEvent = function (which, params)
    {
        if (this._eventCallbacks[which]) for (var i = 0; i < this._eventCallbacks[which].length; i++) if (this._eventCallbacks[which][i]) this._eventCallbacks[which][i](params);

        if (this.onUiAttrChange && which == "onUiAttribsChange") this.onUiAttrChange(params); // todo: use normal eventlistener
    };

    /**
     * enable/disable op
     * @function
     * @instance
     * @memberof Op
     * @param {boolean}
     */
    Op.prototype.setEnabled = function (b)
    {
        this.enabled = b;
        this.fireEvent("onEnabledChange", b);
        // if(this._eventCallbacks.onEnabledChange)this._eventCallbacks.onEnabledChange(b);
    };

    /**
     * organize ports into a group
     * @function
     * @instance
     * @memberof Op
     * @param {String} name
     * @param {Array} ports
     */
    Op.prototype.setPortGroup = function (name, ports)
    {
        for (var i = 0; i < ports.length; i++)
        {
            if (ports[i] && ports[i].setUiAttribs) ports[i].setUiAttribs({ group: name });
            else
            {
                console.error("setPortGroup: invalid port!");
            }
        }
    };

    Op.prototype.setUiAxisPorts = function (px, py, pz)
    {
        if (px) px.setUiAttribs({ axis: "X" });
        if (py) py.setUiAttribs({ axis: "Y" });
        if (pz) pz.setUiAttribs({ axis: "Z" });
    };

    /**
     * remove port from op
     * @function removePort
     * @instance
     * @memberof Op
     * @param {Port} port to remove
     */
    Op.prototype.removePort = function (port)
    {
        // for(var ipi in this.portsIn)
        for (var ipi = 0; ipi < this.portsIn.length; ipi++)
        {
            if (this.portsIn[ipi] == port)
            {
                this.portsIn.splice(ipi, 1);
                this.fireEvent("onUiAttribsChange", {});
                this.fireEvent("onPortRemoved", {});
                return;
            }
        }
    };

    // needs to be in UI only
    Op.prototype.checkLinkTimeWarnings = function ()
    {
        function hasParent(op, type, name)
        {
            for (var i = 0; i < op.portsIn.length; i++)
            {
                if (op.portsIn[i].type == type && op.portsIn[i].isLinked())
                {
                    var pi = op.portsIn[i];
                    for (var li = 0; li < pi.links.length; li++)
                    {
                        if (!pi.links[li]) continue;
                        if (pi.links[li].portOut.parent.objName.indexOf(name) > -1) return true;
                        if (hasParent(pi.links[li].portOut.parent, type, name)) return true;
                    }
                }
            }
            return false;
        }

        function hasTriggerInput(op)
        {
            if (op.portsIn.length > 0 && op.portsIn[0].type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION) return true;
            return false;
        }

        var notWorkingMsg = null;
        var working = true;

        if (working && this.objName.indexOf("Ops.Gl.TextureEffects") == 0 && hasTriggerInput(this) && this.objName.indexOf("TextureEffects.ImageCompose") == -1)
        {
            working = hasParent(this, CONSTANTS.OP.OP_PORT_TYPE_FUNCTION, "TextureEffects.ImageCompose");
            if (!working) notWorkingMsg = CABLES.UI.TEXTS.working_connected_to + "ImageCompose";
        }

        if (this._needsParentOp && working)
        {
            working = hasParent(this, CONSTANTS.OP.OP_PORT_TYPE_OBJECT, this._needsParentOp);
            if (!working) notWorkingMsg = CABLES.UI.TEXTS.working_connected_to + this._needsParentOp;
        }

        if (this._needsLinkedToWork.length > 0)
        {
            for (var i = 0; i < this._needsLinkedToWork.length; i++)
            {
                var p = this._needsLinkedToWork[i];
                if (!p)
                {
                    console.warn("[needsLinkedToWork] port not found");
                    continue;
                }
                if (!p.isLinked())
                {
                    working = false;

                    if (!notWorkingMsg) notWorkingMsg = CABLES.UI.TEXTS.working_connected_needs_connections_to;
                    else notWorkingMsg += ", ";
                    notWorkingMsg += p.name.toUpperCase();
                }
            }
        }

        if (!working) 
        {
            this.setUiAttrib({ working,notWorkingMsg:notWorkingMsg });
            this.setUiError("notworking",notWorkingMsg,1);
        }
        else if (!this.uiAttribs.working)
        {
            this.setUiAttrib({ working: true,notWorkingMsg:null });
            this.setUiError("notworking",null);
        }
    };

    Op.prototype._checkLinksNeededToWork = function () {};

    Op.prototype.toWorkNeedsParent = function (parentOpName)
    {
        if (!this.patch.isEditorMode()) return;
        this._needsParentOp = parentOpName;
    };

    /**
     * show a small X to indicate op is not working when given ports are not linked
     * @function
     * @instance
     * @memberof Op
     * @param {Port} port1
     * @param {Port} port2
     * @param {Port} port3
     */
    Op.prototype.toWorkPortsNeedToBeLinked = function ()
    {
        if (!this.patch.isEditorMode()) return;
        for (var i = 0; i < arguments.length; i++) if (this._needsLinkedToWork.indexOf(arguments[i]) == -1) this._needsLinkedToWork.push(arguments[i]);
    };
    Op.prototype.toWorkPortsNeedToBeLinkedReset = function ()
    {
        if (!this.patch.isEditorMode()) return;
        this._needsLinkedToWork.length = 0;
        this.checkLinkTimeWarnings();
    };

    Op.prototype.initVarPorts = function ()
    {
        for(var i=0;i<this.portsIn.length;i++)
        {
            if(this.portsIn[i].getVariableName()) this.portsIn[i].setVariable( this.portsIn[i].getVariableName() );
        }
    };



    /**
     * refresh op parameters, if current op is selected
     * @function
     * @instance
     * @memberof Op
     */
    Op.prototype.refreshParams = function ()
    {
        if(this.patch && this.patch.isEditorMode())  gui.opParams.show(this);
    };
}

/**
 * Returns an op category for the op.
 * @function getNamespaceClassName
 * @instance
 * @memberof Op
 * @param {String} opName - The (full) name of the op, e.g. "Ops.Value"
 * @returns {String} - The op category
 */
Op.getNamespaceClassName = function (opName)
{
    if (!opName) return "default";
    if (opName.startsWith("Ops.Gl")) return "gl";
    if (opName.startsWith("Ops.WebAudio")) return "audio";
    if (opName.startsWith("Ops.Devices")) return "devices";
    if (opName.startsWith("Ops.Html")) return "html";
    if (opName.startsWith("Ops.Sidebar")) return "html";
    if (opName.startsWith("Ops.Math")) return "math";
    if (opName.startsWith("Ops.User")) return "user";
    return "default";
};

Op.isSubpatchOp = function (name)
{
    return name == "Ops.Ui.Patch" || name == "Ops.Ui.SubPatch";
};

export { Op };
