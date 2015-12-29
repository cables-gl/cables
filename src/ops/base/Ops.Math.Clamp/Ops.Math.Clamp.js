    var self=this;
    Op.apply(this, arguments);

    this.name='Clamp';
    this.val=this.addInPort(new Port(this,"val"));
    this.min=this.addInPort(new Port(this,"min"));
    this.max=this.addInPort(new Port(this,"max"));
    this.result=this.addOutPort(new Port(this,"result"));

    function clamp()
    {
        self.result.val= Math.min(Math.max(self.val.val, self.min.val), self.max.val);
    }

    this.min.val=0;
    this.max.val=1;

    this.val.onValueChanged=clamp;
    this.min.onValueChanged=clamp;
    this.max.onValueChanged=clamp;

    this.val.val=0.5;
