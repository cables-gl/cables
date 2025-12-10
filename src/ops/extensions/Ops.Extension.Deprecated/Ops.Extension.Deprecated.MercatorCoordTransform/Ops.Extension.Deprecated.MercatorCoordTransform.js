// //Op.apply(this, arguments);
// var self=this;
let cgl = this.patch.cgl;
this.name = "MercatorCoordTransform";
let exe = this.addInPort(new CABLES.Port(this, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let arr = this.addInPort(new CABLES.Port(this, "array", CABLES.OP_PORT_TYPE_ARRAY));

let centerLon = this.addInPort(new CABLES.Port(this, "center lon", CABLES.OP_PORT_TYPE_VALUE));
let centerLat = this.addInPort(new CABLES.Port(this, "center lat", CABLES.OP_PORT_TYPE_VALUE));

let mul = this.addInPort(new CABLES.Port(this, "mul", CABLES.OP_PORT_TYPE_VALUE));

let indexOut = this.addOutPort(new CABLES.Port(this, "index", CABLES.OP_PORT_TYPE_VALUE));
const trigger = op.outTrigger("trigger");

let vecMin = vec3.create();

let centerX = 0, centerY = 0;

function getCoord(lat, lon)
{
    let vec = vec3.create();
    let x = parseFloat(lon);
    let y = parseFloat(lat);
    x -= centerX;
    y -= centerY;
    vec3.set(vec, x, y, 0);
    return vec;
}

let points = [];

let parse = function ()
{
    points.length = 0;
    centerX = centerY = 0;
    let cvec = getCoord(centerLat.get(), centerLon.get());
    centerX = cvec[0];
    centerY = cvec[1];

    let theArray = arr.get();
    for (let i in theArray)
    {
        let lon = (theArray[i].lon || theArray[i].longitude);
        let lat = (theArray[i].lat || theArray[i].latitude);

        let vec = getCoord(lat, lon);
        let vecMin = vec3.create();

        vec[0] *= mul.get();
        vec[1] *= mul.get();

        vec3.set(vecMin, -1 * vec[0], -1 * vec[1], 0);
        points.push({ "vec": vec, "vecMin": vecMin });
    }
    console.log("parse json coords...");
};

arr.onValueChange(parse);
centerLat.onValueChange(parse);
centerLon.onValueChange(parse);

exe.onTriggered = function ()
{
    if (!arr.get()) return;

    for (let i = 0; i < points.length; i++)
    {
        indexOut.set(i);
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix, cgl.mvMatrix, points[i].vec);
        trigger.trigger();
        // mat4.translate(cgl.mvMatrix,cgl.mvMatrix, points[i].vecMin);
        cgl.popModelMatrix();
    }
};
