var d3ui = d3ui || {};
var appIcon = {};
/* Event Handlers */
// Drag and Drop Handlers
var dragSrcEl;
var newId = 0;

// Move the dragged item only if it is a list item
function handleDrop(d,i){
   d3.event.stopPropagation();
   if (this != dragSrcEl && dragSrcEl.tagName.toLowerCase() == "li")
      this.parentNode.insertBefore(dragSrcEl, this);

}

function handleDragStart (d,i) {
   dragSrcEl = d3.event.target;
    
   d3.event.dataTransfer.effectAllowed = 'move';
   d3.event.dataTransfer.setData('text/html', d3.event.target);
   d3.event.fromElement = d3.event.target;
}
  
function handleDragOver (d,i) {
   d3.event.preventDefault();
   d3.event.stopPropagation();
   d3.event.dataTransfer.dropEffect = 'move';
  
   return false;
}
  
function handleDragEnter (d,i) {
    // this / e.target is the current hover target.
   d3.event.stopPropagation();
   if (this != dragSrcEl)
      d3.select(this).classed("over",true);
}
  
function handleDragLeave (d,i) {
   d3.event.stopPropagation();
   d3.select(this).classed("over",false);
}

function handleDragEnd (d,i) {
   d3.event.stopPropagation();
   d3.selectAll("li.over").classed("over",false);
}

function handleToggleClick(d){
    //console.log("toggle");
    d3.event.stopPropagation();
    var node = d3.select(this)
    node.classed("collapsed",!node.classed("collapsed"));
} 

// Click event handler for toolbar buttons
function handleClick(d) 
{
    d3.event.stopPropagation();
    switch (d3.event.target.id) 
    {
       case "add": handleAdd(d); break;    
       case "delete": handleDelete(d); break;
       case "search": handleSearch(d); break;
    }
}
// Show hide the searchbar
function handleSearch(d){
    searchbar = d3.select(d.rootId)
                  .select(".search");
    
    if (searchbar.style("display") == "none"){
        searchbar.style("display","block");
    }
    else {
        searchbar.style("display","none");
        clearFilter(d.rootId);
    }
    
}

// Add a new row to the list
function handleAdd(d){
    var config = d3.select(d.rootId).datum();
    
    cancelDelete(d.rootId);
    
    if (config.hasOwnProperty("template")){
        var rowData = Object.assign({}, config.template);
        rowData.id = "N-"+newId; //guid()
        //console.log(rowData);
        
        var item = d3.select(d.rootId).select("ul")
                    .append("li")
                    .attr("id",rowData.id)
                    .data([rowData])
                    .each(function (d,i) { addItems(d,this);});
        enableEvents(d.rootId);
        newId++;
    }
}

// Cancel the delete selection. Selections are retained.
function cancelDelete(root)
{
    var iconData = d3.select(root)
                    .select(".toolbar")
                    .select("#delete")
                    .datum();
    //console.log(iconData);
    //var iconData = delIcon
    if (iconData.hasOwnProperty("showCheckboxes"))
       if (iconData.showCheckboxes)
       {
           iconData.showCheckboxes = !iconData.showCheckboxes;
           d3.selectAll(root+" li #open")
             .style("display", "block");
           d3.selectAll(root+" li #checkbox")
             .style("display", "none");
       }
}
// Show selection checkboxes and delete selected items
function handleDelete(d){
   if (!d.hasOwnProperty("showCheckboxes"))
       d.showCheckboxes = true;
   else 
       d.showCheckboxes = !d.showCheckboxes;
    
    if (!d.showCheckboxes)
       d3.selectAll(d.rootId+" li")
         .each(function(rowData) { 
                   
                   if (rowData.hasOwnProperty("checked"))
                   {    console.log(this);
                       console.log(rowData);
                       if (rowData.checked == "true")
                          d3.select(this)
                            .remove();
                   }
               });
         
    d3.selectAll(d.rootId+" li #open")
      .style("display", d.showCheckboxes ? "none":"block");
    d3.selectAll(d.rootId+" li #checkbox")
      .style("display", d.showCheckboxes ? "block":"none");
}

