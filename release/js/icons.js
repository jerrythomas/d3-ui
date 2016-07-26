/*!
 * IconMaker - Copyright (c) 2016 Jerry Thomas - http://jerrythomas.name/
 * licensed under MIT license
 */
function d2r(degs) {
  return degs * (Math.PI / 180);
}
function pct2r(percent) {
  return 2*Math.PI*Math.max(0,Math.min(percent/100,1))
}

function getRadialPosition(value, maxValue, radius, origin) {
  let degrees = (value / maxValue) * 360;

  let theta = degrees * (Math.PI / 180);

  let pos = {
    x: origin.x + (Math.sin(theta) * radius),
    y: origin.y - (Math.cos(theta) * radius),
    sin: Math.sin(theta),
    cos: Math.cos(theta),
    angle: degrees
  };
  
  lastPos = pos;

  return pos;
}

// Fetch a parent matching specific tag. Used to find the svg node.
function getParentOfTag(element,tagName)
{
    var tag = d3.select(element);
    while (tag.node().tagName != tagName && tag.node().tagName != "BODY")
    {
       tag = d3.select(tag.node().parentNode);
    }
    if (tag.node().tagName == tagName)
       return tag;
    else 
       return null;
}

// Create the icon.
var IconMaker = function (element,name,handle,shapes)
{
    this.wrapper  = d3.select(element);
    if (this.wrapper.empty()){
        console.log("Unable to find element ["+name+"]");
        return;
    }
    else if (this.wrapper.node().tagName != "svg")
    {
        var svg = this.wrapper.select("svg");
        if (svg.empty())
            svg = this.wrapper.append("svg");
        this.wrapper  = svg;
    }
    this.name     = name;
    this.shapes   = shapes || [];

    function onCheckboxClick(data)
    {
        d3.event.stopPropagation();
        var svg = getParentOfTag(d3.event.target,"svg");
        console.log("before"+data.checked);
        data.checked = !(data.checked) ; //? false:true;
        console.log("after"+data.checked);
        svg.select("g")
           .attr("fill-opacity",(data.checked)? 1:0)
           .attr("stroke-opacity",(data.checked)? 1:0);
        
        var event = new CustomEvent("change", { "detail": "Checkbox state changed." });
        svg.node().dispatchEvent(event); 
    }
    
    this.init();
    this.update();
    
    if (name == "checkbox")
       this.wrapper.on("click",onCheckboxClick);
   
    if (typeof handle === "function") 
    {
        console.log(name);
        console.log(this.wrapper);
        if (name == "checkbox")
           this.wrapper.on("change",handle);
        else 
           this.wrapper.on("click",handle); 
    }

}
IconMaker.prototype.init = function()
{
    this.orange = "#FF9900";
    this.green  = "#2ECC40"; 
    this.red    = "#EC7063"; 
    this.yellow = "#EEDB00"; 
    
    var width  = parseInt(this.wrapper.style('width'),10);
    var height = parseInt(this.wrapper.style('height'),10);
    
    this.yScale = d3.scaleLinear() //d3.scaleLinear() in v4 
                    .domain([0,100])
                    .range([Math.max(0,(height-width)/2), Math.min(height,(height + width)/2)])  
    this.xScale = d3.scaleLinear() //d3.scaleLinear() in v4
                    .domain([0,100])
                    .range([Math.max(0,(width-height)/2), Math.min(width,(height + width)/2)])  
    this.scale =  (width < height) ? this.xScale:this.yScale;
    //console.log(this.scale);
}

IconMaker.prototype.update = function()
{
    d3.selectAll(this.wrapper.node().childNodes).remove();
    if (this.shapes.length > 0)
       this.add(this.shapes);
    else 
       this.add(this.iconData(this.name));
   
   if (this.name == "checkbox"){
       var data = this.wrapper.data();
       if (data instanceof Array)
           data = data[0];
       
       this.wrapper.select("g")
           .attr("fill-opacity",(data.checked)? 1:0)
           .attr("stroke-opacity",(data.checked)? 1:0);
   }
   
}
IconMaker.prototype.hide = function()
{
    this.wrapper.style("display","none");
}
IconMaker.prototype.show = function()
{
    this.wrapper.style("display","block");
}

