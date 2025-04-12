const VarSetOpWrapper = class
{
    constructor(op, type, valuePort, varNamePort, triggerPort, nextPort)
    {
        this._valuePort = valuePort;
        this._varNamePort = varNamePort;
        this._op = op;
        this._type = type;
        this._typeId = -1;
        this._triggerPort = triggerPort;
        this._nextPort = nextPort;

        this._var = null;

        this._btnCreate = op.inTriggerButton("Create new variable");
        this._btnCreate.setUiAttribs({ "hidePort": true });
        this._btnCreate.onTriggered = this._createVar.bind(this);

        this._helper = op.inUiTriggerButtons("", ["Rename"]);
        this._helper.setUiAttribs({ "hidePort": true });
        this._helper.onTriggered = (which) => { if (which == "Rename") CABLES.CMD.PATCH.renameVariable(op.varName.get()); };

        this._op.setPortGroup("Variable", [this._helper, this._varNamePort, this._btnCreate]);

        varNamePort.setUiAttribs({ "_variableSelect": true });
        this._op.on("uiParamPanel", this._updateVarNamesDropdown.bind(this));

        // this._op.patch.addEventListener("variableDeleted", this._updateVarNamesDropdown.bind(this));
        this._op.patch.addEventListener("variablesChanged", this._updateName.bind(this));
        this._op.patch.addEventListener("variableRename", this._renameVar.bind(this));

        this._varNamePort.onChange = this._updateName.bind(this);

        this._isTexture = this._valuePort.uiAttribs.objType === "texture";

        this._valuePort.changeAlways = true;

        if (this._triggerPort)
        {
            this._triggerPort.onTriggered = () =>
            {
                this._setVarValue(true);
            };
        }
        else
        {
            this._valuePort.onChange = this._setVarValue.bind(this);
        }

        this._op.init = () =>
        {
            this._updateName();
            if (!this._triggerPort) this._setVarValue();
            this._updateErrorUi();
        };

        if (type == "array") this._typeId = CABLES.Port.TYPE_ARRAY;
        else if (type == "object") this._typeId = CABLES.Port.TYPE_OBJECT;
        else if (type == "string") this._typeId = CABLES.Port.TYPE_STRING;
        else if (type == "texture") this._typeId = CABLES.Port.TYPE_TEXTURE;
        else this._typeId = CABLES.Port.TYPE_VALUE;

    }

    _updateErrorUi()
    {
        if (CABLES.UI)
        {
            if (!this._varNamePort.get()) this._op.setUiError("novarname", "no variable selected");
            else
            {
                if (this._op.hasUiErrors)
                    this._op.setUiError("novarname", null);
            }
        }
    }

    _updateName()
    {
        this._var = null;
        const varname = this._varNamePort.get();
        this._op.setTitle("var set");
        this._op.setUiAttrib({ "extendTitle": "#" + varname });

        this._updateErrorUi();

        const vari = this._op.patch.getVar(varname);
        if (vari && !vari.type) vari.type = this._type;

        if (!this._op.patch.hasVar(varname) && varname != 0 && !this._triggerPort)
        {
            this._setVarValue(); // this should not be done!!!, its kept because of compatibility anxiety
        }
        if (!this._op.patch.hasVar(varname) && varname != 0 && this._triggerPort)
        {
            if (this._type == "string") this._op.patch.setVarValue(varname, "");
            else if (this._type == "number") this._op.patch.setVarValue(varname, "");
            else this._op.patch.setVarValue(varname, null);
        }

        if (this._op.isCurrentUiOp())
        {
            this._updateVarNamesDropdown();
            this._op.refreshParams();
        }
        this._updateDisplay();
        this._op.patch.emitEvent("opVariableNameChanged", this._op, this._varNamePort.get());
    }

    _createVar()
    {
        CABLES.CMD.PATCH.createVariable(this._op, this._type, () => { this._updateName(); });
    }

    _updateDisplay()
    {
        this._valuePort.setUiAttribs({ "greyout": !this._varNamePort.get() });
    }

    _updateVarNamesDropdown()
    {
        if (CABLES.UI && CABLES.UI.loaded && CABLES.UI.loaded)
        {
            const perf = gui.uiProfiler.start("[vars] _updateVarNamesDropdown");

            const varnames = [];
            const vars = this._op.patch.getVars();
            for (const i in vars) if (vars[i].type == this._type && i != "0") varnames.push(i);
            this._varNamePort.uiAttribs.values = varnames;

            perf.finish();
        }
    }

    _renameVar(oldname, newname)
    {
        if (oldname != this._varNamePort.get()) return;
        this._varNamePort.set(newname);
        this._updateName();
    }

    _setVarValue(triggered)
    {
        const v = this._valuePort.get();
        if (!this._var)
        {
            const name = this._varNamePort.get();
            if (!name) return;
            this._op.patch.setVarValue(name, v);
            this._var = this._op.patch.getVar(name);
        }

        if (this._typeId == CABLES.Port.TYPE_VALUE || this._typeId == CABLES.Port.TYPE_STRING)
        {
            this._var.setValue(v);
        }
        else
        if (this._typeId == CABLES.Port.TYPE_ARRAY)
        {
            this._arr = [];
            CABLES.copyArray(v, this._arr);
            this._var.setValue(this._arr);
        }
        else
        {
            if (this._typeId == CABLES.Port.TYPE_OBJECT)
            {
                if (this._isTexture)
                    this._var.setValue(CGL.Texture.getEmptyTexture(this._op.patch.cgl));
                else
                    this._var.setValue(null);

                if (v && v.tex && v._cgl && !this._isTexture) this._op.setUiError("texobj", "Dont use object variables for textures, use varSetTexture");
                else this._op.setUiError("texobj", null);
            }
            this._var.setValue(v);
        }

        if (triggered && this._nextPort) this._nextPort.trigger();
    }
};

