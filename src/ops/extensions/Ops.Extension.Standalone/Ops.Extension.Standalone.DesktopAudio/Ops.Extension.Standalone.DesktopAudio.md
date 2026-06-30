# Ops.Extension.Standalone.DesktopAudio

This op captures system audio streams natively in the Cables Electron standalone player using `desktopCapturer` APIs.

## How to Use:
1. Trigger start input.
3. Patch the **Audio Node** output to standard audio visualizers (like `FreqAnalyzer`) or gain controls to hear and visualize the desktop audio!

> [!NOTE]
> On macOS, make sure that **Screen Recording** permissions are enabled in your System Preferences. The **Permission Status** output will display the active permission state.