// adds shapes to the icon
IconMaker.prototype.add = function(d, node)
{
    var shape;
    //console.log(d);
    node = node || this.wrapper;
    
    if (d instanceof Array)
    {
        for (var i=0;i < d.length;i++){
            this.add(d[i],node)
        }
    } 
    else
    { 
        switch (d.shape) 
        {
            
         case "line":
           shape = node.append(d.shape)
                       .attr("pointer-events", "none")
                       .attr("x1",this.xScale(d.x1))
                       .attr("y1",this.yScale(d.y1))
                       .attr("x2",this.xScale(d.x2))
                       .attr("y2",this.yScale(d.y2))
                       .attr("stroke",d.stroke);
           break;
        case "circle":
           shape = node.append(d.shape)
                .attr("pointer-events", "none")
                .attr("cx",this.xScale(d.cx))
                .attr("cy",this.yScale(d.cy))
                .attr("r",this.scale(d.r))
                .attr("fill",d.fill);
           break;
        case "arc"
                   var arc = d3.arc() //d3.arc() in v4 
                       .innerRadius(d.innerRadius)  
                       .outerRadius(this.scale(d.outerRadius))
                       .startAngle(pct2r(d.startAngle)) 
                       .endAngle(pct2r(d.endAngle)); 
           node.append("path")
               .attr("pointer-events", "none")
               .attr("d", arc)
               .attr("fill", d.fill)
               .attr("transform", "translate("+this.xScale(d.cx)+","+this.yScale(d.cy)+")");
           break;
        case "rect":
           shape = node.append(d.shape)
                .attr("pointer-events", "none")
                .attr("x",this.xScale(d.x))
                .attr("y",this.yScale(d.y))
                .attr("width",this.xScale(d.width))
                .attr("height",this.xScale(d.height))
                .attr("fill",d.fill);
           break;
        case "g":
           shape = node.append(d.shape)
                       .attr("pointer-events", "none")/*
                       .attr("class",this.xScale(d.x))*/;
           break;
        case "path":
           var res = d.d.split(" ");
           for (var i = 0;i < res.length;i+=3)
           {
               res[i+1] = this.xScale(parseInt(res[i+1]));
               res[i+2] = this.yScale(parseInt(res[i+2]));
           }
           d.d = res.join(" ");
           shape = node.append(d.shape)
                       .attr("pointer-events", "none")
                       .attr("d",d.d);
           break;
        }
        
        if (d.hasOwnProperty("stroke"))
            shape.attr("stroke",d.stroke);
        if (d.hasOwnProperty("stroke-linecap"))
            shape.attr("stroke-linecap",d["stroke-linecap"]);
        if (d.hasOwnProperty("stroke-width"))
            shape.attr("stroke-width",this.scale(d["stroke-width"]));
        if (d.hasOwnProperty("stroke-dasharray"))
            shape.attr("stroke-dasharray",d["stroke-dasharray"]);
        if (d.hasOwnProperty("id"))
            shape.attr("id",d.id);
        if (d.hasOwnProperty("class"))
            shape.attr("class",d.class);
        if (d.hasOwnProperty("clip-path"))
            shape.attr("clip-path",d["clip-path"]);
        if (d.hasOwnProperty("opacity"))
            shape.attr("opacity",d.opacity);
        
        if (d.hasOwnProperty("shapes")){
            for (var i=0;i < d.shapes.length;i++){
                this.add(d.shapes[i],shape)
            }
        }
    }
}

