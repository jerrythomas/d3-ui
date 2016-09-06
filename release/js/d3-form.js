var d3ui = d3ui || {};

d3ui.Card = function(wrapper,config) 
{
   this.root = d3.select(wrapper);

   if (this.root.empty())
      console.error("Unable to find element to bind form to");
   else 
      this.root
          .data(config);
}

d3ui.card = function (wrapper,config) 
{
   return new d3ui.Card(wrapper,config) ;
}
addForm = function (root,data)
{
    var formroot = d3.select(root);
    if (formroot.node().tagName.toLowerCase() != "form")
        formroot = d3.select(root)
                     .append("form")
                     .classed("center",true);
    //console.log(data);
    formroot.data(data);
    formroot.each(function (x) {
                       addInput(this,x,x.items);
                    });
        
}
addInput = function(section,x,row)
{
   var groups = ["fields","buttons"];
   var values = row || x.items; 

   if (x.hasOwnProperty("label"))
       d3.select(section)
         .append("label")
         .attr("for",x.id)
         .text(x.label);

   for (var i in groups){
      if (x.hasOwnProperty(groups[i]))
         d3.select(section)
           .append("div")
           .classed(groups[i],true)
           .selectAll("."+groups[i])
           .data(x[groups[i]])
           .enter()
           .each(function (d) { addInput(this,d,values);});
   }

   if (x.hasOwnProperty("type"))
   {
       var fld;
       switch (x.type) 
       {
         case "tag":
           fld = d3.select(section)
                   .append(x.name);
           
           if (x.hasOwnProperty("innerHTML"))
               fld.html(x.innerHTML);
           if (x.hasOwnProperty("text"))
               fld.text(x.text);

           break;
         case "select":
           fld = d3.select(section)
             .append("select")
             .attr("id",x.id);
           fld.selectAll("option")
             .data(x.options)
             .enter()
             .append("option")
             .attr("id",function (opt){return opt.id;})
             .text(function (opt){return opt.text;})
             .each(function (opt) { if (values[x.id] == opt.id) d3.select(this).attr("selected","selected");});
             //.attr("selected",function (opt){return values[x.id] == opt.id;});
             break;
        case "toolbar":
           fld = d3.select(section)
                        .append("div")
                        .attr("id",x.id)
                        .classed(x.type,true);
            if (x.hasOwnProperty("groups"))
                fld.selectAll(".group")
                    .data(x.groups)
                    .enter()
                    .append("div")
                    .classed("group",true)
                    .selectAll(".btn")
                    .data(function (z){ return z.buttons;})
                    .enter()
                    .append("div")
                    .classed("btn",true)
                    .each(function (z) { addInput(this,z,values);});
           break;
        case "list":
           fld = d3.select(section)
                   .append("div")
                   .attr("id",x.id);
           //console.log(x); 
           
           //var cfg = d3.select(x.rootId).datum();       
           d3ui.list("#"+x.id,values[x.id])
               .setTitle(x.hasOwnProperty("title")? x.title:"")
               .behavior(x.hasOwnProperty("behaviour") ? x.behaviour:{})
               .layout(x.hasOwnProperty("layout") ? x.layout:{})
               .attributeMap(x.hasOwnProperty("attributeMap") ? x.attributeMap:{})
               .buttons(x.hasOwnProperty("toolbar") ? x.toolbar.buttons:{})
               .rowTemplate(x.hasOwnProperty("template") ? x.template:{})
               .show(window[x["handle"]]);
           break;
        case "button":
        case "icon":
           
           if (!x.hasOwnProperty("icon"))
               fld = d3.select(section)
                        .append("svg")
                        .attr("id",x.hasOwnProperty("id")? x.id:"SUBMIT")
                        //.classed(x.hasOwnProperty("class")? x.class:"icon",true)
                        .each(function (d) { addIcon(this,x.name);});
           else
           {
               //console.log(content);
               fld = d3.select(section)
                      .append("img")
                      .attr("id",x.hasOwnProperty("id")? x.id:"SUBMIT")
                      //.classed(x.hasOwnProperty("style")? x.class:"icon",true)
                      .attr("src",x.icon);
           }
           
           break;
        case "textarea":
           fld =  d3.select(section)
                         .append("textarea")
                         .attr("id",x.id)
                         .attr("placeholder",x.hasOwnProperty("placeholder")? x.placeholder:"")
                         .text(x.hasOwnProperty("id") ? values[x.id]:"") ;
           if (x.hasOwnProperty("rows"))
               fld.attr("rows",x.rows);
           /*if (x.hasOwnProperty("maxlength"))
               fld.attr("maxlength",x.maxlength);
           if (x.hasOwnProperty("pattern"))
               fld.attr("pattern",x.pattern);*/
        break;
        default:
          //console.log(x.hasOwnProperty("id") ? values[x.id]:""); 
          fld =  d3.select(section)
                        .append("input")
                        .attr("id",x.id)
                        .attr("placeholder",x.hasOwnProperty("placeholder")? x.placeholder:"")
                        .attr("value",x.hasOwnProperty("id") ? values[x.id]:"") //x.hasOwnProperty("value")? x.value:"")
                        .attr("type",x.type);
          if (x.hasOwnProperty("maxlength"))
              fld.attr("maxlength",x.maxlength);
          if (x.hasOwnProperty("pattern"))
              fld.attr("pattern",x.pattern);
        break;
       }
       if (x.hasOwnProperty("style")){
           for (var i in x.style)
           {
               fld.classed(x.style[i],true);
           }
       }
   }
   //if (x.hasOwnProperty("items"))
   //    for (var i in x.items)
   //        addInput(section,x.items[i],values);
} 
d3ui.Card.prototype.show = function (handle)
{
   var config = this.root.datum();
   if (handle)
      config.handle = handle;
   //console.log("Form Data");
   //console.log(config);
   this.root.selectAll("*").remove();
   addForm(this.root.node(), config);
   return this;
}
d3ui.Card.prototype.setHandler = function (key,handle)
{
    //console.log(this.root.node().id);
    var formEl = d3.select("#"+this.root.node().id + "  " + key);
    var data = formEl.datum();
    data.rootId = this.root.node().id;
    formEl.on("click",handle);
    
    return this;
}

