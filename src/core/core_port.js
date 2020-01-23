import { EventTarget } from "./eventtarget";
import { generateUUID } from "./utils";
import { Anim } from "./anim";
import { CONSTANTS } from "./constants";
import { Log } from "./log";

/**
 * data is coming into and out of ops through input and output ports
 * @external CABLES
 * @namespace Port
 * @class
 * @hideconstructor
 * @example
 * const myPort=op.inString("String Port");
 */
const Port = function (__parent, name, type, uiAttribs)
{
    EventTarget.apply(this);

    this.data = {}; // reserved for port-specific user-data
    /**
     * @type {Number}
     * @name direction
     * @instance
     * @memberof Port
     * @description direction of port (input(0) or output(1))
     */
    this.direction = CONSTANTS.PORT.PORT_DIR_IN;
    this.id = generateUUID();
    this.parent = __parent;

    /**
     * @type {Array<Link>}
     * @name links
     * @instance
     * @memberof Port
     * @description links of port
     */
    this.links = [];
    this.value = 0.0;
    this.name = name;
    this.type = type || CONSTANTS.OP.OP_PORT_TYPE_VALUE;
    this.uiAttribs = uiAttribs || {};
    this.anim = null;
    this._oldAnimVal = -5711;
    this.defaultValue = null;

    this._uiActiveState = true;
    this.ignoreValueSerialize = false;
    // this.onLink=null;
    this.onLinkChanged = null;
    this.crashed = false;

    this._valueBeforeLink = null;
    this._lastAnimFrame = -1;
    this._animated = false;

    this.onValueChanged = null;
    this.onTriggered = null;
    this.onUiActiveStateChange = null;
    this.changeAlways = false;

    this._warnedDeprecated = false;
    this._useVariableName=null;
    // this.onUiAttrChange=null;

    Object.defineProperty(this, "val", {
        get()
        {
            this._warnedDeprecated = true;
            return this.get();
        },
        set(v)
        {
            this.setValue(v);
            // if(!this._warnedDeprecated)Log.log('deprecated .val set used',this.parent.name);
            this._warnedDeprecated = true;
        },
    });

};

/**
 * change listener for input value ports, overwrite to react to changes
 * @function onChange
 * @memberof Port
 * @instance
 * @example
 * const myPort=op.inString("MyPort");
 * myPort.onChange=function()
 * {
 *   Log.log("was changed to: ",myPort.get());
 * }
 *
 */

Port.prototype.onAnimToggle = function () {};
Port.prototype._onAnimToggle = function ()
{
    this.onAnimToggle();
};

/**
 * @function hidePort
 * @memberof Port
 * @instance
 * @description hide port rectangle in op
 */
Port.prototype.hidePort = function ()
{
    this.setUiAttribs({ hidePort: true });
};

/**
 * @function remove
 * @memberof Port
 * @instance
 * @description remove port
 */
Port.prototype.remove = function ()
{
    // this.setUiAttribs({hidePort:true});
    this.removeLinks();
    this.parent.removePort(this);
};

/**
 * set ui attributes
 * @function setUiAttribs
 * @memberof Port
 * @instance
 * @param {Object} newAttribs
 * <pre>
 * title - overwrite title of port (by default this is portname)
 * greyout - port paramater will appear greyed out, can not be
 * hidePort - port will be hidden from op
 * hideParam - port params will be hidden from parameter panel
 * showIndex - only for dropdowns - show value index (e.g. `0 - normal` )
 * editorSyntax - set syntax highlighting theme for editor port
 * </pre>
 * @example
 * myPort.setUiAttribs({greyout:true});
 */
Port.prototype.setUiAttribs = function (newAttribs)
{
    if (!this.uiAttribs) this.uiAttribs = {};
    for (var p in newAttribs)
    {
        this.uiAttribs[p] = newAttribs[p];
    }
    // if(this.onUiAttrChange) this.onUiAttrChange(newAttribs);
    this.emitEvent("onUiAttrChange", newAttribs);
    // Log.log("new attribs!",newAttribs);
};

/**
 * get ui attributes
 * @function getUiAttribs
 * @memberof Port
 * @example
 * myPort.getUiAttribs();
 */
Port.prototype.getUiAttribs = function ()
{
    return this.uiAttribs;
};

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
Port.prototype.getUiAttrib = function (attribName)
{
    if (!this.uiAttribs || !this.uiAttribs.hasOwnProperty(attribName))
    {
        return null;
    }
    return this.uiAttribs[attribName];
};

/**
 * @function get
 * @memberof Port
 * @instance
 * @description get value of port
 */