// handle backspace and delete keys pressed in searchbar
function handleTextDeleted(d)
{
   if (d3.event.keyCode === 8 || d3.event.keyCode == 46  ){
      clearFilter(findRootElement(d3.event.target));
   }
}
// apply the lie filter on change of input text
function handleTextChanged(d)
{
    //console.log(d);
    var root = findRootElement(d3.event.target);
    //console.log(root);
    d3.selectAll(root+" > ul > li")
      .each(function (data){  applyFilter(data,
                                         this,
                                         d3.event.target.value.toLowerCase());
                           });
}
// click event of the icons on each row
function handleAction(d)
{
    d3.event.stopPropagation();
    //console.log(d3.event.target);
    var node = d3.select(d3.event.target);
    var prnt = getParentOfTag(d3.event.target,"LI");
    var opt  = d3.select(findRootElement(d3.event.target)).datum();

    var nodeChecked = d.checked;
    //console.log(node.attr("id"));
    //console.log(nodeChecked);
    //console.log(prnt.datum().checked);
    if (node.attr("id") == "checkbox")
    {
        //console.log(opt.dataMap.data);
        if (d.hasOwnProperty(opt.dataMap.data))
            prnt.select("ul")
                .selectAll("#checkbox")
                .each(function (data) { 
                                        //console.log(data);
                                        //console.log(this);
                                        data.checked = nodeChecked;
                                        d3.select(this)
                                          .select("g")
                                          .attr("fill-opacity",(data.checked == "true")? 1:0)
                                          .attr("stroke-opacity",(data.checked == "true")? 1:0);
                                      });
    }
    
    //console.log("action event");
    //console.log(d);
    
    //if (this.id == "checkbox")
}

function findRootElement(element)
{
   //console.log(element);
   var node = d3.select(element);
   var x = node.datum();
   
   while (!x.hasOwnProperty("rootId"))
   {
      node = d3.select(node.node().parentNode);
      x = node.datum();
   }
   //console.log(x);
   return x.rootId;
}

function enableEvents(root)
{
    var opt = d3.select(root).datum();
    
    if (opt.behavior.draggable){
       d3.selectAll(root+" li")
         .attr("draggable","true")
         .on("dragstart",handleDragStart)
         .on("dragenter",handleDragEnter)
         .on("dragover",handleDragOver)
         .on("dragleave",handleDragLeave)
         .on("dragend",handleDragEnd)
         .on("drop",handleDrop);
   }
   if (opt.behavior.collapsible){
       d3.selectAll(root+" li")
         .on("click",handleToggleClick);
   }
}
function clearFilter(root) 
{
    d3.selectAll(root)
      .selectAll("li")
      .style("display","block");
}
function applyFilter(d,node,text){
    var level = parseInt(d3.select(node.parentNode).attr("class").substr(1));
    var root = findRootElement(node);
    var opt = d3.select(root).datum();
    
    
    if (d.hasOwnProperty(opt.dataMap.text))
        if (d[opt.dataMap.text].toLowerCase().indexOf(text) == -1)
           if (d.hasOwnProperty(opt.dataMap.data))
            {
               d3.select(node)
                 .selectAll("ul.d"+(level+1)+" > li")
                 .each(function (data) { applyFilter(data,this,text);});
               
               var hidden = true;
               var childNodes = node.childNodes[1].childNodes;
               for (var j = 0; j< childNodes.length && hidden ;j++)
                    hidden = (d3.select(childNodes[j]).style("display") == "none");
                
               if (hidden)
                  d3.select(node).style("display","none");
            }
       else 
          d3.select(node).style("display","none"); 
}


