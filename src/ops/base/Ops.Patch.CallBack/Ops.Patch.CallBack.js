Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='callback';
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.callbackname=this.addInPort(new Port(this,"callback name",OP_PORT_TYPE_VALUE,{type:'string'}));
this.val0=this.addInPort(new Port(this,"value 1",OP_PORT_TYPE_VALUE,{type:'string'}));
this.val1=this.addInPort(new Port(this,"value 2",OP_PORT_TYPE_VALUE,{type:'string'}));
this.val2=this.addInPort(new Port(this,"value 3",OP_PORT_TYPE_VALUE,{type:'string'}));

var values=[0,0,0]

this.val0.onValueChanged=function(){ values[0]=self.val0.get(); }
this.val1.onValueChanged=function(){ values[1]=self.val1.get(); }
this.val2.onValueChanged=function(){ values[2]=self.val2.get(); }

this.exe.onTriggered=function()
{
    if(self.patch.config.hasOwnProperty(self.callbackname.get()))
    {
        // console.log('has callback!',self.callbackname.get());
        self.patch.config[self.callbackname.get()](values);
    }
    else
    {
        // console.log('callback not found!',self.callbackname.get());
    }
};

