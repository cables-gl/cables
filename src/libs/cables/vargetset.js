const VarSetOpWrapper = class
{
    constructor(op, type, valuePort, varNamePort)
    {
        this._valuePort = valuePort;
        this._varNamePort = varNamePort;
        this._op = op;
        this._type = type;

        this._btnCreate = op.inTriggerButton("Create new variable");
        this._btnCreate.setUiAttribs({ "hidePort": true });
        this._btnCreate.onTriggered = this._createVar.bind(this);

        this._helper = op.inUiTriggerButtons("", ["Rename"]);
        this._helper.setUiAttribs({ "hidePort": true });
        this._helper.onTriggered = (which) => { if (which == "Rename") CABLES.CMD.PATCH.renameVariable(op.varName.get()); };

        this._op.setPortGroup("Variable", [this._helper, this._varNamePort, this._btnCreate]);

        this._op.on("uiParamPanel", this._updateVarNamesDropdown.bind(this));

        // this._op.patch.addEventListener("variableDeleted", this._updateVarNamesDropdown.bind(this));
        this._op.patch.addEventListener("variablesChanged", this._updateName.bind(this));
        this._op.patch.addEventListener("variableRename", this._renameVar.bind(this));

        this._varNamePort.onChange = this._updateName.bind(this);

        this._valuePort.onChange = this._setVarValue.bind(this);
        this._valuePort.changeAlways = true;

        this._op.init = () =>
        {
            this._updateName();
            this._setVarValue();
            this._updateErrorUi();
        };
    }

    _updateErrorUi()
    {
        if (CABLES.UI)
        {
            if (!this._varNamePort.get()) this._op.setUiError("novarname", "no variable selected");
            else this._op.setUiError("novarname", null);
        }
    }

    _updateName()
    {
        if (CABLES.UI) this._op.setTitle("set #" + this._varNamePort.get());
        this._updateErrorUi();

        const vari = this._op.patch.getVar(this._varNamePort.get());
        if (vari && !vari.type) vari.type = this._type;


        this._updateVarNamesDropdown();

        if (this._op.isCurrentUiOp())
        {
            console.log("OP REFRESH PARAMS");
            this._op.refreshParams();
        }
    }

    _createVar()
    {
        CABLES.CMD.PATCH.createVariable(this._op, this._type, () => { this._updateName(); });
    }

    _updateVarNamesDropdown()
    {
        if (CABLES.UI)
        {
            const varnames = [];
            const vars = this._op.patch.getVars();
            for (const i in vars) if (vars[i].type == this._type && i != "0") varnames.push(i);
            this._varNamePort.uiAttribs.values = varnames;
        }
    }

    _renameVar(oldname, newname)
    {
        if (oldname != this._varNamePort.get()) return;
        this._varNamePort.set(newname);
        this._updateName();
    }

    _setVarValue()
    {
        this._op.patch.setVarValue(this._varNamePort.get(), this._valuePort.get());
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

        this._op.on("uiParamPanel", this._updateVarNamesDropdown.bind(this));
        this._op.patch.on("variableRename", this._renameVar.bind(this));
        this._op.patch.on("variableDeleted", (oldname) =>
        {
            if (this._op.isCurrentUiOp()) this._op.refreshParams();
        });

        this._varnamePort.onChange = this._init.bind(this);
        this._op.patch.addEventListener("variablesChanged", this._init.bind(this));

        this._op.onDelete = function ()
        {
            if (this._variable) this._variable.removeListener(this._setValueOut.bind(this));
        };

        this._op.init = () =>
        {
            this._init();
        };
    }

    _renameVar(oldname, newname)
    {
        if (oldname != this._varnamePort.get()) return;
        this._varnamePort.set(newname);
        this._updateVarNamesDropdown();
    }

    _updateVarNamesDropdown()
    {
        if (CABLES.UI)
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
        this._updateVarNamesDropdown();
        this._valueOutPort.set(v);
    }


    _init()
    {
        this._updateVarNamesDropdown();

        if (this._variable) this._variable.removeListener(this._setValueOut.bind(this));
        this._variable = this._op.patch.getVar(this._op.varName.get());

        if (this._variable)
        {
            this._variable.addListener(this._setValueOut.bind(this));
            this._op.setUiError("unknownvar", null);
            this._op.setTitle("#" + this._varnamePort.get());
            this._valueOutPort.set(this._variable.getValue());
        }
        else
        {
            this._op.setUiError("unknownvar", "unknown variable! - there is no setVariable with this name (" + this._varnamePort.get() + ")");
            this._op.setTitle("#invalid");
            this._valueOutPort.set(0);
        }
    }
};

CABLES.VarSetOpWrapper = VarSetOpWrapper;
CABLES.VarGetOpWrapper = VarGetOpWrapper;
