    Op.apply(this, arguments);
    var self=this;
    var cgl=this.patch.cgl;

    this.name='Circle Movement';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

    this.segments=this.addInPort(new Port(this,"segments"));
    this.radius=this.addInPort(new Port(this,"radius"));
    this.mulX=this.addInPort(new Port(this,"mulX"));
    this.mulY=this.addInPort(new Port(this,"mulY"));
    this.percent=this.addInPort(new Port(this,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));
    
    var offset=this.addInPort(new Port(this,"offset"));

    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
    this.index=this.addOutPort(new Port(this,"index"));

    var animX=new CABLES.TL.Anim();
    var animY=new CABLES.TL.Anim();
    animX.loop=true;
    animY.loop=true;

var startTime=Date.now()/1000;

    this.render.onTriggered=function()
    {
        cgl.pushMvMatrix();

        var time=Date.now()/1000-startTime+Math.round(self.segments.get())*0.1*self.percent.get();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, [
            animX.getValue(time+offset.get())*self.mulX.get(),
            animY.getValue(time+offset.get())*self.mulY.get(),
            0] );
        self.trigger.trigger();
        
        cgl.popMvMatrix();

    };

    this.segments.val=40;
    this.radius.val=1;
    this.mulX.val=1;
    this.mulY.val=1;

    this.pos=[];

    function calc()
    {
        self.pos.length=0;
        var i=0,degInRad=0;
        animX.clear();
        animY.clear();

        for (i=0; i <= Math.round(self.segments.get()); i++)
        {
            degInRad = (360/Math.round(self.segments.get()))*i*CGL.DEG2RAD;
            animX.setValue(i*0.1,Math.cos(degInRad)*self.radius.get());
            animY.setValue(i*0.1,Math.sin(degInRad)*self.radius.get());
        }
    }

    this.segments.onValueChanged=calc;
    this.radius.onValueChanged=calc;
    calc();