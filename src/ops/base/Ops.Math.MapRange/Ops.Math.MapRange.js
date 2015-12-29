Op.apply(this, arguments);
var self=this;

this.name='map value range';
this.result=this.addOutPort(new Port(this,"result"));
this.v=this.addInPort(new Port(this,"value"));
this.old_min=this.addInPort(new Port(this,"old min"));
this.old_max=this.addInPort(new Port(this,"old max"));
this.new_min=this.addInPort(new Port(this,"new min"));
this.new_max=this.addInPort(new Port(this,"new max"));

this.exec= function()
{
    self.updateAnims();

    if(self.v.val>self.old_max.val)
    {
        self.result.val=self.new_max.val;
        return;
    }
    else
    if(self.v.val<self.old_min.val)
    {
        self.result.val=self.new_min.val;
        return;
    }

    var nMin=parseFloat(self.new_min.val);
    var nMax=parseFloat(self.new_max.val);
    var oMin=parseFloat(self.old_min.val);
    var oMax=parseFloat(self.old_max.val);
    var x=parseFloat(self.v.val);

    var reverseInput = false;
    var oldMin = Math.min( oMin, oMax );
    var oldMax = Math.max( oMin, oMax );
    if(oldMin!= oMin) reverseInput = true;

    var reverseOutput = false;
    var newMin = Math.min( nMin, nMax );
    var newMax = Math.max( nMin, nMax );
    if(newMin != nMin) reverseOutput = true;

    var portion=0;

    if(reverseInput) portion = (oldMax-x)*(newMax-newMin)/(oldMax-oldMin);
        else portion = (x-oldMin)*(newMax-newMin)/(oldMax-oldMin);
    
    if(reverseOutput) self.result.val = newMax - portion;
        else self.result.val = portion + newMin;

};

this.v.val=0;
this.old_min.val=-1;
this.old_max.val=1;
this.new_min.val=0;
this.new_max.val=1;


this.v.onValueChanged=this.exec;
this.old_min.onValueChanged=this.exec;
this.old_max.onValueChanged=this.exec;
this.new_min.onValueChanged=this.exec;
this.new_max.onValueChanged=this.exec;

this.exec();