Port.prototype.get = function ()
{
    if (this._animated && this._lastAnimFrame != this.parent.patch.getFrameNum())
    {
        this._lastAnimFrame = this.parent.patch.getFrameNum();
        this.value = this.anim.getValue(this.parent.patch.timer.getTime());

        // if(this._oldAnimVal!=this.value)
        {
            this._oldAnimVal = this.value;
            this.forceChange();
        }
    }

    return this.value;
};

/**
 * @function setValue
 * @memberof Port
 * @instance
 * @description set value of port / will send value to all linked ports (only for output ports)
 */
Port.prototype.set = Port.prototype.setValue = function (v)
{
    if (v === undefined) return;

    if (this.parent.enabled && !this.crashed)
    {
        if (v !== this.value || this.changeAlways || this.type == CONSTANTS.OP.OP_PORT_TYPE_TEXTURE || this.type == CONSTANTS.OP.OP_PORT_TYPE_ARRAY)
        {
            if (this._animated)
            {
                this.anim.setValue(this.parent.patch.timer.getTime(), v);
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
                    this.setValue = function (v) {};
                    this.onTriggered = function () {};

                    console.error("onvaluechanged exception cought", ex);
                    Log.log(ex.stack);
                    Log.log("exception in: " + this.parent.name);
                    if (CABLES.UI) gui.showOpCrash(this.parent);

                    this.parent.patch.emitEvent("exception".ex,this.parent);
                }

                if (CABLES.UI && this.type == CONSTANTS.OP.OP_PORT_TYPE_TEXTURE)
                {
                    gui.texturePreview().updateTexturePort(this);
                }
            }

            if (this.direction == CONSTANTS.PORT.PORT_DIR_OUT) for (var i = 0; i < this.links.length; ++i) this.links[i].setValue();
        }
    }
};

Port.prototype.updateAnim = function ()
{
    if (this._animated)
    {
        this.value = this.get();

        if (this._oldAnimVal != this.value || this.changeAlways)
        {
            this._oldAnimVal = this.value;
            this.forceChange();
        }
        this._oldAnimVal = this.value;
    }
};

Port.args = function (func)
{
    return (func + "")
        .replace(/[/][/].*$/gm, "") // strip single-line comments
        .replace(/\s+/g, "") // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, "") // strip multi-line comments
        .split("){", 1)[0]
        .replace(/^[^(]*[(]/, "") // extract the parameters
        .replace(/=[^,]+/g, "") // strip any ES6 defaults
        .split(",")
        .filter(Boolean); // split & filter [""]
};

Port.prototype.forceChange = function ()
{
    if (this.onValueChanged || this.onChange)
    {
        // very temporary: deprecated warning!!!!!!!!!
        // var params=Port.args(this.onValueChanged||this.onChange)
        // if(params.length>0) console.warn('TOM: port has onchange params!',this.parent.objName,this.name);
    }

    if (this.onChange) this.onChange(this, this.value);
    else if (this.onValueChanged) this.onValueChanged(this, this.value); // deprecated
};

/**
 * @function getTypeString
 * @memberof Port
 * @instance
 * @description get port type as string, e.g. "Function","Value"...
 * @return {String} type
 */
Port.prototype.getTypeString = function ()
{
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_VALUE) return "Number";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION) return "Trigger";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT) return "Object";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC) return "Dynamic";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_ARRAY) return "Array";
    if (this.type == CONSTANTS.OP.OP_PORT_TYPE_STRING) return "String";
    return "Unknown";
};

Port.prototype.getSerialized = function ()
{
    var obj = {};
    obj.name = this.getName();

    if (!this.ignoreValueSerialize && this.links.length === 0)
    {
        if (this.type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT && this.value && this.value.tex)
        {
        }
        else obj.value = this.value;
    }
    if (this._useVariableName)obj.useVariable=this._useVariableName;
    if (this._animated) obj.animated = true;
    if (this.anim) obj.anim = this.anim.getSerialized();
    if (this.uiAttribs.display == "file") obj.display = this.uiAttribs.display;
    if (this.direction == CONSTANTS.PORT.PORT_DIR_IN && this.links.length > 0)
    {
        obj.links = [];
        for (var i in this.links)
        {
            if (this.links[i].portIn && this.links[i].portOut) obj.links.push(this.links[i].getSerialized());
        }
    }
    return obj;
};

Port.prototype.shouldLink = function ()
{
    return true;
};

/**
 * @function removeLinks
 * @memberof Port
 * @instance
 * @description remove all links from port
 */
