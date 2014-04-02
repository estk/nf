function showSteps(log){
  "use strict";
  var margin = {top: 20, right: 10, bottom: 20, left: 10};
  var width = 960 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom,
      colors = d3.scale.category20(),
      percentile = width/10;

  var index = 0;
  // Build a log viewer
  var body = d3.select('body');

  var navContainer = body.append('div')
      .attr('class', 'navcontainer');

  var editor = navContainer.append('button')
      .attr('id', 'editor')
      .attr("name", "editor")
      .attr("type", "button")
      .attr("style", "display:block; margin:auto;")
      .text("Editor")
      .on('click', function() {
        body.html("");
        makeEditor();
      });

  var back = navContainer.append('button')
      .attr('id', 'back')
      .attr("name", "back")
      .attr("type", "button")
      .text("<")
      .on('click', function() {showStep(--index);});

  var forward = navContainer.append('button')
      .attr('id', 'forward')
      .attr("name", "forward")
      .attr("type", "button")
      .text(">")
      .on('click', function() {showStep(++index);});


  var svg = body.append('svg')
      .attr('class', 'steps')
      .attr('width', width)
      .attr('height', height);

  // Make defs for links (arrows, etc)
  var defs = svg.append('svg:defs');
  defs.append('svg:marker')
      .attr('id', 'end-arrow-flow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('markerUnits', "userSpaceOnUse")
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

  defs.append('svg:marker')
      .attr('id', 'end-arrow-res')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', -0.5)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('markerUnits', "userSpaceOnUse")
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

  // Make flow and residual graphs. (non-interactive)
  var flowG = svg.append('g')
      .attr('class', 'flow');
  var residualG = svg.append('g')
      .attr('class', 'residual')
      .attr('transform', 'translate(0,'+ (height/2) + ')');
  
  // === initialize flow and residual

  function chargeF (d) {
    // Source and sink should have more charge
    if (d.name === 's' || d.name === 't') {
      return -5000;
    }
    return -4000;
  }

  function forceTick() {
    flowPath.selectAll("path").attr("d", linkArc);
    flowCircle.attr("transform", transform);

    function transform(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }
    function linkArc(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dist = Math.sqrt(dx * dx + dy * dy),
          normX = dx / dist,
          normY = dy / dist,
          sourcePadding = 10,
          targetPadding = 10,
          sourceX = d.source.x + (sourcePadding * normX),
          sourceY = d.source.y + (sourcePadding * normY),
          targetX = d.target.x - (targetPadding * normX),
          targetY = d.target.y - (targetPadding * normY);
      return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    }
  }
  var flowForce = d3.layout.force()
      .nodes([])
      .links([])
      .size([width, height/2])
      .linkDistance(150)
      .gravity(0.1)
      .charge(chargeF)
      .on("tick", forceTick)
      .start();

  var flowPath = flowG.append("g").selectAll("g");
  var flowCircle = flowG.append("g").selectAll("g");

  function resTick() {
    resPath.selectAll("path").attr("d", linkArc);
    resCircle.attr("transform", transform);

    function transform(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }
    function linkArc(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dist = Math.sqrt(dx * dx + dy * dy),
          dr = dist*2,
          normX = dx / dist,
          normY = dy / dist,
          sourcePadding = 10,
          targetPadding = 10,
          sourceX = d.source.x + (sourcePadding * normX),
          sourceY = d.source.y + (sourcePadding * normY),
          targetX = d.target.x - (targetPadding * normX),
          targetY = d.target.y - (targetPadding * normY);
      return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
    }
    // resPath.select('tspan')
    //     .filter(function(d) { return d.source.x > d.target.x })
    //   .attr('rotate', 180)
    //   .attr('style', 'text-anchor: start; dominant-baseline:text-before-edge;');
  }
  
  var resForce = d3.layout.force()
      .nodes([])
      .links([])
      .size([width, height/2])
      .linkDistance(200)
      .gravity(0.1)
      .charge(chargeF)
      .on("tick", resTick)
      .start();
  var resPath = residualG.append("g").selectAll("g");
  var resCircle = residualG.append("g").selectAll("g");


  function showStep(index) {
    var logItem = log[index],
        path = logItem.path,
        flow = new Graph(logItem.flow.vertices, logItem.flow.edges),
        residual = new Residual(flow, logItem.residual);

    back.attr("disabled", function(){ return index <= 0 ? true : null; });
    forward.attr("disabled", function(){ return index >= log.length-1 ? true : null; });

    // Flow
    flowForce.nodes(flow.nodes())
        .links(flow.links());

    // Build svg of flow and residual.
    flowPath = flowPath.data(flow.links(), function(l) { return l.source.id.toString() + l.target.id.toString(); });
    var flowLinkEnter = flowPath.enter().append("g");

    flowLinkEnter
        .attr("class", "link")
    .append("path")
        .attr("class", "link")
        .attr("marker-end", "url(#end-arrow-flow)")
        .attr('id', function(d) {return 'flow' + d.source.id.toString() + '-' + d.target.id.toString();});

    flowLinkEnter.append('text')
      .append('textPath')
        .attr('xlink:href', function (d) {
          return "#flow" + d.source.id.toString() + '-' + d.target.id.toString();
        })
        .attr('startOffset', '50%')
      .append('tspan')
        .attr('dy', -5);

    flowPath
        .classed('sending', function(d) {
          if (! path) {return false}
          var sourceIndex = path.indexOf(d.source.id),
              targetIndex = path.indexOf(d.target.id);
          return sourceIndex >=0 && targetIndex >= 0 && sourceIndex === targetIndex-1;
        })
        .classed('resending', function(d) {
          if (! path) {return false}
          var sourceIndex = path.indexOf(d.source.id),
              targetIndex = path.indexOf(d.target.id);
          return sourceIndex >=0 && targetIndex >= 0 && sourceIndex === targetIndex+1;
        });


    flowPath.select('text')
      .select('tspan')
        .text(function(d) {
          if (d.flow) {return d.flow + " / " + d.capacity;}
          else {return 0 + " / " + d.capacity;}
        });

    flowCircle = flowCircle.data(flow.nodes(), function(n){ return n.id; });
    var flowNodeEnter = flowCircle.enter().append("g")
        .attr('class', 'node');

    flowNodeEnter.append("circle")
        .attr("r", 10)
        .attr("fill", function(d){ return colors(d.id) })
        .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); });

    flowNodeEnter.append("text")
        .attr("x", 8)
        .attr('class', 'name')
        .attr('x', 0)
        .attr('y', 4)
        .text(function(d) { return d.name; });

    flowPath.exit().remove();
    flowCircle.exit().remove();

    // Residual
    resForce.nodes(residual.nodes())
        .links(residual.links());

    // Build svg of flow and residual.
    resPath = resPath.data(residual.links(), function(l) { return l.source.id.toString() + l.target.id.toString(); });
    var resLinkEnter = resPath.enter().append("g");
    
    resLinkEnter
        .attr("class", "link")
      .append("path")
        .attr("class", "link")
        .attr("marker-end", "url(#end-arrow-res)")
        .attr('id', function(d) {return 'res' + d.source.id.toString() + d.target.id.toString();});

    resLinkEnter.append('text')
        .attr("text-anchor", "middle")
      .append('textPath')
        .attr('xlink:href', function (d) {
          return "#res" + d.source.id.toString() + d.target.id.toString();
        })
        .attr('startOffset', '50%')
      .append('tspan');


    resPath
        .classed('sending', function(d) {
          if (! path) return false;
          var sourceIndex = path.indexOf(d.source.id),
              targetIndex = path.indexOf(d.target.id);
          return sourceIndex >=0 && targetIndex >= 0 && sourceIndex === targetIndex+1;
        })
        .classed('resending', function(d) {
          if (! path) return false;
          var sourceIndex = path.indexOf(d.source.id),
              targetIndex = path.indexOf(d.target.id);
          return sourceIndex >=0 && targetIndex >= 0 && sourceIndex === targetIndex-1;
        });

    resPath.select('text')
      .select('tspan')
        .text(function(d) {
          return d.flow || 0;
        });
    

    resCircle = resCircle.data(residual.nodes(), function(n){ return n.id; });
    var resNodeEnter = resCircle.enter().append("g")
        .attr('class', 'node');
        
    resNodeEnter.append("circle")
        .attr("r", 10)
        .attr("fill", function(d){ return colors(d.id) })
        .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); });

    resNodeEnter.append("text")
        .attr('class', 'name')
        .attr('x', 0)
        .attr('y', 4)
        .text(function(d) { return d.name; });

    resPath.exit().remove();
    resCircle.exit().remove();

    resForce.stop();
    flowForce.stop();

  }

  showStep(index);
  resForce.start();
  flowForce.start();
}
