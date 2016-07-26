# d3-ui

d3-ui is a collection of UI elements. This library depends on [d3](https://github.com/d3/d3)

## Installing

If you use NPM, `npm install d3-ui`. Otherwise, download the [latest release](https://github.com/jerrythomas/d3-ui/releases/latest).

## Usage
```
<script src="https://d3js.org/d3.v4.js"></script>
<link href="d3-ui.css" rel="stylesheet" />
<script src="icons.js"></script>
<script src="d3ui.js"></script>
```


## Caution
Code is incomplete and highly unstable.

### Configuration 

* Toolbar: (list of icons and actions,  built in one have actions) Search, add,  delete, Preview, Validate,
* AttributeMap : Allows json to have different fieldnames than the default
* Title
* SearchBar (if toolbar has icons and one of them is search then search bar is automatically included, but is hidden)
* Checkboxes are created but hidden if the toolbar includes delete)
* Data = nested array of data for creating the dynamic list
* Behaviour: collapsible,  draggable,  allow reordering.
* Actions: (checkbox,  delete, open,  progress) Default action is open.
* Size List row height (1x, 2x etc)
* Theme Theme applies to the colors used in the icons. For ex checkboxes in orange v/s silver.
* Options. comes with defaults.

IconLibrary (key value pair consisting of strings mapped to the images) this can be supplied as input for embedding external images into the list.

