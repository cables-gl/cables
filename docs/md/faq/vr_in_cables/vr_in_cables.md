# Guide to VR in cables

This guide will help you get started with using a virtual reality headset inside of cables. Please be aware this is very experimental software.

VR in the web browser is currently only working with **firefox on desktop and laptops**.
On mobile it will work with **IOS** and **android**.

Currently tested headsets are the Oculus rift and the Vive.
To test on mobile make sure to go to your view patch screen and then click **open in new window**. If you now press the VR icon your patch can be tested in fullscreen with two rendered views.

On desktop and laptops make sure that your **VR software isn't running** before you start the example patch.
It's a good idea to make sure that VR auto start is disabled when you put on the headset. This is to make sure that when firefox wants to connect that there's nothing else running which could interfere with the process.

This [example patch](https://cables.gl/edit/5ccfff889a58d86f8b65882c) will show a simple interactive environment that can be used to test your VR setup.
Be aware that using an op like WASDcamera can override the head tracking and stop it working.

If the VR headset is correctly connected and you start the patch then a pop up will appear requesting permission to allow firefox to access the VR headset.
If the pop up doesn't appear then close firefox and check that the VR headset is working in some other software.

The [MainloopWebVr](https://cables.gl/op/Ops.Gl.Vr.MainloopWebVr) op can function as a normal mainloop op or as a VR mainloop op.
VR Mainloop will render twice, once for each eye.

To start VR a **user interaction is always required**.
Click the VR headset icon in the top right corner to start. It may take a few seconds for it to connect.
You should now be able to look around the scene.
The [raycasting ops](https://cables.gl/op/Ops.Physics.CastRay) allow you to interact with objects by looking at them.

####Tips and troubleshooting:

- Resolution. For slow devices it's a good idea to use the **scale resolution** option. Setting it to 0.5 will render half of the reported resolution.
- Disabling **resize canvas** on desktop is recommended. Most of the time 1920 x 1080 is more than enough and has to be rendered once for each eye. Using the resolution of a widescreen monitor will cause most headsets to render incorrectly.
- Mobile VR uses a [WebVR polyfill](https://github.com/immersive-web/webvr-polyfill) to simulate a VR headset. This means that patches can be made to work with low end units like the google cardboard.
- You may need to enable certain permissions like the **accelerometer** and **device orientation** on a mobile device to allow the VR polyfill to work.
