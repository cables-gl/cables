# Desktop Texture

Captures the screen or specific windows from the desktop using Electron's `desktopCapturer` API.

## Inputs

- **Render**: Trigger to update the texture.
- **Active**: Boolean to start or stop capturing.
- **Refresh Sources**: Trigger to reload the list of available screens and windows.
- **Sources**: Dropdown to select the source to capture.
- **Generate Texture**: Boolean to enable/disable texture generation.

## Outputs

- **Next**: Trigger for the next op.
- **Texture**: The captured video texture.
- **Ratio**: Aspect ratio of the captured video.
- **Available**: Boolean indicating if the capture is ready.
- **Size Width**: Width of the captured video.
- **Size Height**: Height of the captured video.
- **Error**: Error message if something goes wrong.
- **HTML Element**: The underlying `<video>` element.
- **Available devices**: List of available sources.
- **Active device**: The currently selected source.
- **Texture updated**: Trigger when the texture is updated.

## Notes

- This Op only works within the Electron version of CABLES.
- Use "Refresh Sources" to update the list of windows if new windows are opened or titles change.
