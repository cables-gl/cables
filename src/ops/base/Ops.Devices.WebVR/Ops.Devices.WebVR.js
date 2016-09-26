var cgl=op.patch.cgl;
op.name='WebVR';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var smallRender=op.inValueBool("Small Renderer");

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var triggerGamePad=op.addOutPort(new Port(op,"Controller Matrix",OP_PORT_TYPE_FUNCTION));
var numGamepads=op.addOutPort(new Port(op,"Num Controller",OP_PORT_TYPE_VALUE));
var tex0=op.addOutPort(new Port(op,"texture left",OP_PORT_TYPE_TEXTURE,{preview:true}));
var tex1=op.addOutPort(new Port(op,"texture right",OP_PORT_TYPE_TEXTURE,{preview:true}));

var fb=[new CGL.Framebuffer(cgl,w,h),new CGL.Framebuffer(cgl,w,h)];
tex0.set( fb[0].getTextureColor() );
tex1.set( fb[1].getTextureColor() );

var vrDisplay=null;

var orientMatrix=mat4.create();
var identMatrix=mat4.create();
var quaternion=[0,0,0,0];
var firstQuat=null;

var gp1Matrix=mat4.create();
var qMat=mat4.create();
var frameData = null;
var w=1025;
var h=1025;


var hasDisplay=op.outValue('hasDisplay');
var hasPose=op.outValue('hasPose');
var hasOrientation=op.outValue('hasorientation');
var isPresenting=op.outValue('is presenting');

var triggerAfter=op.addOutPort(new Port(op,"trigger After",OP_PORT_TYPE_FUNCTION));


var pose=null;



function renderConrollers()
{
    var count=0;

    var gamePads=navigator.getGamepads();

    for(var gp=0;gp< gamePads.length;gp++)
    {
        if(gamePads[gp])
        {
            var gamepad=gamePads[gp];
            if (gamepad && gamepad.pose)
            {
                cgl.pushMvMatrix();
                
                mat4.identity(gp1Matrix);
                mat4.translate(gp1Matrix,gp1Matrix,gamepad.pose.position);
                mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,gp1Matrix);
                
                // console.log(gamepad.pose);
                mat4.fromQuat(qMat, gamepad.pose.orientation);
                mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);
                
                triggerGamePad.trigger();
                
                cgl.popMvMatrix();
            }
            count++;
        }
    }

    numGamepads.set(count);

}


function renderEye(eye)
{
    cgl.pushPMatrix();
    cgl.pushViewMatrix();
    
    if(!eye || !pose || !pose.orientation) return;

    mat4.perspectiveFromFieldOfView(cgl.pMatrix, eye.fieldOfView, 0.1, 1024.0);

    mat4.fromRotationTranslation(cgl.vMatrix, pose.orientation, pose.position);
    mat4.translate(cgl.vMatrix, cgl.vMatrix, eye.offset);
    mat4.invert(cgl.vMatrix, cgl.vMatrix);

    trigger.trigger();
    
    renderConrollers();
    
    cgl.popViewMatrix();
    cgl.popPMatrix();
}

var eyeLeft=null;
var eyeRight=null;

render.onTriggered=function()
{

    if(vrDisplay)
    {
        isPresenting.set(vrDisplay.isPresenting);
        hasDisplay.set(true);
        pose=vrDisplay.getPose();
        
        if(pose) hasPose.set(true);
        else 
        {
            hasPose.set(false);
            return;
        }

        eyeLeft=vrDisplay.getEyeParameters("left");
        eyeRight=vrDisplay.getEyeParameters("right");

        if(pose.orientation) hasOrientation.set(true);
            else hasOrientation.set(false);

        if(smallRender.get())
        {
            w=cgl.canvas.width=document.getElementById('cablescanvas').offsetWidth;
            h=cgl.canvas.height=document.getElementById('cablescanvas').offsetHeight;
        }
        else
        {
            if(eyeLeft && ( w!=eyeLeft.renderWidth || h!=eyeLeft.renderHeight))
            {
                w=eyeLeft.renderWidth;
                h=eyeLeft.renderHeight;
                fb[0].setSize(w,h);
                fb[1].setSize(w,h);
                cgl.canvas.width=w*2;

                cgl.canvas.height=h;
                console.log('set eye resolution',w,h);
            }
        }
    
        fb[0].renderStart();
        renderEye(eyeRight);
        fb[0].renderEnd();
    
        cgl.resetViewPort();
    
        fb[1].renderStart();
        renderEye(eyeLeft);
        fb[1].renderEnd();

        tex0.set( fb[0].getTextureColor() );
        tex1.set( fb[1].getTextureColor() );
    
        cgl.resetViewPort();
        
        triggerAfter.trigger();
    }
    else
    {
        hasDisplay.set(false);
    }

    if(vrDisplay && pose)
    {
        vrDisplay.submitFrame(pose);
    }
    
    
};

function requestVrFullscreen()
{
    
    vrDisplay.requestPresent([{ source: cgl.canvas }]).then(function ()
    {
        
        //   webglCanvas.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
        //   webglCanvas.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);

     console.log("requestPresent ok.");   
    }, function () {
      console.log("requestPresent failed.");
    });

//     if(!CABLES.UI && vrHMD)
//     {
//         var canvas=document.getElementById('glcanvas');
//         console.log('requesting HMD fullscreen!');
//     	if ( canvas.mozRequestFullScreen )
//     	{
// 		    console.log("requesting fullscreen...")
// 			canvas.mozRequestFullScreen( { vrDisplay: vrHMD } );
// 		}
// 		else if ( canvas.webkitRequestFullscreen )
// 		{
// 		    console.log("requesting fullscreen...")
// 			canvas.webkitRequestFullscreen( { vrDisplay: vrHMD } );
// 		}
//     }
    
}


if(navigator.getVRDisplays)
{
    console.log('loading devices...');
    navigator.getVRDisplays().then(function(devices)
    {
        console.log('hallo devices...');
        console.log(devices);
        var info='found devices:<br/>';
        
		for ( var i = 0; i < devices.length; i ++ )
		{
// 			if ( devices[ i ] instanceof HMDVRDevice )
// 				vrHMD = devices[ i ];
// 			else
// 			if ( devices[ i ] instanceof PositionSensorVRDevice ) 
// 			{
				vrDisplay=devices[i];
// 				console.log(devices[i]);
				info+='- '+devices[i].displayName+' <br/>';
// 			}
		}

		info+=' found input devices <br/>';
        op.uiAttr({info:info});
        op.uiAttr({warning:''});
    gui.patch().showOpParams(op);

        document.getElementById("glcanvas").ondblclick = requestVrFullscreen;

    });
}
else
{
    op.uiAttr({warning:'browser has no webvr api'});
}
