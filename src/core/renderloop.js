import { Events } from "cables-shared-client";

export class RenderLoop extends Events
{
    paused = false;
    frameNum = 0;

    frameStartTime = 0;

    /**
     * @param {number} _timestamp
     */
    exec(_timestamp) {}
    pause() {}
    resume() {}

}
