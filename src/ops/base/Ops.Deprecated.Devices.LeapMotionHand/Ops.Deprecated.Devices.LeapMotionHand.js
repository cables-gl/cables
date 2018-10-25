    //Op.apply(this, arguments);

    this.name='leap hand';

    this.patch.loadLib('leap-motion');

    var leapFrame=this.addInPort(new CABLES.Port(this,"leap frame",CABLES.OP_PORT_TYPE_OBJECT));
    leapFrame.ignoreValueSerialize=true;

    var handIndex=this.addInPort(new CABLES.Port(this,"hand index"));


    var valid=this.addOutPort(new CABLES.Port(this,"valid"));

    // var sphereCenterX=this.addOutPort(new CABLES.Port(this,"sphereCenter x"));
    // var sphereCenterY=this.addOutPort(new CABLES.Port(this,"sphereCenter y"));
    // var sphereCenterZ=this.addOutPort(new CABLES.Port(this,"sphereCenter z"));
    // var sphereRadius=this.addOutPort(new CABLES.Port(this,"sphereRadius"));


    var palmX=this.addOutPort(new CABLES.Port(this,"palm x"));
    var palmY=this.addOutPort(new CABLES.Port(this,"palm y"));
    var palmZ=this.addOutPort(new CABLES.Port(this,"palm z"));

    handIndex.set(0);

    leapFrame.onValueChange(function()
    {
        var frame=leapFrame.get();
        if(frame.hands.length>handIndex.get())
        {
            var hand=frame.hands[handIndex.get()];
            valid.set(hand.valid);
            
            palmX.set(hand.palmPosition[0]);
            palmY.set(hand.palmPosition[1]);
            palmZ.set(hand.palmPosition[2]);

            // sphereCenterX.set(hand.sphereCenter[0]);
            // sphereCenterY.set(hand.sphereCenter[1]);
            // sphereCenterZ.set(hand.sphereCenter[2]);
            // sphereRadius.set(hand.sphereRadius);
        }
        else
        {
            valid.set(false);
        }
        
    });

    // Leap.loop(function (frame)
    // {



    // });


