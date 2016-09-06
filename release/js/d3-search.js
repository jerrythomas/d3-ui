var d3ui = d3ui || {};

d3ui.SearchBar = function(wrapper,data,config) 
{
  //this.init();
  _self = this;
  var listData = {
     "rootId" : wrapper,
     "layout" : "large",
     "useIconMap" : false,
     "styles":["rounded"],
     "fields":["h1","h2","h3","iconName"],
     "map":{ "id":"id","h1":"h1","h2":"h2","h3":"h3","icon":"icon","iconName":"iconName"},
     "icons":{}
  };
  config = config || {};
     
  listData.data  = data || [];
  
  this.root = d3.select(wrapper);
  
  if (this.root.empty())
     console.error("Unable to find element to bind list to");
  else 
     this.root
         .classed("ui-searchbar",true)
         .data([listData]);
}

d3ui.searchbar = function(wrapper,data,config) 
{
   return new d3ui.SearchBar(wrapper,data,config);
}

d3ui.SearchBar.prototype.show = function(handle){
   var config = this.root.datum();
   
   function applyFilter(root,search){
      var config = d3.select(root).datum();
      var words = search.toLowerCase().split(" ");
      
      d3.select(root)
        .selectAll("li")
        .each(function (x){
                 //console.log(x);
                 //console.log(config.map);
                 //console.log(config.fields);
                 var combined = "";
                 for (var i in config.fields){
                    //fieldName = config.map[config.fields[i]];
                    combined = combined + " " + x[config.map[config.fields[i]]].toLowerCase();
                 }
                 //console.log(words);
                 //console.log(combined);
                 
                 var wordfound = true
                 for (var i=0;i< words.length && wordfound;i++)
                     wordfound = (wordfound && (combined.indexOf(words[i]) > -1));
                 //console.log(combined.indexOf(words[0]));
                 d3.select(this)
                   .style("display",(wordfound) ? "block":"none");    
             });
          
   }
   function clearFilter(root){
      d3.select(root)
        .select("ul")
        .style("display","block")
        .selectAll("li")
        .classed("ui-selected",false)
        .style("display","block");
   }
   function selectNext(root,forward){
      var nxt;
      var sel = d3.select(root+ " li.ui-selected");
      var foundNext = false;

      if (sel.empty())
      {
         //console.log(d3.select(root + " li").datum());
         sel = d3.select(root + " li");
         foundNext = (sel.style("display") == "block");
      }    
      //console.log(sel.datum());
         
      nxt = d3.select(sel.node());
      while (!foundNext)
      {
            nxt = d3.select((forward) ? nxt.node().nextSibling : nxt.node().previousSibling);          
            if (nxt.empty()) return;
            
            foundNext = (nxt.style("display") == "block");
         }
         sel.classed("ui-selected",false);   
         nxt.classed("ui-selected",true); 
         nxt.node().scrollIntoView(false);
   }
   function handleKeyDown(x){
      var prv;
      
      switch (d3.event.keyCode)
      { 
         //case 27:
         case 9:
            handleFocusOut(x);
            break;
         case 8: //backspace
         case 46: //delete 
            clearFilter(x.rootId);
            applyFilter(x.rootId,d3.event.target.value);
            break;
         case 13: //enter
            var prv = d3.select(x.rootId +" li.ui-selected");
            
            if (!prv.empty()){
               
               var attrMap  = d3.select(x.rootId).datum().map;
               var selData = prv.datum();

               d3.event.target.value = selData[attrMap.h1];
               var clickEvent = new MouseEvent("click",{
                                                         "view": window,
                                                         "bubbles": true,
                                                         "cancelable": false
                                                       });
               prv.node().dispatchEvent(clickEvent);
            }
            break;
         case 38: //up arrow
            selectNext(x.rootId,false);
            break;
         case 40: // down arrow
            selectNext(x.rootId,true);
            break;   
      }
   }
   function handleKeyUp(x){
      //console.log("key up");
      applyFilter(x.rootId,d3.event.target.value)
   }
   function handleFocusOut(x){
      console.log("focus out");
      console.log(this);
      d3.select(x.rootId)
        .select("ul")
        .style("visibility","hidden");
   }
   function handleFocus(x){
     d3.select(x.rootId)
       .select("ul")
       .style("visibility","visible");
   }
   var searchbox = this.root.append("input")
                            .attr("placeholder","Search")
                            .attr("type","search")
                            .on("focus",handleFocus)
                            .on("keydown",handleKeyDown)
                            .on("keyup"  ,handleKeyUp)
                            /*.on("focusout",handleFocusOut)*/; //focus out causes problems with click
   //searchbox.data("rootId",config.rootId);
   
   this.root.append("ul")
            .classed("d0",true)
            .style("visibility","hidden")
            .selectAll("li")
            .data(config.data)
            .enter()
            .append("li")
            .each(function (x) {
                     //console.log(config.map.iconName);
                     x.iconURL = (config.useIconMap)? config.icons[x[config.map.icon]]:x[config.map.icon];
                     d3.select(this)
                       .append("img")
                       .attr("src",x.iconURL)
                       .attr("title",x[config.map.iconName]);
                     content = d3.select(this)
                       .append("div")
                       .attr("id",x[config.map.id]);
                   
                     if (x.hasOwnProperty(config.map.h1))
                        content.append("h1")
                               .text(x[config.map.h1]);
                     if (x.hasOwnProperty(config.map.h2))
                        content.append("h2")
                               .text(x[config.map.h2]);
                     if (x.hasOwnProperty(config.map.h3))
                        content.append("h3")
                               .text(x[config.map.h3]);
                  })
            .on("click",function (d) { 
                            d3.select(this.parentNode).style("visibility","hidden");
                            handle(d);
                        });
   return this;                
}
d3ui.SearchBar.prototype.searchFields = function(mapping)
{
    var config = this.root.datum();
    config.fields.merge(mapping);
    return this;
}
d3ui.SearchBar.prototype.attributeMap = function(mapping)
{
    var config = this.root.datum();
    Object.assign(config.map,mapping);
    return this;
}
d3ui.SearchBar.prototype.icons = function(data)
{
    var config = this.root.datum();
    config.useIconMap = true;
    Object.assign(config.icons,data);
    return this;
}