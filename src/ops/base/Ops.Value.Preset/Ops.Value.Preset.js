const
    presetA=op.inInt("Preset A","0"),
    presetB=op.inInt("Preset B","1"),
    presetFade=op.inFloatSlider("Fade",0.5),

    dataPort=op.inString("data",""),
    setsPort=op.inString("sets",""),
    presetNames=op.inDropDown("Preset",[]),
    presetCreate=op.inTriggerButton("Create new"),
    presetUpdate=op.inTriggerButton("Update"),
    presetDelete=op.inTriggerButton("Delete"),
    addPort=op.addOutPort(new CABLES.Port(op,"Create Variable",CABLES.OP_PORT_TYPE_DYNAMIC));

var data=[];
var presets=[];
var valuePorts=[];

op.setPortGroup("Manage Presets",[presetCreate,presetUpdate,presetDelete,presetNames]);
dataPort.setUiAttribs({"hideParam":true,"hidePort":true});
setsPort.setUiAttribs({"hideParam":true,"hidePort":true});
presetCreate.setUiAttribs({"hidePort":true});
presetUpdate.setUiAttribs({"hidePort":true});
presetDelete.setUiAttribs({"hidePort":true});


presetA.onChange=updateFade;
presetB.onChange=updateFade;
presetFade.onChange=updateFade;


function updateFade()
{
    var a=presets[presetA.get()];
    var b=presets[presetB.get()];

    if(!a || !b)
    {
        console.warn("presets wrong");
        return;
    }

    // todo: cache variable, so no string lookup needed every time...

    var fade=presetFade.get();


    for(var i in a.values)
    {
        var ip=a.values[i]+ (b.values[i]-a.values[i])*fade;
        // return parseFloat(key1.value)+ parseFloat((key2.value - key1.value)) * perc;
        op.patch.setVarValue(i,ip);

    }




}


function savePresets()
{
    setsPort.set(JSON.stringify(presets));
}

function setPresetValues(preset)
{
    preset.values=preset.values || {};

    for(var i=0;i<valuePorts.length;i++)
        preset.values[valuePorts[i].name]=valuePorts[i].value;

    return preset;
}

function updateDropdown()
{
    for(var i=0;i<presets.length;i++)
        presetNames.uiAttribs.values.push(presets[i].name);

}


function getPreset(name)
{
    for(var i=0;i<presets.length;i++)
    {
        if(presets[i] && presets[i].name==name)return presets[i];
    }
}
updateDropdown();

setsPort.onChange=function()
{
    presets=JSON.parse(setsPort.get());

    updateDropdown();

    setsPort.onChange=null;
};

presetNames.onChange=function()
{
    var preset=getPreset(presetNames.get());

    if(!preset)return;

    var varnames=Object.keys(preset.values);

    for (var i = 0; i < varnames.length; i++)
    {
        var p=op.getPort(varnames[i]);
        p.set(preset.values[varnames[i]]);
    }

    op.refreshParams();
};


presetUpdate.onTriggered=function()
{
    var preset=getPreset(presetNames.get());
    preset=setPresetValues(preset);
    savePresets();
};

presetCreate.onTriggered=function()
{
    if(!CABLES.UI)return;
    CABLES.UI.MODAL.prompt("New Preset","Enter a new preset name","",
        function(str)
        {
            // presetNames.uiAttribs.values.push(str);

            op.refreshParams();
            presetNames.set(str);

            var preset=
                {
                    "name":str
                };

            preset=setPresetValues(preset);

            presets.push(preset);
            updateDropdown();
            savePresets();
        });
};

presetDelete.onTriggered=function()
{
    if(!CABLES.UI)return;
    const current=presetNames.get();
    const idx=presetNames.uiAttribs.values.indexOf(current);
    presetNames.uiAttribs.values.splice(idx,1);

    op.refreshParams();

};

dataPort.onChange=function()
{
    data=JSON.parse(dataPort.get());

    for(var i=0;i<data.length;i++)
    {
        var portObject=data[i];

    	if(portObject.type==CABLES.OP_PORT_TYPE_VALUE)
    	{
    	    const varname=portObject.varname;
    	    op.patch.setVarValue(varname,0);
    	    var port=op.inFloat(varname,0);

    	    listenPortChange(port,varname);
    	}
    }

    console.log(data);
    dataPort.onChange=null;
};


function saveData()
{
    dataPort.set(JSON.stringify(data));
}

function listenPortChange(port,varname)
{
    valuePorts.push(port);
    port.onChange=function()
    {
        console.log(varname,port.get());
        op.patch.setVarValue(varname,port.get());
    };
}


addPort.onLinkChanged=function(p)
{
    if(addPort.links.length===0)return;

    var link=addPort.links[0];

    var otherPort=link.getOtherPort(addPort);
    var newPort=op.addInPort(new CABLES.Port(op,otherPort.name,otherPort.type));
    newPort.set(otherPort.get());

    const varname="preset_"+newPort.name;

    data.push(
        {
            "varname":varname,
            "type":newPort.type
        });

    op.patch.setVarValue(varname,otherPort.get());

	if(newPort.type==CABLES.OP_PORT_TYPE_VALUE)
	{
        var opGetter = op.patch.addOp("Ops.Vars.VarGetNumber");
        opGetter.varName.set(varname);

        op.patch.link(otherPort.parent,otherPort.name,opGetter,"Value");
    }

    listenPortChange(newPort,varname);

    addPort.removeLinks();
    saveData();
};

