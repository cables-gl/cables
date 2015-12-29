    Op.apply(this, arguments);
    var self=this;

    this.name='LeapMotion';

    this.transX=this.addOutPort(new Port(this,"translationX"));
    this.transY=this.addOutPort(new Port(this,"translationY"));
    this.transZ=this.addOutPort(new Port(this,"translationZ"));

    this.finger0X=this.addOutPort(new Port(this,"finger0X"));
    this.finger0Y=this.addOutPort(new Port(this,"finger0Y"));
    this.finger0Z=this.addOutPort(new Port(this,"finger0Z"));

    Leap.loop(function (frame)
    {
        self.transX.val=frame._translation[0];
        self.transY.val=frame._translation[1];
        self.transZ.val=frame._translation[2];

        if(frame.fingers.length>0)
        {
            self.finger0X.val=frame.fingers[0].tipPosition[0];
            self.finger0Y.val=frame.fingers[0].tipPosition[1];
            self.finger0Z.val=frame.fingers[0].tipPosition[2];
        }
    });


