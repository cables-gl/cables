    Op.apply(this, arguments);
    var self=this;

    this.name='concat';
    this.result=this.addOutPort(new Port(this,"result"));
    this.string1=this.addInPort(new Port(this,"string1",OP_PORT_TYPE_VALUE,{type:'string'}));
    this.string2=this.addInPort(new Port(this,"string2",OP_PORT_TYPE_VALUE,{type:'string'}));

    this.exec= function()
    {
        self.result.val=self.string1.val+self.string2.val;
    };

    this.string1.onValueChanged=this.exec;
    this.string2.onValueChanged=this.exec;

    this.string1.val='wurst';
    this.string2.val='tuete';
