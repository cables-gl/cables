const render = op.inTrigger('render');
const inSegments = op.inValueInt('Segments', 24);
const trigger = op.outTrigger('trigger');
const sizeW = op.inValueFloat('width', 1);
const sizeH = op.inValueFloat('height', 1);
const borderRadius = op.inValueSlider('border radius', 0.5);

const geom = new CGL.Geometry('triangle');
const geomOut = op.outObject('geometry');

geomOut.ignoreValueSerialize = true;

op.setPortGroup('Size', [sizeW, sizeH, borderRadius, inSegments]);

const inTopLeftCorner = op.inValueBool('Top Left', true);
const inTopRightCorner = op.inValueBool('Top Right', true);
const inBottomLeftCorner = op.inValueBool('Bottom Left', true);
const inBottomRightCorner = op.inValueBool('Bottom Right', true);
const CORNER_PORTS = [inTopLeftCorner, inTopRightCorner, inBottomLeftCorner, inBottomRightCorner];
CORNER_PORTS.forEach((port) => {
  port.onChange = create;
});

op.setPortGroup('Round Corner', CORNER_PORTS);

const draw = op.inValueBool('Draw', true);
op.setPortGroup('Draw', [draw]);

const cgl = op.patch.cgl;
let mesh = null;
sizeW.onChange = create;
sizeH.onChange = create;
borderRadius.onChange = create;
inSegments.onChange = create;

create();

render.onTriggered = function () {
  if (draw.get()) mesh.render(cgl.getShader());
  trigger.trigger();
};

