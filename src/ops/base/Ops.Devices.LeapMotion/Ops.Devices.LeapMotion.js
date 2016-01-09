    Op.apply(this, arguments);
    var self=this;

    this.patch.loadLib('leap-motion');

    this.name='LeapMotion';
    
    var leapFrame=this.addOutPort(new Port(this,"leapFrame",OP_PORT_TYPE_OBJECT));
    leapFrame.ignoreValueSerialize=true;
    
    var numHands=this.addOutPort(new Port(this,"num Hands"));
    
    

    Leap.loop(function (frame)
    {
        numHands.set(frame.hands.length);
        
        leapFrame.set(frame);
        
        
    });
