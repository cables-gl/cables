    var self=this;
    Op.apply(this, arguments);

    this.name='ArrayGetValue';
    this.array=this.addInPort(new Port(this, "array",OP_PORT_TYPE_ARRAY));
    this.index=this.addInPort(new Port(this, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
    this.value=this.addOutPort(new Port(this, "value",OP_PORT_TYPE_VALUE));
    var arr=[];

    function update()
    {
        self.value.set( self.array.val[self.index.get()] );
        // console.log('self.array.val',self.array.val[self.index.val]);
    }

    this.index.onValueChanged=update;
    this.array.onValueChanged=update;