function create() {
  const w = Math.abs(sizeW.get());
  const h = Math.abs(sizeH.get());

  const r = w < h ? (borderRadius.get() * w) / 2 : (borderRadius.get() * h) / 2;

  const wi = w - 2 * r;
  const hi = h - 2 * r;
  const wiHalf = wi / 2;
  const hiHalf = hi / 2;

  const segments = Math.abs(inSegments.get() || 1);

  const topLeftCircleMiddle = [-1 * wiHalf, hiHalf, 0];
  const bottomLeftCircleMiddle = [-1 * wiHalf, -1 * hiHalf, 0];
  const topRightCircleMiddle = [wiHalf, hiHalf, 0];
  const bottomRightCircleMiddle = [wiHalf, -1 * hiHalf, 0];

  const circleVerts = [];
  let lastX = 0;
  let lastY = 0;

  // top left circle
  if (inTopLeftCorner.get()) {
    for (let i = 0; i <= segments; i += 1) {
      const x = topLeftCircleMiddle[0] + (0 - r * Math.cos((i * Math.PI) / 2 / segments));
      const y = topLeftCircleMiddle[1] + r * Math.sin((i * Math.PI) / 2 / segments);

      circleVerts.push(x, y, 0);

      if (i > 1) {
        circleVerts.push(lastX, lastY, 0);
      }

      if (i <= segments - 1) circleVerts.push(...topLeftCircleMiddle);

      lastX = x;
      lastY = y;
    }
  } else {
    circleVerts.push(...topLeftCircleMiddle);
    circleVerts.push(-wiHalf, hiHalf + r, 0);
    circleVerts.push(-wiHalf - r, hiHalf + r, 0);

    circleVerts.push(...topLeftCircleMiddle);
    circleVerts.push(-wiHalf - r, hiHalf + r, 0);
    circleVerts.push(-wiHalf - r, hiHalf, 0);
  }

  if (inTopRightCorner.get()) {
    // top right circle
    for (let i = 0; i <= segments; i += 1) {
      const x = topRightCircleMiddle[0] + r * Math.cos((i * Math.PI) / 2 / segments);
      const y = topRightCircleMiddle[1] + r * Math.sin((i * Math.PI) / 2 / segments);

      if (i > 1) {
        circleVerts.push(...topRightCircleMiddle, lastX, lastY, 0);
      }

      circleVerts.push(x, y, 0);

      if (i === segments - 1) circleVerts.push(...topRightCircleMiddle);

      lastX = x;
      lastY = y;
    }
  } else {
    circleVerts.push(...topRightCircleMiddle);
    circleVerts.push(wiHalf + r, hiHalf, 0);
    circleVerts.push(wiHalf + r, hiHalf + r, 0);

    circleVerts.push(...topRightCircleMiddle);
    circleVerts.push(wiHalf + r, hiHalf + r, 0);
    circleVerts.push(wiHalf, hiHalf + r, 0);
  }

  if (inBottomRightCorner.get()) {
    // bottom right circle
    for (let i = 0; i <= segments; i += 1) {
      const x = bottomRightCircleMiddle[0] + r * Math.cos((i * Math.PI) / 2 / segments);
      const y = bottomRightCircleMiddle[1] + r * -1 * Math.sin((i * Math.PI) / 2 / segments);

      circleVerts.push(x, y, 0);

      if (i > 1) {
        circleVerts.push(lastX, lastY, 0);
      }

      if (i <= segments - 1) circleVerts.push(...bottomRightCircleMiddle);

      lastX = x;
      lastY = y;
    }
  } else {
    circleVerts.push(...bottomRightCircleMiddle);
    circleVerts.push(wiHalf + r, -hiHalf - r, 0);
    circleVerts.push(wiHalf + r, -hiHalf, 0);

    circleVerts.push(...bottomRightCircleMiddle);
    circleVerts.push(wiHalf, -hiHalf - r, 0);
    circleVerts.push(wiHalf + r, -hiHalf - r, 0);
  }

  if (inBottomLeftCorner.get()) {
    // bottom left circle
    for (let i = 0; i <= segments; i += 1) {
      const x = bottomLeftCircleMiddle[0] + r * -1 * Math.cos((i * Math.PI) / 2 / segments);
      const y = bottomLeftCircleMiddle[1] + r * -1 * Math.sin((i * Math.PI) / 2 / segments);

      if (i > 1) {
        circleVerts.push(lastX, lastY, 0);
      }

      circleVerts.push(x, y, 0);

      if (i <= segments - 1) circleVerts.push(...bottomLeftCircleMiddle);

      lastX = x;
      lastY = y;
    }
  } else {
    circleVerts.push(...bottomLeftCircleMiddle);
    circleVerts.push(-wiHalf - r, -hiHalf - r, 0);
    circleVerts.push(-wiHalf, -hiHalf - r, 0);

    circleVerts.push(...bottomLeftCircleMiddle);
    circleVerts.push(-wiHalf - r, -hiHalf, 0);
    circleVerts.push(-wiHalf - r, -hiHalf - r, 0);
  }

  geom.vertices = [
        //inner rectangle

        -1*wiHalf, -hiHalf, 0,
        wiHalf, hiHalf, 0,
        -1*wiHalf, hiHalf, 0,


        -1*wiHalf, -1*hiHalf,0,
        wiHalf, -1*hiHalf, 0,
        wiHalf, hiHalf, 0,

    // left rectangle

      -1*wiHalf-r, -1*hiHalf, 0,
      -1*wiHalf, -1*hiHalf, 0,
      -1*wiHalf-r, hiHalf, 0,

      -1*wiHalf-r, hiHalf, 0,
      -1*wiHalf, -1*hiHalf, 0,
      -1*wiHalf, hiHalf, 0,

        // top rectangle

      -1*wiHalf, hiHalf, 0,
      wiHalf, hiHalf+r, 0,
      -1*wiHalf, hiHalf+r, 0,

      wiHalf, hiHalf + r, 0,
      -1*wiHalf, hiHalf, 0,
      wiHalf, hiHalf, 0,

      // bottom rectangle
      -1*wiHalf, -1*hiHalf, 0,
      -1*wiHalf, -1*hiHalf-r, 0,
      wiHalf, -1*hiHalf-r, 0,

      wiHalf, -1*hiHalf, 0,
      -1*wiHalf, -1*hiHalf, 0,
      wiHalf, -1*hiHalf-r, 0,

      // right rectangle

      wiHalf+r, hiHalf, 0,
      wiHalf, hiHalf, 0,
      wiHalf+r, -1*hiHalf, 0,

      wiHalf+r, -1*hiHalf, 0,
      wiHalf, hiHalf, 0,
      wiHalf, -1*hiHalf, 0,
        ...circleVerts
    ]

    geom.texCoords = [];
  const wAbs = Math.abs(w);
  const hAbs = Math.abs(h);

  for (let i = 0; i < geom.vertices.length; i += 3) {
    geom.texCoords[(i / 3) * 2 + 0] = Math.abs(geom.vertices[i + 0] / -wAbs - 0.5);
    geom.texCoords[(i / 3) * 2 + 1] = Math.abs(geom.vertices[i + 1] / hAbs - 0.5);
  }

  geom.vertexNormals = geom.vertices.map((vert, i) => (i % 3 === 2 ? 1.0 : 0.0));
  geom.tangents = geom.vertices.map((vert, i) => (i % 3 === 0 ? -1.0 : 0.0));
  geom.biTangents = geom.vertices.map((vert, i) => (i % 3 === 1 ? -1.0 : 0.0));

  if (geom.vertices.length == 0) return;
  if (mesh) mesh.dispose();
  mesh = null;
  mesh = new CGL.Mesh(cgl, geom);
  geomOut.set(null);
  geomOut.set(geom);
}
