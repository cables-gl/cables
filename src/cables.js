import * as base64 from "./core/0_base64";
import EventTarget from "./core/0_eventtarget";
import * as utils from "./core/0_utils";
import * as anim from "./core/anim";
import Browser from "./core/browser";
import Link from "./core/core_link";
import Port, * as PortUtils from "./core/core_port";
import Op, * as OpUtils from "./core/core_op";
import Profiler from "./core/core_profiler";
import Patch from "./core/core_patch";
import Requirements from "./core/requirements";
import GLGUI from "./core/glpatch";
import Instancing from "./core/instancing";
import WEBAUDIO from "./core/webaudio";
import Timer, * as TimerUtils from "./core/timer";
import * as PatchConnections from "./core/patchConnection";
import Gizmo, * as GizmoUtils from "./core/mod_gizmo";

import CGL from "./cgl";
console.log("CGL", CGL);
window.CGL = CGL;

console.log("window.CGL", window.CGL);
// import EventTarget from "./core/0_eventtarget";
// import utils from "./core/0_utils";
// import anim from "./core/anim";
// import browser from "./core/browser";
// import core_link from "./core/core_link";
// var CABLES = window.CABLES || {};

// require("./core/0_base64")(CABLES);
// require("./core/0_eventtarget")(CABLES);
// require("./core/0_utils")(CABLES);
// require("./core/anim")(CABLES);
// require("./core/browser")(CABLES);
// require("./core/core_link")(CABLES);
// require("./core/core_op")(CABLES);
// require("./core/core_patch")(CABLES);
// require("./core/core_port")(CABLES);
// require("./core/core_profiler")(CABLES);
// require("./core/embedding")(CABLES);
// require("./core/glpatch")(CABLES);
// require("./core/instancing")(CABLES);
// require("./core/loadingstatus")(CABLES);
// require("./core/mod_gizmo")(CABLES);
// require("./core/patchConnection")(CABLES);
// require("./core/requirements")(CABLES);
// require("./core/session")(CABLES);
// require("./core/timer")(CABLES);
// require("./core/webaudio")(CABLES);

export default {
    ...base64,
    Browser,
    // Link,
    EventTarget,
    ...utils,
    ...anim,
    Link,
    ...PortUtils,
    Port,
    ...OpUtils,
    Op,
    Profiler,
    Requirements,
    Patch,
    GLGUI,
    Gizmo,
    ...GizmoUtils,
    Instancing,
    ...TimerUtils,
    Timer,
    ...PatchConnections,
    WEBAUDIO,
};
