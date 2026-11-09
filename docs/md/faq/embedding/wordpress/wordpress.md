# Howto integrate a patch into Wordpress

You can integrate exported cables patches on a WordPress site with a small shortcode that embeds them in an iframe.
Everything is loaded from your own WordPress installation, nothing is requested from cables.gl.

## Exporting your patch

[Export your patch to HTML](../../../4_export_embed/dev_embed/export_zip/export_zip) and unzip the downloaded file.

### Where to put the patch

Upload the unzipped export into the uploads folder of your WordPress installation, e.g. via SFTP:

```text
wp-content/uploads/cables/my-patch/index.html
wp-content/uploads/cables/my-patch/js/...
wp-content/uploads/cables/my-patch/assets/...
```

- Every patch gets its own folder, the `index.html` of the export has to be directly inside of it.
- Use only lowercase letters, numbers and dashes for the folder name (`my-patch`, not `My Patch`), the folder name is what you use in the shortcode.
- The uploads folder is publicly accessible and is not touched by WordPress-, theme- or plugin-updates.
- Only upload the files of the export, there should never be any `.php` files in these folders.

## Installing the shortcode

Copy the following code to the end of the `functions.php` of your (child-)theme:

```php
function cables_patch_shortcode( $atts ) {
	$folder = 'cables/';

	$atts = shortcode_atts( array(
		'patch' => '',
	), $atts, 'cables' );

	$name = sanitize_title( $atts['patch'] );
	$up   = wp_upload_dir();
	$path = trailingslashit( $up['basedir'] ) . $folder . $name . '/';
	$base = trailingslashit( $up['baseurl'] ) . $folder . $name . '/';
	if ( ! $name || ! file_exists( $path . 'index.html' ) ) {
		return current_user_can( 'manage_options' ) ? '<p>cables: patch "' . esc_html( $name ) . '" not found.</p>' : '';
	}

	if ( ! wp_style_is( 'cables-patch' ) ) {
		wp_register_style( 'cables-patch', false );
		wp_enqueue_style( 'cables-patch' );
		wp_add_inline_style( 'cables-patch', 'iframe:where(.cables-patch){display:block;width:100%;aspect-ratio:16/9;border:0;}' );
	}

	return sprintf(
		'<iframe class="cables-patch" src="%s" allow="fullscreen; autoplay; xr-spatial-tracking; camera; microphone; gyroscope; accelerometer; midi" allowfullscreen loading="lazy"></iframe>',
		esc_url( $base . 'index.html' )
	);
}
add_shortcode( 'cables', 'cables_patch_shortcode' );
```

Use a child theme if you can, changes to the `functions.php` of a regular theme are lost when the theme is updated.

### Usage

Add a "Shortcode"-block in the editor (or just type it into the classic editor or a widget) and enter:

```text
[cables patch="my-patch"]
```

This shows the patch in an iframe, with a width of 100% and an aspect ratio of 16/9 by default.
You can use as many patches on one page as you like.

If you are logged in as an administrator, a message will be shown in place of the patch in case the folder or its `index.html` can not be found.

### Using the shortcode in a theme template

```php
<?php echo do_shortcode( '[cables patch="my-patch"]' ); ?>
```

## Styling

All styling is done in CSS, e.g. in "Appearance > Customize > Additional CSS".

The iframe has the class `cables-patch`, the default size can be overwritten like this:

```css
.cables-patch {
  width: 100%;
  aspect-ratio: 4 / 3;
}
```

## Troubleshooting

- Check if the exported patch works on its own by opening `https://yoursite/wp-content/uploads/cables/my-patch/index.html` in your browser.
- If the iframe shows a "not found" page, check the folder structure of your upload, the `index.html` has to be directly inside the patch folder.
