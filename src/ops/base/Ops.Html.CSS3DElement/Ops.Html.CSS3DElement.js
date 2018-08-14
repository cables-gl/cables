const
	cgl = op.patch.cgl,
	trigger = op.inFunction('trigger'),
	inElement = op.inObject('DOMElement'),
	next = op.outFunction('next'),
	sCSSMatrix = mat4.create(),
	sScalingVector = vec3.create()
;

op.uuid = CABLES.uuid();

var elProjection = cgl.canvas.parentElement.querySelector('[data-provide="css3d"]');
if (!elProjection) {
	elProjection = document.createElement('div');
	elProjection.style.position = "absolute";
	elProjection.style.top = elProjection.style.left = 0;
	elProjection.style.width = elProjection.style.height = "100%";
	elProjection.dataset.provide = "css3d";
	elProjection.style.zIndex = 1000;
	elProjection.style.pointerEvents = "none";
	elProjection.style.perspectiveOrigin = "center center";
	cgl.canvas.parentElement.appendChild(elProjection);

	var style = document.createElement('style');
	style.type="text/css";
	style.textContent = '.cables-css3dview {position:absolute;left:0;top:0;width:100%;height:100%;transform-style:preserve-3d;} .cables-css3dview > * {pointer-events:auto;transform:translate3d(-50%,-50%,0)}';
	elProjection.appendChild(style);
}

op.onDelete = function() {
	var el = elProjection.querySelector('[data-ccs3did="'+op.uuid+'"]');
	if (el) el.parentElement.removeChild(el);
}

function wrap (el) {
	var view = document.createElement('div');
	view.classList.add('cables-css3dview');
	view.dataset.css3did = op.uuid;
	view.appendChild(el);
	return view;
}

inElement.onChange = function (self, el) {
	op.onDelete();
	if (el) elProjection.appendChild(wrap(el));
}

trigger.onTriggered = function () {
	var pxfov = 0.5 / (1 / cgl.pMatrix[5]) * cgl.gl.drawingBufferHeight;
	elProjection.style.perspective = pxfov + "px";
	var a = -2 * cgl.gl.drawingBufferWidth / cgl.gl.drawingBufferHeight;
	vec3.set(
		sScalingVector,
		a / cgl.gl.drawingBufferWidth,
		-2 / cgl.gl.drawingBufferHeight,
		1
	);
	var el = inElement.get();
	if (el) {
		mat4.multiply(
			sCSSMatrix,
			cgl.vMatrix,
			cgl.mMatrix
		);
		mat4.scale(
			sCSSMatrix,
			sCSSMatrix,
			sScalingVector
		);
		el.parentElement.style.transform = "translateZ("+pxfov+"px) matrix3d(" +
			sCSSMatrix[0] + ',' +
			-sCSSMatrix[1] + ',' +
			sCSSMatrix[2] + ',' +
			sCSSMatrix[3] + ',' +
			sCSSMatrix[4] + ',' +
			-sCSSMatrix[5] + ',' +
			sCSSMatrix[6] + ',' +
			sCSSMatrix[7] + ',' +
			sCSSMatrix[8] + ',' +
			-sCSSMatrix[9] + ',' +
			sCSSMatrix[10] + ',' +
			sCSSMatrix[11] + ',' +
			sCSSMatrix[12] + ',' +
			-sCSSMatrix[13] + ',' +
			sCSSMatrix[14] + ',' +
			sCSSMatrix[15] +
		") scaleX(-1) translate3d("+
			cgl.gl.drawingBufferWidth/2+"px,"+
			cgl.gl.drawingBufferHeight/2+"px"+
			",0"+
		")";
	}
	next.trigger();
}