Port.prototype.removeLinks = function ()
{
    var count = 0;
    while (this.links.length > 0)
    {
        count++;
        if (count > 5000)
        {
            console.warn("could not delete links... / infinite loop");
            this.links.length = 0;
            break;
        }
        this.links[0].remove();
    }
};

/**
 * @function removeLink
 * @memberof Port
 * @instance
 * @description remove all link from port
 * @param {CABLES.Link} link
 */
Port.prototype.removeLink = function (link)
{
    for (var i in this.links)
    {
        if (this.links[i] == link)
        {
            this.links.splice(i, 1);
        }
    }

    if (this.direction == CONSTANTS.PORT.PORT_DIR_IN)
    {
        if (this.type == CONSTANTS.OP.OP_PORT_TYPE_VALUE) this.setValue(this._valueBeforeLink || 0);
        else this.setValue(this._valueBeforeLink || null);
    }

    // if (this.type == CABLES.CONSTANTS.OP.OP_PORT_TYPE_OBJECT && this.direction == CABLES.CONSTANTS.PORT.PORT_DIR_IN && this.links.length > 0)
    // {
    //     Log.log("REMOVELINK OBJECT!!",this);

    //     for (var i=0;i<this.links.length;i++)
    //     {
    //         // Log.log('iii', i, this.links[i].portOut.get());
    //         // this.links[i].setValue();
    //         // this.set(null);
    //         // this.forceChange();
    //         this.set(this.links[i].portOut.get());
    //         Log.log(this.get())
    //         // this.forceChange();

    //     }
    // }

    if (this.onLinkChanged) this.onLinkChanged();
    this.emitEvent("onLinkChanged");
};

/**
 * @function getName
 * @memberof Port
 * @instance
 * @description return port name
 */
Port.prototype.getName = function ()
{
    return this.name;
};

Port.prototype.addLink = function (l)
{
    this._valueBeforeLink = this.value;
    this.links.push(l);
    if (this.onLinkChanged) this.onLinkChanged();
    this.emitEvent("onLinkChanged");
};

/**
 * @function getLinkTo
 * @memberof Port
 * @instance
 * @param {Port} otherPort
 * @description return link, which is linked to otherPort
 */
