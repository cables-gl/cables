const volume = op.inFloatSlider("Volume", 1);

volume.onChange = update;
update();

function update()
{
    op.patch.setVolume(volume.get());
}
