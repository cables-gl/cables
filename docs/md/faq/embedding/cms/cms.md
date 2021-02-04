#### How to integrate my cables patch into my CMS (webflow/wix/squarespace/...)?

Most CMSs have an option to integrate JavaScript somehow. If this is the case you
might want to check out [Embedding Patches](../../../4_export_embed/dev_embed/dev_embed).

If you are using Wordpress, this very basic [Wordpress-Plugin]() might work for you. Don't
expect it to work with any other "page construction" plugins, like pagebuilders, though. This
also will not work on wordpress installations that do not allow for integration of custom
plugins, obviously.

If you have control over your wordpress installation, theme or plugin you might be
better of going the more traditional way of [Embedding Patches](../../../4_export_embed/dev_embed/dev_embed) instead.

For anything else try one of the many export options in the editor. For webflow, wix, squarespace
and the likes it might be a good solution to simply use an [Iframe](https://www.w3schools.com/tags/tag_iframe.asp) to integrate your patch.
Please consider uploading your patch to something like [github pages](https://pages.github.com/), [netlify](https://www.netlify.com/) to
save us some server load. There is export options to easily do that for you. 

Or export a ZIP-File  and [put that on your own webserver](../../../4_export_embed/dev_embed_webservers/dev_embed_webservers).
