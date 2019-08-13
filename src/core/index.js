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
import { Requirements } from "./requirements";
import { GLGUI } from "./glpatch";
import { Instancing } from "./instancing";
import { LoadingStatus } from "./loadingstatus";
import { WEBAUDIO } from "./webaudio";
import { Variable } from "./sessionvar";
import { Timer, now, internalNow } from "./timer";
import * as PatchConnections from "./patchConnection";
import { Gizmo, htmlLine } from "./mod_gizmo";
import { CONSTANTS } from "./constants";

const CABLES = Object.assign(
    {
        EventTarget,
        EMBED,
        Link,
        Port,
        Op,
        Profiler,
        Requirements,
        Patch,
        GLGUI,
        Gizmo,
        htmlLine,
        Instancing,
        Timer,
        WEBAUDIO,
        Variable,
        LoadingStatus,
        now,
        internalNow,
    },
    base64,
    utils,
    anim,
    PatchConnections,
    CONSTANTS.PORT,
    CONSTANTS.PACO,
    CONSTANTS.ANIM,
    CONSTANTS.OP,
);

export default CABLES;
