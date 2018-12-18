const inKey = op.inValueString("key");
const inValue = op.inValueString("value");
const outValue = op.outValue("stored value");


function getKey(){return (op.patch.namespace||"")+inKey.get();}

inKey.onChange=function(){
    outValue.set(window.localStorage.getItem(getKey()));
};

inValue.onChange=function(){
    var val = inValue.get();
    window.localStorage.setItem(getKey(),val);
    outValue.set(val);
};

inKey.onChange();
