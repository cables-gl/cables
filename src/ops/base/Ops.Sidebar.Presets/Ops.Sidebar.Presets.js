const parentPort = op.inObject('link');
const labelPort = op.inValueString('Text', 'Presets');
const siblingsPort = op.outObject('Children');

const inAddPreset=op.inFunctionButton("Add Preset");
const inUpdatePreset=op.inFunctionButton("Update current Preset");

inAddPreset.onTriggered=addPreset;
inUpdatePreset.onTriggered=updatePreset;
parentPort.onChange = onParentChanged;

var presetPorts=[];

var el = document.createElement('div');
el.classList.add('sidebar__item');
el.classList.add('sidebar__select');
var label = document.createElement('div');
label.classList.add('sidebar__item-label');
var labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
var selectList = document.createElement('select');
selectList.classList.add('sidebar__select-select');
el.appendChild(selectList);

var MAX_PRESETS=8;

for(var i=0;i<MAX_PRESETS;i++)
{
    var inp=op.inObject("Preset "+i);
    presetPorts.push(inp);
    inp.onLinkChanged=updateSelect;
}

selectList.onchange=function()
{
    setSidebar(selectList.options[selectList.selectedIndex].value);
};

op.init=function()
{
    for(var i=0;i<MAX_PRESETS;i++)
        if(presetPorts[i].isLinked())
            return setSidebar(0);
};

function updateSelect()
{
    while(selectList.firstChild) selectList.removeChild(selectList.firstChild);

    for(var i=0;i<MAX_PRESETS;i++)
    {
        if(presetPorts[i].isLinked())
        {
            var option = document.createElement("option");
            option.value = i;

            var other=presetPorts[i].links[0].getOtherPort(presetPorts[i]);
            
            // other.parent.removeListener("onTitleChange",updateSelect);
            if(!other.parent.hasEventListener("onTitleChange",updateSelect))
                other.parent.addEventListener("onTitleChange",updateSelect);

            option.text = ''+other.parent.name;
            selectList.appendChild(option);
        }
    }
}

function onParentChanged() {
    var parent = parentPort.get();
    if(parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(null);
        siblingsPort.set(parent);
    } else { // detach
        if(el.parentElement) {
            el.parentElement.removeChild(el);    
        }
    }
}



function deSerializeSidebar(obj)
{
    if(!obj)return;
    if(!obj.ops)return;
    
    for(var i=0;i<obj.ops.length;i++)
    {
        var theOp=op.patch.getOpById(obj.ops[i].id);
        if(theOp)
        {
            
            for(var portName in obj.ops[i].ports)
            {
                var p=theOp.getPortByName(portName);
                if(p)
                {
                    p.set(obj.ops[i].ports[portName].value);
                    console.log('set value ',portName,obj.ops[i].ports[portName]);
                    console.log(obj.ops[i].ports);
                }
                else
                {
                    console.log('unknown p!');
                }
                
                var def=theOp.getPortByName("Input");
                if(def)
                {
                    console.log("SET input!!!");
                    def.set(obj.ops[i].ports[portName]);
                }
            }
            
        }
        
        // console.log(i);
    }
    
}


// inSet.onTriggered=setSidebar;
function setSidebar(idx)
{
    var obj=presetPorts[idx].get();
    deSerializeSidebar(obj);
    // console.log(obj);
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if(el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);    
    }
}

function updatePreset()
{
    var r=serializeSidebar();
    var idx=selectList.options[selectList.selectedIndex].value;

    var valueOp=presetPorts[idx].links[0].getOtherPort(presetPorts[idx]).parent;
    console.log(valueOp);
    valueOp.getPortByName('JSON String').set( JSON.stringify(r) );
}


function serializeSidebar()
{
    var values=[];
    for(i=0;i<op.patch.ops.length;i++)
    {
        if(
            op.patch.ops[i].objName.indexOf('Ops.Sidebar.Sidebar')==-1 &&
            op.patch.ops[i].objName.indexOf('AsObject')==-1 &&
            op.patch.ops[i].objName.indexOf('Group')==-1 &&
            op.patch.ops[i].objName.indexOf('Preset')==-1 && 
            op.patch.ops[i].objName.indexOf('Ops.Sidebar')===0 
            )
        {
            // console.log("objname",op.patch.ops[i].objName);

            let foundPort=false;

            const theOp=op.patch.ops[i];
            let p={};
            p.id=theOp.id;
            p.objName=theOp.objName;
            p.ports={};

            for(var j=0;j<op.patch.ops[i].portsOut.length;j++)
            {
                if(theOp.portsOut[j].type==OP_PORT_TYPE_VALUE)
                {
                    p.ports[theOp.portsOut[j].name]=theOp.portsOut[j].get();
                    foundPort=true;
                }
            }

            if(foundPort)values.push(p);
        }
    }
    
    var r={ops:values};
    
    if(CABLES.UI && gui) gui.setStateUnsaved();
    return r;
}


function addPreset()
{
    var freePort=0;
    var i=0;
    for(i=0;i<MAX_PRESETS;i++)
    {
        if(!presetPorts[i].isLinked())
        {
            freePort=presetPorts[i];
            break;
        }
    }

    var r=serializeSidebar();
    
    console.log(r);
    
    var newOp=op.patch.addOp("Ops.Json.ParseObject");
    console.log(r);
    newOp.getPortByName("JSON String").set(JSON.stringify(r));
    if(CABLES.UI)gui.patch().focusOp(newOp);

    op.patch.link(op,freePort.name,newOp,"Result");

}


op.serializeSidebar=serializeSidebar;
op.deSerializeSidebar=deSerializeSidebar;