function addItems(item,element)
{
   var node  = d3.select(element);
   //var items = node.datum();
   var level = node.classed("list") ? 0: parseInt(node.node().parentNode.className.substr(1, 1))+1;
   var dataMap = {};
   var opt = node.datum();
   
   //console.log(opt);
   if (opt.hasOwnProperty("dataMap"))
      dataMap = opt.dataMap;
   else {
      opt = d3.select(findRootElement(element)).datum();
      dataMap = opt.dataMap; 
   }
   
   if (!(item instanceof Array))
   {
       //console.log(dataMap);
       var content = node.append("div");
       var nCols = 1;
       // Add the content to be displayed
       switch(dataMap.mode) 
       {
         case "innerHtml":
           content.append("p")
                  .innerHTML(item[dataMap.innerHTML]);
           break;
         case "input":
           content.append("input")
                  .innerHTML(item[dataMap.innerHTML]);
           break;
         default:
           content.text(item[dataMap.text]);
       }
       
       toggle = content.append("svg")
                       .attr("class","lx");
                       
       if (item.hasOwnProperty(dataMap.data))
       {
          toggle.each(function(d){ addIcon(this,"toggle");});
       }
       // Add the icon for the item
       if (item.hasOwnProperty(dataMap.icon))
       {
           //console.log(item[dataMap.icon]);
           if (appIcon.hasOwnProperty(dataMap.icon))
               content.append("svg")
                      .attr("class","l")
                      .each(function (d) { addIcon(this,appIcon(item[dataMap.icon]));});
           else
           {
               //console.log(content);
               content.append("span")
                      .append("img")
                      .attr("src",item[dataMap.icon]);
           }
           nCols++;
       }
       
       // Add the action for the item
       if (item.hasOwnProperty(dataMap.action))
       {
           content.append("svg")
                  .attr("id",function(d){return d[dataMap.action];})
                  .each(function (d) { addIcon(this,d[dataMap.action],handleAction);});
           
           var hasDelete = false;
           for (var i =0 ; i < opt.toolbar.buttons.length && !hasDelete; i++)
               hasDelete = (opt.toolbar.buttons[i].name == "delete")
           
           if (hasDelete)
               content.append("svg")
                      .attr("id","checkbox")
                      .style("display","none")
                      .each(function (d) { addIcon(this,"checkbox",handleAction);});
               
           nCols++;
       }
       if (nCols < 3)
          content.classed("c"+nCols,true);
   }
   // Add child items
   if (item.hasOwnProperty(dataMap.data) || item instanceof Array)
   {
      //console.log(item);
      node.append("ul")
          .classed("d"+level,true)
          .selectAll("li")
          .data((item instanceof Array)? item : item[dataMap.data])
          .enter()
          .append("li")
          .attr("id",function (d) { return d[dataMap.id]; })
          .each(function (d,i) { addItems(d,this); });
   }   
}

d3ui.List = function(wrapper,data) 
{
  //this.init();
  
  var listData = {
     "rootId" : wrapper,  
     "layout":{  
        "hasToolbar":true,
        "hasSearchbar":true
     },
     "dataMap":{  
        "mode":"default",
        "id":"id",
        "text":"text",
        "icon":"type-icon",
        "input":"input",
        "action":"action",
        "innerHtml":"innerHtml",
        "data":"data"
     },
     "behavior":{  
        "draggable":true,
        "droppable":true,
        "collapsible":true,
        "searchAlwaysOn":false
     },
     "toolbar":{  
        "isEmbedded":true,
        "alwaysVisible":true,
        "buttons":[{"name":"search"},{"name":"add"},{"name":"delete"}]
     },
     "styles":["rounded"]
  };
  
  listData.data  = data || [];
  
  this.root = d3.select(wrapper);
  
  if (this.root.empty())
     console.error("Unable to find element to bind list to");
  else 
     this.root
         .classed("list",true)
         .data([listData]);
}

