CABLES.Op.apply(this, arguments);
var self=this;

this.name='ToggleBool';

this.bool=this.addInPort(new Port(this,"boolean"));
this.bool.val=false;
this.boolOut=this.addOutPort(new Port(this,"result"));
this.boolOut.val=true;

this.bool.onValueChanged=function()
{
    this.boolOut=!this.bool.val;
};