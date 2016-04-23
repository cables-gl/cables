var cgl=op.patch.cgl;
op.name='WebVR';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var vrInputs=[];
var vrHMD=null;
var orientMatrix=mat4.create();
var identMatrix=mat4.create();
var quaternion=[0,0,0,0];
var firstQuat=null;



render.onTriggered=function()
{
    // console.log(vrInputs.length);
    for(var i=0;i<vrInputs.length;i++)
    {
		var state = vrInputs[i].getState();
		if(!firstQuat)
		{
		    vrInputs[i].resetSensor();
		    firstQuat=quat.create();
		}
		if(state.orientation)
		{
    		quaternion[0]=state.orientation.x;
    		quaternion[1]=-state.orientation.y;
    		quaternion[2]=state.orientation.z;
    		quaternion[3]=state.orientation.w;
		}
		
    	mat4.fromQuat(orientMatrix, quaternion);
    	
        // cgl.pushViewMatrix();
        // mat4.multiply(cgl.vMatrix,cgl.vMatrix,orientMatrix);
        // cgl.vMatrix=poseToMatrix(state);
    
        trigger.trigger();
        cgl.popViewMatrix();
    }
};

function requestVrFullscreen()
{
    if(!CABLES.UI && vrHMD)
    {
        var canvas=document.getElementById('glcanvas');
        console.log('requesting HMD fullscreen!');
    	if ( canvas.mozRequestFullScreen )
    	{
			canvas.mozRequestFullScreen( { vrDisplay: vrHMD } );
		}
		else if ( canvas.webkitRequestFullscreen )
		{
			canvas.webkitRequestFullscreen( { vrDisplay: vrHMD } );
		}
    }
    
}


if(navigator.getVRDevices)
{
    console.log('loading devices...');
    navigator.getVRDevices().then(function(devices)
    {
        console.log('hallo devices...');
        console.log(devices);
        var info='found devices:<br/>';
        
		for ( var i = 0; i < devices.length; i ++ )
		{
			if ( devices[ i ] instanceof HMDVRDevice )
				vrHMD = devices[ i ];
			else
			if ( devices[ i ] instanceof PositionSensorVRDevice ) 
			{
				vrInputs.push( devices[ i ] );
				console.log(devices[i]);
				info+='- '+devices[i].deviceName+' <br/>';
			}
		}

		info+=vrInputs.length+' input devices <br/>';
        op.uiAttr({info:info});

        document.getElementById("glcanvas").ondblclick = requestVrFullscreen;

    });
}
else
{
    op.uiAttr({warning:'browser has no webvr api'});
}
