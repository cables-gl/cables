    var self=this;
    Op.apply(this, arguments);

    this.name='MotionSensor';
    

    this.mulAxis=this.addInPort(new Port(this,"mulAxis"));
    this.mulAxis.val=1.0;
    
    this.foundSensor=this.addOutPort(new Port(this,"foundSensor"));
    
    this.axis1=this.addOutPort(new Port(this,"axis1"));
    this.axis2=this.addOutPort(new Port(this,"axis2"));
    this.axis3=this.addOutPort(new Port(this,"axis3"));

    this.accX=this.addOutPort(new Port(this,"accX"));
    this.accY=this.addOutPort(new Port(this,"accY"));
    this.accZ=this.addOutPort(new Port(this,"accX"));

    this.axis1.set(0);
    this.axis2.set(0);
    this.axis3.set(0);

    this.accX.set(0);
    this.accY.set(0);
    this.accZ.set(0);

    var lastTime=0;
    var lastTimeAcc=0;

    window.ondevicemotion = function(event)
    {
        if(Date.now()-lastTimeAcc>15)
        {
            lastTimeAcc=Date.now();

            self.accX.set( event.accelerationIncludingGravity.x );
            self.accY.set( event.accelerationIncludingGravity.y );
            self.accZ.set( event.accelerationIncludingGravity.z );
        }
    };

    window.addEventListener("deviceorientation", function (event)
    {
        if(Date.now()-lastTime>15)
        {
            lastTime=Date.now();
            self.axis1.set( (event.alpha || 0) *self.mulAxis.get() );
            self.axis2.set( (event.beta || 0 ) *self.mulAxis.get() );
            self.axis3.set( (event.gamma || 0) *self.mulAxis.get() );

        }
    }, true);
