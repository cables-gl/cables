

class VarSetOpWrapper
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

        this._op.patch.addEventListener("variableDeleted", this._updateVarNamesDropdown.bind(this));
        this._op.patch.addEventListener("variablesChanged", this._updateName.bind(this));
        this._op.patch.addEventListener("variableRename", this._renameVar.bind(this));

        this._varNamePort.onChange = this._updateName.bind(this);

        this._valuePort.onChange = this._setVarValue.bind(this);
        this._valuePort.changeAlways = true;

        this._op.init = () =>
        {
            this._updateName();
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

        this._setVarValue();
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
}

export { VarSetOpWrapper };
