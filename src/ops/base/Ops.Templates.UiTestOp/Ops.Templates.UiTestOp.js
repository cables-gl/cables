const cgl = op.patch.cgl;

const inWarning1=op.inBool("Warning 1",false);
const inWarning2=op.inBool("Warning 2",false);
const innum=op.inFloatSlider("Slider",0);
const trig= op.inTrigger("trigger");

trig.onTriggered=update;

inWarning1.onChange=()=>
{
    if(inWarning1.get()) op.setUiError("Warn1","Warning one",1);
    else op.setUiError("Warn1",null);
};

inWarning2.onChange=()=>
{
    if(inWarning2.get()) op.setUiError("Warn2","Warning two",2);
    else op.setUiError("Warn2",null);
};


innum.onChange = () => {

const q=innum.get();

    if (q < 0.3) op.setUiError("qRange", "number to small", 1);
    else if (q > 0.6) op.setUiError("qRange", "number to big", 1);
    else {
        op.log("no error!");
        op.setUiError("qRange", null);
    }
    op.log(q);
};

function update()
{

}