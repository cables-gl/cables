var self=this;
Op.apply(this, arguments);

this.name='random';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.result=this.addOutPort(new Port(this,"result"));

this.minusPlusOne=this.addInPort(new Port(this,"0 to x / -x to x ",OP_PORT_TYPE_VALUE,{display:'bool'}));

this.max=this.addInPort(new Port(this,"max"));

function calcRandom()
{
    if(self.minusPlusOne.val) self.result.val=(Math.random()*self.max.val)*2-self.max.val/2;
        else self.result.val=Math.random()*self.max.val;
}

this.exe.onTriggered=calcRandom;
this.max.onValueChanged=calcRandom;


this.exe.onTriggered();
this.max.val=1.0;
