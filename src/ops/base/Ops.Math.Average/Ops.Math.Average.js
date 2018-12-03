const number=op.inValue("number");
const result=op.outValue("result");
const infl=op.inValueSlider("Influence",0.2);

number.onChange=function()
{
    var influence=infl.get();
    result.set( (result.get()*(1.0-influence)+number.get())*influence );
};

number.set(1);
