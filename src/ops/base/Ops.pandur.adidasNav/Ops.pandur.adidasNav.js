var self=this;
Op.apply(this, arguments);

this.name='AdidasNav';

var cgl=this.patch.cgl;this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
this.doAnim=this.addInPort(new Port(this,"doAnimate",OP_PORT_TYPE_VALUE,{display:'bool'}));

this.wheel=this.addInPort(new Port(this,"wheel",OP_PORT_TYPE_VALUE));


var navParams=[];
for(var i=0;i<5;i++)
{
    var params={
        posx:this.addInPort(new Port(this,"posx"+i,OP_PORT_TYPE_VALUE)),
        posy:this.addInPort(new Port(this,"posy"+i,OP_PORT_TYPE_VALUE)),
        posz:this.addInPort(new Port(this,"posz"+i,OP_PORT_TYPE_VALUE)),

        targetx:this.addInPort(new Port(this,"targetx"+i,OP_PORT_TYPE_VALUE)),
        targety:this.addInPort(new Port(this,"targety"+i,OP_PORT_TYPE_VALUE)),
        targetz:this.addInPort(new Port(this,"targetz"+i,OP_PORT_TYPE_VALUE)),

        upvecx:this.addInPort(new Port(this,"upvecx"+i,OP_PORT_TYPE_VALUE)),
        upvecy:this.addInPort(new Port(this,"upvecy"+i,OP_PORT_TYPE_VALUE)),
        upvecz:this.addInPort(new Port(this,"upvecz"+i,OP_PORT_TYPE_VALUE))

    };
    
    navParams.push(params);
}


this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.navBack=this.addOutPort(new Port(this,"navBack",OP_PORT_TYPE_FUNCTION));
this.navFade=this.addOutPort(new Port(this,"navFade",OP_PORT_TYPE_VALUE));
this.wheelOut=this.addOutPort(new Port(this,"wheelOut",OP_PORT_TYPE_VALUE));

this.shirtTexture=this.addOutPort(new Port(this,"shirtTexture",OP_PORT_TYPE_VALUE));


this.mouseSpeedX=this.addOutPort(new Port(this,"mouseSpeedX",OP_PORT_TYPE_VALUE));
this.mouseSpeedX.set(1);

this.mouseSpeedY=this.addOutPort(new Port(this,"mouseSpeedY",OP_PORT_TYPE_VALUE));
this.mouseSpeedY.set(-0.25);

this.eyeX=this.addOutPort(new Port(this,"eyeX",OP_PORT_TYPE_VALUE));
this.eyeY=this.addOutPort(new Port(this,"eyeY",OP_PORT_TYPE_VALUE));
this.eyeZ=this.addOutPort(new Port(this,"eyeZ",OP_PORT_TYPE_VALUE));

this.targetX=this.addOutPort(new Port(this,"targetX",OP_PORT_TYPE_VALUE));
this.targetY=this.addOutPort(new Port(this,"targetY",OP_PORT_TYPE_VALUE));
this.targetZ=this.addOutPort(new Port(this,"targetZ",OP_PORT_TYPE_VALUE));

this.upvecX=this.addOutPort(new Port(this,"upvecX",OP_PORT_TYPE_VALUE));
this.upvecY=this.addOutPort(new Port(this,"upvecY",OP_PORT_TYPE_VALUE));
this.upvecZ=this.addOutPort(new Port(this,"upvecZ",OP_PORT_TYPE_VALUE));

this.outCurrentNav=this.addOutPort(new Port(this,"currentNav",OP_PORT_TYPE_VALUE));


var animX=new CABLES.TL.Anim();
var animY=new CABLES.TL.Anim();
var animZ=new CABLES.TL.Anim();
animX.defaultEasing=CABLES.TL.EASING_SIN_OUT;
animY.defaultEasing=CABLES.TL.EASING_SIN_OUT;
animZ.defaultEasing=CABLES.TL.EASING_SIN_OUT;

var animTargetX=new CABLES.TL.Anim();
var animTargetY=new CABLES.TL.Anim();
var animTargetZ=new CABLES.TL.Anim();
animTargetX.defaultEasing=CABLES.TL.EASING_SIN_OUT;
animTargetY.defaultEasing=CABLES.TL.EASING_SIN_OUT;
animTargetZ.defaultEasing=CABLES.TL.EASING_SIN_OUT;

var animUpvecX=new CABLES.TL.Anim();
var animUpvecY=new CABLES.TL.Anim();
var animUpvecZ=new CABLES.TL.Anim();
animUpvecX.defaultEasing=CABLES.TL.EASING_LINEAR;
animUpvecY.defaultEasing=CABLES.TL.EASING_LINEAR;
animUpvecZ.defaultEasing=CABLES.TL.EASING_LINEAR;


var navFadeAnim=new CABLES.TL.Anim();
navFadeAnim.defaultEasing=CABLES.TL.EASING_SIN_OUT;
navFadeAnim.setValue(0,1);

var animDuration=0.65;

