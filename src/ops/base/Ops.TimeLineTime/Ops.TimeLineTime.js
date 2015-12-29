Op.apply(this, arguments);
var self=this;

this.name='TimeLineTime';
this.theTime=this.addOutPort(new Port(this,"time"));

this.onAnimFrame=function(time)
{
    this.theTime.val=time;
};