import CGL from "./index";
/**
 * multiply to get radians from degree, e.g. `360 * CGL.DEG2RAD`
 * @constant {Number}
 * @description
 */
export const DEG2RAD = Math.PI / 180.0;

/**
 * @constant {number}
 * @description to get degrees from radians, e.g. `3.14 * CGL.RAD2DEG`
 */
export const RAD2DEG = 180.0 / Math.PI;

export const onLoadingAssetsFinished = null; // deprecated / remove later

/**
 * get normalized mouse wheel delta (including browser specific adjustment)
 * @function getWheelDelta
 * @static
 * @external CGL
 * @param {MouseEvent} event
 * @return {Number} normalized delta
 */
export const isWindows = window.navigator.userAgent.indexOf("Windows") != -1;
const getWheelDelta_ = function (event)
{
    var normalized;
    if (event.wheelDelta)
    {
        // chrome
        normalized = (event.wheelDelta % 120) - 0 == -0 ? event.wheelDelta / 120 : event.wheelDelta / 30;
        normalized *= -1.5;
        if (CGL.isWindows) normalized *= 2;
    }
    else
    {
        // firefox
        var d = event.deltaY;
        if (event.shiftKey) d = event.deltaX;
        var rawAmmount = d || event.detail;
        normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
        normalized *= -3;
    }

    if (normalized > 20) normalized = 20;
    if (normalized < -20) normalized = -20;

    return normalized;
};

export const getWheelSpeed = getWheelDelta_;
export const getWheelDelta = getWheelDelta_;
