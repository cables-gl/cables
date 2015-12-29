    Op.apply(this, arguments);
    var self=this;
    var cgl=this.patch.cgl;

    this.name='CircleTransform';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

    this.segments=this.addInPort(new Port(this,"segments"));
    this.radius=this.addInPort(new Port(this,"radius"));
    this.percent=this.addInPort(new Port(this,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));

    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
    this.index=this.addOutPort(new Port(this,"index"));

    this.render.onTriggered=function()
    {
        for(var i=0;i<self.pos.length;i++)
        {
            cgl.pushMvMatrix();

            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, self.pos[i] );
            self.trigger.trigger();

            self.index.val=i;

            cgl.popMvMatrix();
        }
    };

    this.segments.val=40;
    this.radius.val=1;
    this.percent.val=1;

    this.pos=[];

    function calc()
    {
        self.pos.length=0;

        var i=0,degInRad=0;

        for (i=0; i <= Math.round(self.segments.get())*self.percent.get(); i++)
        {
            degInRad = (360/Math.round(self.segments.get()))*i*CGL.DEG2RAD;
            self.pos.push(
                [
                Math.cos(degInRad)*self.radius.get(),
                Math.sin(degInRad)*self.radius.get(),
                0
                ]
                );
        }
    }

    this.segments.onValueChanged=calc;
    this.radius.onValueChanged=calc;
    this.percent.onValueChanged=calc;
    calc();