d3ui.list = function(wrapper,data) 
{
   return new d3ui.List(wrapper,data);
}
d3ui.List.prototype.rowTemplate = function(template)
{
   var myData = this.root.datum();
   myData.template = template;
   return this;
}
d3ui.List.prototype.attributeMap = function(mapping)
{
    listData = this.root.datum();
    listData.dataMap = { "id":mapping.hasOwnProperty("id") ? mapping.id:listData.dataMap.id,
                         "mode":mapping.hasOwnProperty("mode") ? mapping.mode:listData.dataMap.mode,
                         "text":mapping.hasOwnProperty("text") ? mapping.text:listData.dataMap.text,
                         "icon":mapping.hasOwnProperty("icon") ? mapping.icon:listData.dataMap.icon,
                         "data":mapping.hasOwnProperty("data") ? mapping.data:listData.dataMap.data,
                         "input":mapping.hasOwnProperty("input") ? mapping.input:listData.dataMap.input,
                         "action":mapping.hasOwnProperty("action") ? mapping.action:listData.dataMap.action,
                         "innerHtml":mapping.hasOwnProperty("innerHtml") ? mapping.innerHtml:listData.dataMap.innerHtml };
    return this;
}
d3ui.List.prototype.behavior = function(opt)
{
    listData = this.root.datum();
    listData.behavior = {"draggable":opt.hasOwnProperty("draggable") ? opt.draggable:listData.behavior.draggable, 
                         "sortable":opt.hasOwnProperty("sortable") ? opt.sortable:listData.behavior.sortable,
                         "collapsible":opt.hasOwnProperty("collapsible") ? opt.collapsible:listData.behavior.collapsible,
                         "allowAdd":opt.hasOwnProperty("allowAdd") ? opt.allowAdd:listData.behavior.allowAdd,
                         "allowRemove":opt.hasOwnProperty("allowRemove") ? opt.allowRemove:listData.behavior.allowRemove,
                         "allowSearch":opt.hasOwnProperty("allowSearch") ? opt.allowSearch:listData.behavior.allowSearch,
                         "searchAlwaysOn":opt.hasOwnProperty("searchAlwaysOn") ? opt.searchAlwaysOn:listData.behavior.searchAlwaysOn};
    return this;
}
d3ui.List.prototype.layout = function(opt)
{
    listData = this.root.datum();
    listData.layout = {"hasToolbar":opt.hasOwnProperty("hasToolbar") ? opt.hasToolbar:listData.layout.hasToolbar, 
                       "hasSearchbar":opt.hasOwnProperty("hasSearchbar") ? opt.hasSearchbar:listData.layout.hasSearchbar};
    return this;
}

d3ui.List.prototype.setTitle = function(title)
{
   this.title = title;
   return this;
}
d3ui.List.prototype.show = function()
{
   var toolBar;
   var opt = this.root.datum();
   //console.log(opt);
   
   for (var i in opt.toolbar.buttons)
       opt.toolbar.buttons[i].rootId = opt.rootId;
   
   //Add title
   if (this.title.length > 0)
       toolBar = this.root.append("h1")
                          .text(this.title)
                          .classed("always-on-top",function (d) { return d.toolbar.alwaysVisible && d.toolbar.isEmbedded;});
                          
   //console.log(toolBar);
   if (!opt.toolbar.isEmbedded)
       toolBar = this.root;
   
   //console.log(toolBar);
   
    if (opt.layout.hasToolbar)
    {
       toolBar.append("div")
              .attr("class","toolbar")
              .classed("always-on-top",function (d) { return d.toolbar.alwaysVisible && !d.toolbar.isEmbedded; })
              .selectAll("svg")
              .data(opt.toolbar.buttons.reverse())
              .enter()
              .append("svg")
              .attr("id",function(d) { return d.name;})
              .on("click",handleClick)//window[function(d) { return "handle"+d[0].toUpperCase() + d.slice(1);}])
              .each(function(d) { x = new IconMaker(this,d.name);});
       //console.log(toolBar.selectAll("svg"));
    }      
    if (opt.layout.hasSearchbar || opt.behavior.allowSearch || opt.toolbar.buttons.indexOf("search") > 0)
        this.root.append("div")
                 .attr("class","search")
                 .style("display",function(d) { return d.behavior.searchAlwaysOn ? "block":"none";})
                 .append("input")
                 .attr("id","spotlight")
                 .attr("maxlength",500)
                 .attr("type","text")
                 .on("keydown",handleTextDeleted)
                 .on("keyup"  ,handleTextChanged);
    
    addItems(opt.data,opt.rootId);
    //console.log(toolBar.selectAll("svg"));
    enableEvents(this.root.datum().rootId);
    return this;
}
d3ui.List.prototype.button = function(name,shape,handle)
{
    var toolbar = this.root.datum().toolbar;
    
    if (["search","add","delete"].indexOf(name) == -1)
        toolbar.push({"name":name})
    else
        toolbar.push({"name":name,"shape":shape,"handle":handle})
}



