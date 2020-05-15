

class VarGetOpWrapper
{
    constructor(op, type, varnamePort, valueOutPort)
    {
        this._op = op;
        this._type = type;
        this._varnamePort = varnamePort;
        this._variable = null;
        this._valueOutPort = valueOutPort;

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
}

export { VarGetOpWrapper };
