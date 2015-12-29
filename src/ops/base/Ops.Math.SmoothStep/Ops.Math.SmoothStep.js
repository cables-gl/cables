Op.apply(this, arguments);
var self=this;

this.name='SmoothStep';
this.result=this.addOutPort(new Port(this,"result"));
this.number=this.addInPort(new Port(this,"number"));
this.min=this.addInPort(new Port(this,"min"));
this.max=this.addInPort(new Port(this,"max"));

var min=0;
var max=1;
var subAdd=0;

this.exec= function()
{
    var val=self.number.val;

    // todo negative min ?

    var x = Math.max(0, Math.min(1, (val-min)/(max-min)));
    self.result.val= x*x*(3 - 2*x); // smoothstep
    // return x*x*x*(x*(x*6 - 15) + 10); // smootherstep

};

this.min.val=0;
this.max.val=1;
this.number.val=0;

function setValues()
{
    min=self.min.val;
    max=self.max.val;

    // if(min<0)
    // {
    //     subAdd=min*-1;
    //     min+=subAdd;
    //     max+=subAdd;
    // }
    // else subAdd=0;
}

this.number.onValueChanged=this.exec;
this.max.onValueChanged=setValues;
this.min.onValueChanged=setValues;

setValues();