const VarGetOpWrapper = class
{
    constructor(op, type, varnamePort, valueOutPort)
    {
        this._op = op;
        this._type = type;
        this._varnamePort = varnamePort;
        this._variable = null;
        this._valueOutPort = valueOutPort;
        this._listenerId = null;
        this._typeId = 0;

        if (type == "array") this._typeId = CABLES.Port.TYPE_ARRAY;
        else if (type == "object") this._typeId = CABLES.Port.TYPE_OBJECT;
        else if (type == "texture") this._typeId = CABLES.Port.TYPE_TEXTURE;
        else if (type == "string") this._typeId = CABLES.Port.TYPE_STRING;
        else this._typeId = CABLES.Port.TYPE_VALUE;

        if (valueOutPort) this._isTexture = valueOutPort.uiAttribs.objType === "texture";

        this._op.on("uiParamPanel", this._updateVarNamesDropdown.bind(this));
        this._op.on("uiErrorChange", this._updateTitle.bind(this));

        this._op.patch.on("variableRename", this._renameVar.bind(this));
        this._op.patch.on("variableDeleted", (oldname) =>
        {
            if (this._op.isCurrentUiOp()) this._op.refreshParams();
        });

        varnamePort.setUiAttribs({ "_variableSelect": true });
        varnamePort.setUiAttribs({ "_variableSelectGet": true });

        this._varnamePort.onChange = this._changeVar.bind(this);
        this._op.patch.addEventListener("variablesChanged", this._init.bind(this));

        this._op.onDelete = () =>
        {
            if (this._variable && this._listenerId) this._variable.off(this._listenerId);
        };

        this._op.init = () =>
        {
            this._init();
        };
    }

    get variable()
    {
        return this._variable;
    }

    _changeVar()
    {
        if (this._variable && this._listenerId)
        {
            this._variable.off(this._listenerId);
        }
        this._init();
    }

    _renameVar(oldname, newname)
    {
        if (oldname != this._varnamePort.get()) return;
        this._varnamePort.set(newname);
        this._updateVarNamesDropdown();
        this._updateTitle();
        this._listenerId = this._variable.on("change", this._setValueOut.bind(this));
    }

    _updateVarNamesDropdown()
    {
        if (CABLES.UI && CABLES.UI.loaded)
        {
            const varnames = [];
            const vars = this._op.patch.getVars();
            for (const i in vars)
                if (vars[i].type == this._type && i != "0")
                    varnames.push(i);

            this._op.varName.uiAttribs.values = varnames;
        }
    }

    _setValueOut(v)
    {
        if (this._valueOutPort)
            if (this._typeId == CABLES.Port.TYPE_NUMBER || this._typeId == CABLES.Port.TYPE_STRING)
                this._valueOutPort.set(v);
            else
            if (this._typeId == CABLES.Port.TYPE_ARRAY || this._typeId == CABLES.Port.TYPE_OBJECT || this._isTexture)
                this._valueOutPort.setRef(v);
            else
                console.log("unkown type?"); // remove type checks when sure

    }

    _updateTitle()
    {
        if (this._variable)
        {
            this._op.setUiError("unknownvar", null);
            this._op.setTitle("var get");
            this._op.setUiAttrib({ "extendTitle": "#" + this._varnamePort.get() });
            if (this._valueOutPort) this._setValueOut(this._variable.getValue());
        }
        else
        {
            this._op.setUiError("unknownvar", "unknown variable! - there is no setVariable with this name (" + this._varnamePort.get() + ")");
            this._op.setUiAttrib({ "extendTitle": "#invalid" });
            if (this._valueOutPort) this._setValueOut(0);
        }
    }

    _init()
    {
        this._updateVarNamesDropdown();

        if (this._variable && this._listenerId) this._variable.off(this._listenerId);
        this._variable = this._op.patch.getVar(this._op.varName.get());
        if (this._variable) this._listenerId = this._variable.on("change", this._setValueOut.bind(this));

        this._updateTitle();

        this._op.patch.emitEvent("opVariableNameChanged", this._op, this._varnamePort.get());
    }

};

CABLES.VarSetOpWrapper = VarSetOpWrapper;
CABLES.VarGetOpWrapper = VarGetOpWrapper;
