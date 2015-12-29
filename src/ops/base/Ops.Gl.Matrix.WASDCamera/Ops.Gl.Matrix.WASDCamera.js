    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    var DEG2RAD=3.14159/180.0;

    this.name='WASDCamera';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.isLocked=this.addOutPort(new Port(this,"isLocked",OP_PORT_TYPE_VALUE));
    this.isLocked.val=false;

    var vPos=vec3.create();

    // var posX=0,posZ=0,posY=0;
    // var rotX=0,rotY=0,rotZ=0;
    var speedx=0,speedy=0,speedz=0;

    var movementSpeedFactor = 0.5;

    this.posX=this.addInPort(new Port(this,"posX",OP_PORT_TYPE_VALUE));
    this.posY=this.addInPort(new Port(this,"posY",OP_PORT_TYPE_VALUE));
    this.posZ=this.addInPort(new Port(this,"posZ",OP_PORT_TYPE_VALUE));

    this.rotX=this.addInPort(new Port(this,"rotX",OP_PORT_TYPE_VALUE));
    this.rotY=this.addInPort(new Port(this,"rotY",OP_PORT_TYPE_VALUE));

    this.outPosX=this.addOutPort(new Port(this,"posX",OP_PORT_TYPE_VALUE));
    this.outPosY=this.addOutPort(new Port(this,"posY",OP_PORT_TYPE_VALUE));
    this.outPosZ=this.addOutPort(new Port(this,"posZ",OP_PORT_TYPE_VALUE));
    self.outPosX.val=-self.posX.val;
    self.outPosY.val=-self.posY.val;
    self.outPosZ.val=-self.posZ.val;

    var viewMatrix = mat4.create();


    this.render.onTriggered=function()
    {
        calcCameraMovement();
        move();

        if(speedx!==0.0 || speedy!==0.0 || speedz!==0)
        {
            self.outPosX.val=-self.posX.val;
            self.outPosY.val=-self.posY.val;
            self.outPosZ.val=-self.posZ.val;
        }

        cgl.pushMvMatrix();

        vec3.set(vPos, -self.posX.val,-self.posY.val,-self.posZ.val);

        mat4.rotateX( cgl.mvMatrix ,cgl.mvMatrix,DEG2RAD*self.rotX.val);
        mat4.rotateY( cgl.mvMatrix ,cgl.mvMatrix,DEG2RAD*self.rotY.val);
        mat4.translate( cgl.mvMatrix ,cgl.mvMatrix,vPos);

        
        self.trigger.trigger();
        cgl.popMvMatrix();
    };

    //--------------

    function calcCameraMovement()
    {
        var camMovementXComponent = 0.0,
            camMovementYComponent = 0.0,
            camMovementZComponent = 0.0,
            pitchFactor=0,
            yawFactor=0;

        if (pressedW)
        {
            // Control X-Axis movement
            pitchFactor = Math.cos(DEG2RAD*self.rotX.val);
                    
            camMovementXComponent += ( movementSpeedFactor * (Math.sin(DEG2RAD*self.rotY.val)) ) * pitchFactor;

            // Control Y-Axis movement
            camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD*self.rotX.val)) * -1.0;

            // Control Z-Axis movement
            yawFactor = (Math.cos(DEG2RAD*self.rotX.val));
            camMovementZComponent += ( movementSpeedFactor * (Math.cos(DEG2RAD*self.rotY.val)) * -1.0 ) * yawFactor;
        }

        if (pressedS)
        {
            // Control X-Axis movement
            pitchFactor = Math.cos(DEG2RAD*self.rotX.val);
            camMovementXComponent += ( movementSpeedFactor * (Math.sin(DEG2RAD*self.rotY.val)) * -1.0) * pitchFactor;

            // Control Y-Axis movement
            camMovementYComponent += movementSpeedFactor * (Math.sin(DEG2RAD*self.rotX.val));

            // Control Z-Axis movement
            yawFactor = (Math.cos(DEG2RAD*self.rotX.val));
            camMovementZComponent += ( movementSpeedFactor * (Math.cos(DEG2RAD*self.rotY.val)) ) * yawFactor;
        }

        if (pressedA)
        {
            // Calculate our Y-Axis rotation in radians once here because we use it twice
            var yRotRad = DEG2RAD*self.rotY.val;

            camMovementXComponent += -movementSpeedFactor * (Math.cos(yRotRad));
            camMovementZComponent += -movementSpeedFactor * (Math.sin(yRotRad));
        }

        if (pressedD)
        {
            // Calculate our Y-Axis rotation in radians once here because we use it twice
            var yRotRad = DEG2RAD*self.rotY.val;

            camMovementXComponent += movementSpeedFactor * (Math.cos(yRotRad));
            camMovementZComponent += movementSpeedFactor * (Math.sin(yRotRad));
        }

        speedx = camMovementXComponent;
        speedy = camMovementYComponent;
        speedz = camMovementZComponent;

        if (speedx > movementSpeedFactor) speedx = movementSpeedFactor;
        if (speedx < -movementSpeedFactor) speedx = -movementSpeedFactor;

        if (speedy > movementSpeedFactor) speedy = movementSpeedFactor;
        if (speedy < -movementSpeedFactor) speedy = -movementSpeedFactor;

        if (speedz > movementSpeedFactor) speedz = movementSpeedFactor;
        if (speedz < -movementSpeedFactor) speedz = -movementSpeedFactor;
    }

    function moveCallback(e)
    {
        var mouseSensitivity=0.1;
        self.rotX.val+=e.movementY*mouseSensitivity;
        self.rotY.val+=e.movementX*mouseSensitivity;

        if (self.rotX.val < -90.0) self.rotX.val = -90.0;
        if (self.rotX.val > 90.0) self.rotX.val = 90.0;
        if (self.rotY.val < -180.0) self.rotY.val += 360.0;
        if (self.rotY.val > 180.0) self.rotY.val -= 360.0;
    }

    var canvas = document.getElementById("glcanvas");

     function lockChangeCallback(e)
     {
        if (document.pointerLockElement === canvas ||
                document.mozPointerLockElement === canvas ||
                document.webkitPointerLockElement === canvas)
        {
            document.addEventListener("mousemove", moveCallback, false);
            document.addEventListener("keydown", keyDown, false);
            document.addEventListener("keyup", keyUp, false);
            console.log('lock start');
            // isLocked=true;
            self.isLocked.val=true;

        }
        else
        {
            document.removeEventListener("mousemove", moveCallback, false);
            document.removeEventListener("keydown", keyDown, false);
            document.removeEventListener("keyup", keyUp, false);
            // isLocked=false;
            self.isLocked.val=false;
            pressedW=false;
            pressedA=false;
            pressedS=false;
            pressedD=false;

            console.log('lock exit');
        }
    }
       
    document.addEventListener('pointerlockchange', lockChangeCallback, false);
    document.addEventListener('mozpointerlockchange', lockChangeCallback, false);
    document.addEventListener('webkitpointerlockchange', lockChangeCallback, false);

    document.getElementById('glcanvas').addEventListener('mousedown',function()
    {
        document.addEventListener("mousemove", moveCallback, false);
        canvas.requestPointerLock = canvas.requestPointerLock ||
                                    canvas.mozRequestPointerLock ||
                                    canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();

    });

    var lastMove=0;
    function move()
    {
        var timeOffset = window.performance.now()-lastMove;

        self.posX.val+=speedx;
        self.posY.val+=speedy;
        self.posZ.val+=speedz;

        lastMove = window.performance.now();
    }

    var pressedW=false;
    var pressedA=false;
    var pressedS=false;
    var pressedD=false;

    function keyDown(e)
    {
        switch(e.which)
        {
            case 87:
                pressedW=true;
            break;
            case 65:
                pressedA=true;
            break;
            case 83:
                pressedS=true;
            break;
            case 68:
                pressedD=true;
            break;

            default:
                // console.log('key:',e.which);
            break;
        }
    }

    function keyUp(e)
    {
        console.log('key');
                
        switch(e.which)
        {
            case 87:
                pressedW=false;
            break;
            case 65:
                pressedA=false;
            break;
            case 83:
                pressedS=false;
            break;
            case 68:
                pressedD=false;
            break;
        }
    }

