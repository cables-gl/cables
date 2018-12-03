var self=this;
//Op.apply(this, arguments);

this.name='random';
this.exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
this.result=this.addOutPort(new CABLES.Port(this,"result"));

var min=this.addInPort(new CABLES.Port(this,"min"));
var max=this.addInPort(new CABLES.Port(this,"max"));



this.exe.onTriggered=function()
{
    var minVal = parseFloat( min.get() );
    var maxVal = parseFloat( max.get() );
    self.result.set( Math.random() * ( maxVal - minVal ) + minVal );
};

this.exe.onTriggered();
min.val=0.0;
max.val=1.0;
