#### How to integrate my cables patch into my CMS (webflow/wix/squarespace/...)?

Most CMSs have an option to integrate JavaScript somehow. If this is the case you might want to check out [Embedding Patches](../../../4_export_embed/dev_embed/dev_embed).

If you are using WordPress, have a look at [Cables and WordPress](wordpress/wordpress) for a small shortcode that embeds your exported patches in your pages.

For anything else try one of the many export options in the editor. For webflow, wix, squarespace and the likes it might be a good solution to simply use an [Iframe](https://www.w3schools.com/tags/tag_iframe.asp) to integrate your patch.

Please consider uploading your patch to something like [github pages](https://pages.github.com/), [netlify](https://www.netlify.com/) to save us some server load. There is export options to easily do that for you.

Or export a ZIP-File and [put that on your own webserver](../../../4_export_embed/dev_embed_webservers/dev_embed_webservers).
