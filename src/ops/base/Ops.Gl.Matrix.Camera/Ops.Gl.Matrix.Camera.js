const render=op.inTrigger("render");
const trigger=op.outTrigger("trigger");

/* Inputs */
// projection | prespective & ortogonal
const projectionMode=op.inValueSelect("projection mode",['prespective','ortogonal'], 'prespective');
const zNear=op.inValue("frustum near",0.01);
const zFar=op.inValue("frustum far",5000.0);

const fov=op.inValue("fov",45);

const autoAspect=op.inValueBool("Auto Aspect Ratio",true);
const aspect=op.inValue("Aspect Ratio",1);

// look at camera
const eyeX=op.inValue("eye X",0);
const eyeY=op.inValue("eye Y",0);
const eyeZ=op.inValue("eye Z",5);

const centerX=op.inValue("center X",0);
const centerY=op.inValue("center Y",0);
const centerZ=op.inValue("center Z",0);

// camera transform and movements
const posX=op.inValue("truck",0);
const posY=op.inValue("boom",0);
const posZ=op.inValue("dolly",0);

const rotX=op.inValue("tilt",0);
const rotY=op.inValue("pan",0);
const rotZ=op.inValue("roll",0);


/* Outputs */
const outAsp=op.outValue("Aspect");
const outArr=op.outArray("Look At Array");


/* logic */
var cgl=op.patch.cgl;

var asp=0;

var vUp=vec3.create();
var vEye=vec3.create();
var vCenter=vec3.create();
var transMatrix=mat4.create();
mat4.identity(transMatrix);

var arr=[];

// Transform and move
var vPos=vec3.create();
var transMatrixMove=mat4.create();
mat4.identity(transMatrixMove);

var updateCameraMovementMatrix=true;

render.onTriggered=function() {
    // Aspect ration
    if(!autoAspect.get()) asp=aspect.get();
    else asp=cgl.getViewPort()[2]/cgl.getViewPort()[3];
    outAsp.set(asp);
    
    // translation (truck, boom, dolly)
    cgl.pushViewMatrix();
    
    if (updateCameraMovementMatrix) {
        mat4.identity(transMatrixMove);
        
        vec3.set(vPos, posX.get(),posY.get(),posZ.get());
        if(posX.get()!==0.0 || posY.get()!==0.0 || posZ.get()!==0.0)
            mat4.translate(transMatrixMove,transMatrixMove, vPos);
        
        if(rotX.get()!==0)
            mat4.rotateX(transMatrixMove,transMatrixMove, rotX.get()*CGL.DEG2RAD);
        if(rotY.get()!==0)
            mat4.rotateY(transMatrixMove,transMatrixMove, rotY.get()*CGL.DEG2RAD);
        if(rotZ.get()!==0)
            mat4.rotateZ(transMatrixMove,transMatrixMove, rotZ.get()*CGL.DEG2RAD);
        
        updateCameraMovementMatrix = false;
    }
    
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrixMove);
    
    // projection (prespective / ortogonal)
    cgl.pushPMatrix();
    
    // look at
    cgl.pushViewMatrix();
 
    if (projectionMode.get()=='prespective') {
        mat4.perspective(
            cgl.pMatrix,
            fov.get()*0.0174533,
            asp, 
            zNear.get(), 
            zFar.get()
        );
    } else if (projectionMode.get()=='ortogonal') {
        mat4.ortho(
            cgl.pMatrix,
            -1 * (fov.get() / 14),
             1 * (fov.get() / 14),
            -1 * (fov.get() / 14) / asp,
             1 * (fov.get() / 14) / asp,
            zNear.get(), 
            zFar.get()
        );
    }
    
    
	arr[0]=eyeX.get();
	arr[1]=eyeY.get();
	arr[2]=eyeZ.get();

	arr[3]=centerX.get();
	arr[4]=centerY.get();
	arr[5]=centerZ.get();

	arr[6]=0;
	arr[7]=1;
	arr[8]=0;

	outArr.set(arr);

	vec3.set(vUp, 0, 1, 0);
	vec3.set(vEye, eyeX.get(),eyeY.get(),eyeZ.get());
	vec3.set(vCenter, centerX.get(),centerY.get(),centerZ.get());

	mat4.lookAt(transMatrix, vEye, vCenter, vUp);

	mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);

	trigger.trigger();

	cgl.popViewMatrix();
	cgl.popPMatrix();

	cgl.popViewMatrix();
    
    
	// GUI for dolly, boom and truck
	if(CABLES.UI && gui.patch().isCurrentOp(op)) 
		gui.setTransformGizmo({
			posX:posX,
			posY:posY,
			posZ:posZ
		});
};

var updateUI=function() {
	if(!autoAspect.get()) {
		aspect.setUiAttribs({hidePort:false,greyout:false});
	} else {
		aspect.setUiAttribs({hidePort:true,greyout:true});
	}
};

var cameraMovementChanged=function() {
	updateCameraMovementMatrix = true;
};

// listeners
posX.onChange=cameraMovementChanged;
posY.onChange=cameraMovementChanged;
posZ.onChange=cameraMovementChanged;

rotX.onChange=cameraMovementChanged;
rotY.onChange=cameraMovementChanged;
rotZ.onChange=cameraMovementChanged;

autoAspect.onChange=updateUI;
updateUI();


