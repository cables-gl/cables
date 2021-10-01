const inObject=op.inObject("Object");
const inKey=op.inString("Key");
const inValue=op.inObject("Object Value");
const outObject=op.outObject("Result Object");

op.onDelete=removeKey;

inKey.onChange=()=>{
    removeKey();
    update();
};

outObject.onLinkChanged=
inObject.onChange=update;

let currentKey="";

let obj={};

function removeKey()
{
    delete obj[currentKey];

}

function copyObject()
{

}


function update()
{
    obj=inObject.get()||{};

    let changed=false;

    currentKey=inKey.get();
    if(obj[inKey.get()]!=inValue.get())changed=true;
    obj[inKey.get()]=inValue.get();

    outObject.set(null);
    outObject.set(obj);
}
