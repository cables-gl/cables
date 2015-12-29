var self=this;
Op.apply(this, arguments);

this.name='SmootherStep';
this.val=this.addInPort(new Port(this,"val"));
this.min=this.addInPort(new Port(this,"min"));
this.max=this.addInPort(new Port(this,"max"));
this.result=this.addOutPort(new Port(this,"result"));

function smootherstep ()
{
    var x = Math.max(0, Math.min(1, (self.val.val-self.min.val)/(self.max.val-self.min.val)));
    self.result.val= x*x*x*(x*(x*6 - 15) + 10); // smootherstep
    // return linear(self.val.val,this,key2);
}

this.min.val=0;
this.max.val=1;

this.val.onValueChanged=smootherstep;
this.min.onValueChanged=smootherstep;
this.max.onValueChanged=smootherstep;

this.val.val=0.5;