var animMouseSpeedX=new CABLES.TL.Anim();
animMouseSpeedX.defaultEasing=CABLES.TL.EASING_SIN_OUT;

var animMouseSpeedY=new CABLES.TL.Anim();
animMouseSpeedY.defaultEasing=CABLES.TL.EASING_SIN_OUT;





function animate(nextNav)
{
    var now=Date.now()/1000;
    
    animX.clear(now);
    animY.clear(now);
    animZ.clear(now);
    animX.setValue(now+animDuration,navParams[nextNav].posx.get());
    animY.setValue(now+animDuration,navParams[nextNav].posy.get());
    animZ.setValue(now+animDuration,navParams[nextNav].posz.get());

    animTargetX.clear(now);
    animTargetY.clear(now);
    animTargetZ.clear(now);
    animTargetX.setValue(now+animDuration,navParams[nextNav].targetx.get());
    animTargetY.setValue(now+animDuration,navParams[nextNav].targety.get());
    animTargetZ.setValue(now+animDuration,navParams[nextNav].targetz.get());

    animUpvecX.clear(now);
    animUpvecY.clear(now);
    animUpvecZ.clear(now);
    animUpvecX.setValue(now+animDuration,navParams[nextNav].upvecx.get());
    animUpvecY.setValue(now+animDuration,navParams[nextNav].upvecy.get());
    animUpvecZ.setValue(now+animDuration,navParams[nextNav].upvecz.get());

}

var transMatrix = mat4.create();
var currentNav=1;
var wheelMul=1;

this.exe.onTriggered=function()
{
    var now=Date.now()/1000;

    if(currentNav==1) self.shirtTexture.set(1);
    else self.shirtTexture.set(0);

    self.wheelOut.set(navFadeAnim.getValue(now));

    wheelMul=1.0+self.wheelOut.get()*(navFadeAnim.getValue(now)*(self.wheel.get()));

    if(self.doAnim.get())
    {
        // if(currentNav==0)
        {
            self.eyeX.set( animX.getValue(now)*wheelMul );
            self.eyeY.set( animY.getValue(now)*wheelMul );
            self.eyeZ.set( animZ.getValue(now)*wheelMul );
        }
        // else
        // {
        //     self.eyeX.set( animX.getValue(now) );
        //     self.eyeY.set( animY.getValue(now) );
        //     self.eyeZ.set( animZ.getValue(now) );

        // }
    
        self.targetX.set( animTargetX.getValue(now) );
        self.targetY.set( animTargetY.getValue(now) );
        self.targetZ.set( animTargetZ.getValue(now) );
    
        self.upvecX.set( animUpvecX.getValue(now) );
        self.upvecY.set( animUpvecY.getValue(now) );
        self.upvecZ.set( animUpvecZ.getValue(now) );
    }
    else
    {
        if(navParams[currentNav])
        {
            self.eyeX.set( navParams[currentNav].posx.get() );
            self.eyeY.set( navParams[currentNav].posy.get() );
            self.eyeZ.set( navParams[currentNav].posz.get() );
        
            self.targetX.set( navParams[currentNav].targetx.get() );
            self.targetY.set( navParams[currentNav].targety.get() );
            self.targetZ.set( navParams[currentNav].targetz.get() );

            self.upvecX.set( navParams[currentNav].upvecx.get() );
            self.upvecY.set( navParams[currentNav].upvecy.get() );
            self.upvecZ.set( navParams[currentNav].upvecz.get() );
        }
    }

    

    self.trigger.trigger();

    if(self.patch.vars.hasOwnProperty('adidasNav'))
    {

        if(currentNav!=self.patch.vars.adidasNav && (navFadeAnim.getValue(now)==0.0 || navFadeAnim.getValue(now)==1.0))
        {
            navFadeAnim.clear(now);
            animMouseSpeedX.clear(now);
            animMouseSpeedY.clear(now);
            // animWheel.clear(now);
            navFadeAnim.setValue(now,navFadeAnim.getValue(now));
            if(self.patch.vars.adidasNav==0) 
            {
                navFadeAnim.setValue(now+animDuration*0.5,1);
                animMouseSpeedX.setValue(now+animDuration,1);
                animMouseSpeedY.setValue(now+animDuration,-0.25);

            }
            else 
            {
                navFadeAnim.setValue(now+animDuration*0.5,0);
                animMouseSpeedX.setValue(now+animDuration,0.1);
                animMouseSpeedY.setValue(now+animDuration,-0.05);
            }

            console.log('switching nav!');

            currentNav=self.patch.vars.adidasNav;
            animate(self.patch.vars.adidasNav);
        }
    }
    
    self.mouseSpeedX.set(animMouseSpeedX.getValue(now));
    self.mouseSpeedY.set(animMouseSpeedY.getValue(now));
    
    self.navFade.set( navFadeAnim.getValue(now ) );
    
    self.outCurrentNav.set(currentNav);
    
    if(currentNav!=0)
    {
        self.navBack.trigger();
    }


};

self.patch.vars.adidasNav=0;

