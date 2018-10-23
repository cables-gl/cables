op.name="mytestop";

var exe=op.addInPort(new Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var testOut=op.addOutPort(new Port(op,"testout",CABLES.OP_PORT_TYPE_VALUE));

var anim=null;

// testOut.set(1234);


function yay()
{
    console.log('yay!!!!');
}

var startTime=0;

exe.onTriggered=function()
{
    
    if(!anim)
    {
        console.log('new anim!');
        anim=new CABLES.TL.Anim();
        anim.setValue(0,0);
        anim.setValue(1,1,yay);
        anim.setValue(2,2,yay);
        // anim.setValue(2,2);
        // anim.setValue(3,1);
        // anim.setValue(4,5,yay);
        startTime=Date.now();
    }

    var v=anim.getValue((Date.now()-startTime)/1000);
    // console.log(anim.isRising( (Date.now()-startTime)/1000 ));

};