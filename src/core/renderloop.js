import { Events } from "cables-shared-client";

export class RenderLoop extends Events
{
    paused = true;
    frameNum = 0;

    /**
     * @param {number} _timestamp
     */
    exec(_timestamp) {}
    pause() {}
    resume() {}

}