// Provides data for the built in icons
IconMaker.prototype.iconData = function(name)
{
    var data = [];
    switch (name) 
    {
      case "open":
        data = [{"shape":"line","x1":45,"y1":36, "x2":60,"y2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#999","class":"action"},
                {"shape":"line","x1":45,"y1":64, "x2":60,"y2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#999","class":"action"}];
        break;
      case "left":
        data = [{"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"},
                {"shape":"line","x1":55,"y1":36, "x2":40,"y2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#666","class":"action"},
                {"shape":"line","x1":55,"y1":64, "x2":40,"y2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#666","class":"action"}];
        break;
      case "right":
        data = [{"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"},
                {"shape":"line","x1":45,"y1":36, "x2":60,"y2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#666","class":"action"},
                {"shape":"line","x1":45,"y1":64, "x2":60,"y2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#666","class":"action"}];
        break;
      case "add":
        data = [{"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"},
                {"shape":"circle","cx":50,"cy":50,"r":27,"fill":"#666","class":"action"},
                {"shape":"line","x1": 37,"x2":63,"y1":50,"y2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#fff","class":"action"},
                {"shape":"line","y1": 37,"y2":63,"x1":50,"x2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#fff","class":"action"}];
        break;
      case "delete":
        data = [{"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"},
                {"shape":"circle","cx":50,"cy":50,"r":27,"class":"red","fill":this.red},
                {"shape":"line","x1": 37,"x2":63,"y1":50,"y2":50,"stroke-width":8,"stroke-linecap":"round","stroke":"#fff","class":"action"}];
        
        break;
      case "checkbox":
        data = [{"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"},
                {"shape":"g","class":"checked","shapes":[
                                 {"shape":"circle","cx":50,"cy":50,"r":27,"class":"checked","fill":this.orange},
                                 {"shape":"line","x1": 36,"y1":55,"x2":46 ,"y2":64,"stroke-width":6,"stroke-linecap":"round","stroke":"#fff"},
                                 {"shape":"line","x1": 46,"y1":64,"x2":63 ,"y2":42,"stroke-width":6,"stroke-linecap":"round","stroke":"#fff"}]}];
        break;
      case "success":
        data = [{"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"},
                {"shape":"circle","cx":50,"cy":50,"r":27,"class":"checked","fill":this.green},
                {"shape":"line","x1": 36,"y1":55,"x2":46 ,"y2":64,"stroke-width":6,"stroke-linecap":"round","stroke":"#fff"},
                {"shape":"line","x1": 46,"y1":64,"x2":63 ,"y2":42,"stroke-width":6,"stroke-linecap":"round","stroke":"#fff"}];
        break;
      
      case "failure":
        data = [{"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"},
                {"shape":"circle","cx":50,"cy":50,"r":27,"class":"action","fill":this.red},
                {"shape":"line","x1": 40,"y1":40,"x2":60 ,"y2":60,"stroke-width":8,"stroke-linecap":"round","stroke":"#fff"},
                {"shape":"line","x1": 40,"y1":60,"x2":60 ,"y2":40,"stroke-width":8,"stroke-linecap":"round","stroke":"#fff"}]; 
        break;
      case "warning":
        data = [{"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"},
                {"shape":"circle","cx":50,"cy":50,"r":27,"class":"action","fill":this.yellow},
                {"shape":"line","x1": 50,"y1":35,"x2":50 ,"y2":55,"stroke-width":8,"stroke-linecap":"round","stroke":"#666"},
                {"shape":"line","x1": 50,"y1":65,"x2":50 ,"y2":65,"stroke-width":8,"stroke-linecap":"round","stroke":"#666"}]; 
        break;
      case "search":
        data = [{"shape":"circle","cx":40,"cy":40,"r":22,"fill":"#AED6F1","stroke":"#666","stroke-width":4},
                {"shape":"circle","cx":40,"cy":40,"r":16,"fill":"#fff","opacity":.7,"class":"gradient"},
                {"shape":"circle","cx":42,"cy":42,"r":16,"fill":"#AED6F1"},
                {"shape":"line","x1": 58,"y1":58,"x2":80 ,"y2":80,"stroke-width":6,"stroke-linecap":"round","stroke":"#666"},
                {"shape":"line","x1": 68,"y1":68,"x2":80 ,"y2":80,"stroke-width":12,"stroke-linecap":"round","stroke":"#666"}]; 
        break;
      case "progress":
        var shapeData = this.wrapper.data();
        if (shapeData instanceof Array)
            shapeData = shapeData[0];
        //console.log(this.wrapper);
        //console.log(shapeData);
        var percentComplete = 0;
        var percentSuccess  = (shapeData.hasOwnProperty("success-pct"))? shapeData["success-pct"]: 0;
        var percentFailure  = (shapeData.hasOwnProperty("failure-pct"))? shapeData["failure-pct"]: 0;
        var percentWarning  = (shapeData.hasOwnProperty("warning-pct"))? shapeData["warning-pct"]: 0;
        
        percentComplete = percentSuccess + percentFailure + percentWarning;
        
        if (percentComplete == 100)
        {
           if (percentFailure > 0)
              data = this.iconData("failure");
           else if (percentWarning > 0)
              data = this.iconData("warning");   
           else if (percentSuccess > 0)
              data = this.iconData("success");
        }
        else 
        {  
           data.push({"shape":"circle","cx":50,"cy":50,"r":33,"stroke":"#666","stroke-width":4,"fill":"none"});
           if (percentSuccess > 0) 
               data.push({"shape":"arc","cx":50,"cy":50,"innerRadius":0,"outerRadius":27,"fill":this.green ,"startAngle":0,"endAngle":percentSuccess});
           if (percentFailure > 0) 
               data.push({"shape":"arc","cx":50,"cy":50,"innerRadius":0,"outerRadius":27,"fill":this.red   ,"startAngle":percentSuccess,"endAngle":percentSuccess + percentFailure});
           if (percentWarning > 0) 
               data.push({"shape":"arc","cx":50,"cy":50,"innerRadius":0,"outerRadius":27,"fill":this.yellow,"startAngle":percentSuccess + percentFailure,"endAngle":percentSuccess + percentFailure + percentWarning});
           data.push({"shape":"circle","cx":50,"cy":50,"r":27,"fill":"#001f3f","class":"pulse"});
        }
        break;
      default:
        console.log("Don't know how to make " + name + ".");
    }
    return data;
}
