# LABLR.JS

## NOTE

This branch has diverged from `develop` in an important way.

This branch was created as a POC for POSTing labels to `lablr-api`


## Old Readme

Currently this is a POC only.

Lablr.js is the client-side script used to discover labellable elements on a web page, assemble them into an array, and POST them to an endpoint for processing.

In its current form, it creates an array of objects. Each object contains the following information:

* `tagName`: The HTML tag of the element
* `category`: A token value describing the type of element being listed. Current values are one of:
  * 'elsWithAlt'
  * 'elseWithReferencedAria'
  * 'elsWithAriaLabels'
  * 'elsWithLangAttr'
  * 'links'
  * 'acronyms'
  * 'areas'
  * 'formFields'
  * 'buttons'
  * 'fieldsets'
  * 'frames'
  * 'images'
  * 'legends'
  * 'navs'
  * 'optgroups'
  * 'tables'
  * 'titles'
* `location`: { x, y, width, height },
* `xpath`: The full xPath location of where the element is on screen
* `outerHtml`: The full HTML for the element and any of its children (currently truncated to 255 characters to reduce payload size)
* `textContent`: The text content within the image and any of its children
* `accessibleName`: The calculated accessible name for the element

