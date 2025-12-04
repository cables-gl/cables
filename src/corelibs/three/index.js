import * as THREE from "three";
import { ThreeRenderer } from "./threerenderer.js";
import { ThreeOp } from "./threeop.js";

window.THREE = { ...window.THREE, ...THREE };

CABLES.ThreeOp = ThreeOp;
CABLES.ThreeRenderer = ThreeRenderer;
