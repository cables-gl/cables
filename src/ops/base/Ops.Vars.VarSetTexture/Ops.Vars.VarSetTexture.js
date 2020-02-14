var val=op.inObject("Object");
op.varName=op.inValueSelect("Variable",[],"",true);

op.varName.onChange=updateName;
val.onChange=update;

// op.patch.addVariableListener(updateVarNamesDropdown);
op.patch.addEventListener("variablesChanged",updateVarNamesDropdown);


updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();

        for(var i in vars) varnames.push(i);

        varnames.push('+ create new one');
        op.varName.uiAttribs.values=varnames;
    }
}

function updateName()
{
    if(CABLES.UI)
    {
        if(op.varName.get()=='+ create new one')
        {
            CABLES.CMD.PATCH.createVariable(op);
            return;
        }

        op.setTitle('#'+op.varName.get());
    }
    update();
}

function update()
{
    op.patch.setVarValue(op.varName.get(),CGL.Texture.getEmptyTexture(op.patch.cgl));
    op.patch.setVarValue(op.varName.get(),val.get());
}
