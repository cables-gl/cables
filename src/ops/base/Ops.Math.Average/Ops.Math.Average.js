var number=op.addInPort(new Port(op,"number"));
var result=op.addOutPort(new Port(op,"result"));
var infl=op.inValueSlider("Influence",0.2);

number.onValueChanged=function()
{
    var influence=infl.get();
    result.set( (result.get()*(1.0-influence)+number.get())*influence );
};

number.set(1);
