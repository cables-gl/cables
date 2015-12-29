Op.apply(this, arguments);
var self=this;

this.name='Modulo';
this.result=this.addOutPort(new Port(this,"result"));
this.number1=this.addInPort(new Port(this,"number1"));
this.number2=this.addInPort(new Port(this,"number2"));
this.pingpong=this.addInPort(new Port(this,"pingpong",OP_PORT_TYPE_VALUE,{display:'bool'}));

var doPingPong=false;

this.exec= function()
{
    self.updateAnims();

    if(doPingPong)
    {
        self.result.val=(self.number1.val%self.number2.val*2) ;
        if(self.result.val>self.number2.val)
            self.result.val=self.number2.val*2.0-self.result.val;

        return;
    }
    
    self.result.val=self.number1.val%self.number2.val ;
};

this.number1.onValueChanged=this.exec;
this.number2.onValueChanged=this.exec;

this.number1.val=1;
this.number2.val=2;

this.pingpong.onValueChanged=function()
{
    doPingPong=self.pingpong.val;
};