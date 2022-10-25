import { CGL } from "./cgl"; // * if you remove this, the project wont build CGL properly.. wtf?
import * as base64 from "./base64";
import { EventTarget } from "./eventtarget";
import * as utils from "./utils";
import * as anim from "./anim";
import { Link } from "./core_link";
import { Port } from "./core_port";
import { Op } from "./core_op";
import { EMBED } from "./embedding";
import { Profiler } from "./core_profiler";
import Patch from "./core_patch";
import { Instancing } from "./instancing";
import { LoadingStatus } from "./loadingstatus";
import { WEBAUDIO } from "./webaudio";
import { Variable } from "./sessionvar";
import { Timer, now, internalNow } from "./timer";
import * as PatchConnections from "./patchConnection";
import { CONSTANTS } from "./constants";
import { BranchStack, Branch } from "./banchprofiler";
import { CGP } from "./cgp";
import { CG } from "./cg/cg_constants";

const CABLES = Object.assign(
    {
        "CG": CG,
        "CGP": CGP,
        "EventTarget": EventTarget,
        "EMBED": EMBED,
        "Link": Link,
        "Port": Port,
        "Op": Op,
        "Profiler": Profiler,
        "Patch": Patch,
        "Instancing": Instancing,
        "Timer": Timer,
        "WEBAUDIO": WEBAUDIO,
        "Variable": Variable,
        "LoadingStatus": LoadingStatus,
        "now": now,
        "internalNow": internalNow,
        "BranchStack": BranchStack,
        "Branch": Branch
    },
    base64,
    utils,
    anim,
    CONSTANTS.CG,
    CONSTANTS.ANIM,
    PatchConnections,
    CONSTANTS.PORT,
    CONSTANTS.PACO,
    CONSTANTS.ANIM,
    CONSTANTS.OP,
);

export default CABLES;

if (!(function () { return !this; }())) console.warn("not in strict mode: index core"); // eslint-disable-line