d3ui.Card.prototype.serialize = function () 
{
    var item = this.root;
    var config = item.datum();
    
    if (item.classed("ui-list"))
    {
        item.each(updateParentData);
        return item.data();
    }
    
    //console.log(config);
    if (config.hasOwnProperty("items"))
    {
        for (key in config.items) 
        {
            //console.log("key "+key);
            //console.log("orig value "+config.items[key]);
            item = d3.select("#"+key);
            if (!item.empty())
            {
                switch(item.node().tagName.toLowerCase() )
                {
                    case "select": config.items[key] = item.node().options[item.node().selectedIndex].id;
                         break;
                    case "input": config.items[key] = item.node().value;
                         break;
                    default:
                        if (item.classed("ui-list"))
                        {
                            item.each(updateParentData);
                            config.items[key] = item.datum().data;
                        }
                }
            }
        }
    }
    return config.items; 
}

function serialize(rootId){
   var item = d3.select(rootId);
   var config = item.datum();
   
   if (item.classed("ui-list"))
   {
       item.each(updateParentData);
       return item.data();
   }
   
   //console.log(config);
   if (config.hasOwnProperty("items"))
   {
       for (key in config.items) 
       {
           //console.log("key "+key);
           //console.log("orig value "+config.items[key]);
           item = d3.select("#"+key);
           if (!item.empty())
           {
               switch(item.node().tagName.toLowerCase() )
               {
                   case "select": config.items[key] = item.node().options[item.node().selectedIndex].id;
                        break;
                   case "input": config.items[key] = item.node().value;
                        break;
                   default:
                       if (item.classed("ui-list"))
                       {
                           item.each(updateParentData);
                           config.items[key] = item.datum().data;
                       }
               }
           }
       }
   }
   return config.items;
}