Port.prototype.getLinkTo = function (p2)
{
    for (var i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return this.links[i];
};

/**
 * @function removeLinkTo
 * @memberof Port
 * @instance
 * @param {Port} otherPort
 * @description removes link, which is linked to otherPort
 */
Port.prototype.removeLinkTo = function (p2)
{
    for (var i in this.links)
    {
        if (this.links[i].portIn == p2 || this.links[i].portOut == p2)
        {
            this.links[i].remove();
            if (this.onLinkChanged) this.onLinkChanged();
            this.emitEvent("onLinkChanged");
            return;
        }
    }
};

/**
 * @function isLinkedTo
 * @memberof Port
 * @instance
 * @param {Port} otherPort
 * @description returns true if port is linked to otherPort
 */
Port.prototype.isLinkedTo = function (p2)
{
    for (var i in this.links) if (this.links[i].portIn == p2 || this.links[i].portOut == p2) return true;

    return false;
};

/**
 * @function trigger
 * @memberof Port
 * @instance
 * @description trigger the linked port (usually invoked on an output function port)
 */
Port.prototype.trigger = function ()
{
    if (this.links.length === 0) return;
    if (!this.parent.enabled) return;

    var portTriggered = null;
    try
    {
        for (var i = 0; i < this.links.length; ++i)
        {
            if (this.links[i].portIn)
            {
                portTriggered = this.links[i].portIn;
                portTriggered._onTriggered();
            }
            if (this.links[i]) this.links[i].activity();
        }
    }
    catch (ex)
    {
        this.parent.enabled = false;

        if (CABLES.UI)
        {
            this.parent.patch.emitEvent("exception".ex,portTriggered.parent);

            if (window.gui) gui.showOpCrash(portTriggered.parent);
        }
        Log.log("exception!");
        console.error("ontriggered exception cought", ex);
        Log.log(ex.stack);
        Log.log("exception in: " + portTriggered.parent.name);
    }
};

Port.prototype.call = function ()
{
    Log.log("call deprecated - use trigger() ");
    this.trigger();
};

Port.prototype.execute = function ()
{
    Log.log("### execute port: " + this.getName(), this.goals.length);
};


Port.prototype.setVariableName = function (n)
{
    this._useVariableName=n;
}

Port.prototype.getVariableName = function ()
{
    return this._useVariableName;
}

Port.prototype.setVariable = function (v)
{
    this.setAnimated(false);
    var attr={useVariable:false};

    if(this._variableIn)
    {
        this._variableIn.removeListener(this.set.bind(this));
        this._variableIn=null;
    }

    if(v)
    {
        this._variableIn=this.parent.patch.getVar(v);

        if(!this._variableIn)
        {
            console.log("PORT VAR NOT FOUND!!!");
        }
        else
        {
            this._variableIn.addListener(this.set.bind(this));
            this.set(this._variableIn.getValue());
        }
        this._useVariableName=v;
        attr.useVariable=true;
        attr.variableName=this._useVariableName;
    }
    else
    {
        attr.variableName=this._useVariableName=null;
        attr.useVariable=false;
    }

    this.setUiAttribs(attr);
}

Port.prototype.setAnimated = function (a)
{
    if (this._animated != a)
    {
        this._animated = a;
        if (this._animated && !this.anim) this.anim = new Anim();
        this._onAnimToggle();
    }
    this.setUiAttribs({isAnimated:this._animated});
};

Port.prototype.toggleAnim = function (val)
{
    this._animated = !this._animated;
    if (this._animated && !this.anim) this.anim = new Anim();
    this.setAnimated(this._animated);
    this._onAnimToggle();
    this.setUiAttribs({isAnimated:this._animated});
};

/**
 * <pre>
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_VALUE = 0;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_FUNCTION = 1;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_OBJECT = 2;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_TEXTURE = 2;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_ARRAY = 3;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC = 4;
 * CABLES.CONSTANTS.OP.OP_PORT_TYPE_STRING = 5;
 * </pre>
 * @function getType
 * @memberof Port
 * @instance
 * @return {Number} type of port
 */
Port.prototype.getType = function ()
{
    return this.type;
};

/**
 * @function isLinked
 * @memberof Port
 * @instance
 * @return {Boolean} true if port is linked
 */
Port.prototype.isLinked = function ()
{
    return this.links.length > 0;
};

/**
 * @function isAnimated
 * @memberof Port
 * @instance
 * @return {Boolean} true if port is animated
 */
Port.prototype.isAnimated = function ()
{
    return this._animated;
};

/**
 * @function isHidden
 * @memberof Port
 * @instance
 * @return {Boolean} true if port is hidden
 */
Port.prototype.isHidden = function ()
{
    return this.uiAttribs.hidePort;
};

/**
 * @function onTriggered
 * @memberof Port
 * @instance
 * @param {onTriggeredCallback} callback
 * @description set callback, which will be executed when port was triggered (usually output port)
 */
Port.prototype._onTriggered = function ()
{
    this.parent.updateAnims();
    if (this.parent.enabled && this.onTriggered) this.onTriggered();
};


Port.prototype._onSetProfiling = function (v)
{
    this.parent.patch.profiler.add("port", this);
    this.setValue(v);
    // if (this.parent.enabled && this.onTriggered) this.onTriggered();
    this.parent.patch.profiler.add("port", null);
}

Port.prototype._onTriggeredProfiling = function ()
{
    // this.parent.updateAnims();
    this.parent.patch.profiler.add("port", this);

    if (this.parent.enabled && this.onTriggered) this.onTriggered();
    this.parent.patch.profiler.add("port", null);
};

Port.prototype.onValueChange = function (cb)
{
    // deprecated
    this.onChange = cb;
};

Port.prototype.getUiActiveState = function ()
{
    return this._uiActiveState;
};

Port.prototype.setUiActiveState = function (onoff)
{
    this._uiActiveState = onoff;
    if (this.onUiActiveStateChange) this.onUiActiveStateChange();
};

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
    if (type == CONSTANTS.OP.OP_PORT_TYPE_VALUE) return "value";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION) return "function";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT) return "object";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_ARRAY) return "array";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_STRING) return "string";
    if (type == CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC) return "dynamic";
    return "unknown";
};
class SwitchPort extends Port
{
    constructor(__parent, name, type, uiAttribs, numberPort)
    {
        super(__parent, name, type, uiAttribs);
        const values = uiAttribs.values;
        numberPort.set = (value) =>
        {
            console.log("in set", value);

            let intValue = Math.floor(value);

            intValue=Math.min(intValue,values.length - 1);
            intValue=Math.max(intValue,0);

            numberPort.setValue(intValue);
            this.set(values[intValue]);

            if(CABLES.UI && gui.patch().isCurrentOp(this.parent)) gui.patch().showOpParams(this.parent);
        };
    }
}

class ValueSelectPort extends SwitchPort {}

export { Port, SwitchPort, ValueSelectPort };
