"use strict";

var margin = {top: 20, right: 10, bottom: 20, left: 10};
var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    colors = d3.scale.category20(),
    percentile = width/10;

// TextBox
var textBox = d3.select('body').append('textarea');

// MaxFlow
var maxFlow = d3.select('body').append('div')
    .text("Max Flow: ")
  .append("span");

textBox.on('keydown', function() {
  function setName(n, v) {
    n.name = v;
    restart();
  }
  function setCapacity(e, v) {
    e.capacity = v;
    restart();
  }

  d3.event.stopPropagation();
  if (d3.event.keyCode === 13) {
    d3.event.preventDefault();

    // Empty
    if (this.value === "") {
      alert("No name!");
      return;

    // Nothing selected
    } else if (!selected_node && !selected_link) {
      alert("Please select a link or node to name.");
    }

    // Changing Node Name
    if (selected_node) {
      if (this.value.length > 2) {
        alert("Need Length <= 2");
      }
      else {
        setName(selected_node, this.value);
      }

    // Changing Edge Capacity
    } else if (selected_link) {
      var newCap = parseInt(this.value, null);
      if (isNaN(newCap)) {
        alert("Please enter a number");
      }
      else {
        setCapacity(selected_link, newCap);
      }
    }
    // Clear textbox
    this.value = "";
  }
});

// Svg
var svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// set up initial nodes and links
//  - Source has id === 0, Sink id === 1.
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
var nodes = [
    {id: 0, name: 's', reflexive: false, fixed: true, x: (percentile), y: height/2},
    {id: 1, name: 't', reflexive: false, fixed: true, x: (width-percentile), y: height/2},
    {id: 2, name: 'a', reflexive: false, },
    {id: 3, name: 'b', reflexive: false, },
    {id: 4, name: 'c', reflexive: false, },
    {id: 5, name: 'd', reflexive: false, }
  ],
  lastNodeId = nodes.length-1,
  links = [
    {source: nodes[0], target: nodes[2], left: false, right: true, capacity: 10 },
    {source: nodes[0], target: nodes[3], left: false, right: true, capacity: 10 },
    {source: nodes[2], target: nodes[3], left: false, right: true, capacity: 2 },
    {source: nodes[2], target: nodes[4], left: false, right: true, capacity: 4 },
    {source: nodes[2], target: nodes[5], left: false, right: true, capacity: 8 },
    {source: nodes[3], target: nodes[5], left: false, right: true, capacity: 9 },
    {source: nodes[4], target: nodes[1], left: false, right: true, capacity: 10 },
    {source: nodes[5], target: nodes[4], left: false, right: true, capacity: 6 },
    {source: nodes[5], target: nodes[1], left: false, right: true, capacity: 10 },
  ];

// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(100)
    .gravity(0.1)
    .charge(chargeF)
    .linkStrength(0.05)
    .on('tick', tick);

function chargeF (d) {
  // Source and sink should have more charge
  if (d.name === 's' || d.name === 't') {
    return -2000;
  }
  return -1000;
}

// define arrow markers for graph links
var defs = svg.append('svg:defs');

defs.append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

defs.append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

var drag = force.drag()
  .on("drag", dragmove);
      
function dragmove(d) {
  // Dont move source, and sink
  if (d.name === 's' || d.name === 't') {
    d.px = d.x;
    d.py = d.y;
  }
}

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// === Business Time ===

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.select('path').attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  // add new links
  var g = path.enter().append('g')
    .attr('class', 'edge');

  g.append('svg:path')
    .attr('class', 'link')
    .attr('id', function(d,i) {return i})
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d3.event.altKey) {return}

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) {selected_link = null}
      else {selected_link = mousedown_link;}
      selected_node = null;

      textBox.attr('placeholder', "New Max capacity");
      restart();
    });

  g.append('text')
    .append('textPath')
      .attr('xlink:href', function (d, i) {
        return "#" + i;
      })
      .attr('startOffset', '50%')
    .append('tspan')
      .attr('dy', -5);

  // remove old links
  path.exit().remove();

  // update existing links
  path.select('path').classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });

  path.select('text')
    .select('tspan')
      .text(function(d) {
        if (d.flow) {return d.flow + " / " + d.capacity;}
        else {return 0 + " / " + d.capacity;}
      });
      

  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  circle.selectAll('text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.name; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 12)
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
    .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
      if(!mousedown_node || d === mousedown_node) {return}
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function(d) {
      if(!mousedown_node || d === mousedown_node) {return}
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', function(d) {
      if(d3.event.altKey) {return}

      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) {selected_node = null}
      else {selected_node = mousedown_node}
      selected_link = null;

      textBox.attr('placeholder', "New Node Name");

      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      restart();
    })
    .on('mouseup', function(d) {

      if(!mousedown_node) {return}

      // needed by FF
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseup_node = d;
      if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      var source, target, direction;
      source = mousedown_node;
      target = mouseup_node;
      direction = 'right';

      var link;
      link = links.filter(function(l) {
        return (l.source === source && l.target === target);
      })[0];

      if(link) {
        link[direction] = true;
      } else {
        link = {source: source, target: target, left: false, right: false};
        link[direction] = true;
        links.push(link);
      }

      // select new link
      selected_link = link;
      selected_node = null;
      restart();
    });

  // show node names
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .text(function(d) { return d.name; });

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

// === Window listeners
//

// Mouse handlers

function mousedown() {
  // prevent I-bar on drag
  
  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.altKey || mousedown_node || mousedown_link) {return}

  // insert new node at point
  var point = d3.mouse(this),
      node = {id: ++lastNodeId, reflexive: false};
  node.x = point[0];
  node.y = point[1];
  nodes.push(node);

  restart();
}

function mousemove() {
  if(!mousedown_node) {return}

  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  restart();
}

function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source === node || l.target === node);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// ========== Key Listeners ===========

// only respond once per keydown
// var lastKeyDown = -1;

function keydown() {
  // if(lastKeyDown !== -1) return;
  // lastKeyDown = d3.event.keyCode;

  if(d3.event.altKey) {
    circle.call(drag);
    svg.classed('drag', true);
  }
}
function keyup() {
  circle
    .on('mousedown.drag', null)
    .on('touchstart.drag', null);
  svg.classed('drag', false);
}

// Window keymap dispatch functions.
function rKey() {
  if(selected_node) {
    // toggle node reflexivity
    selected_node.reflexive = !selected_node.reflexive;
  } else if(selected_link) {
    // set link direction to right only
    selected_link.left = false;
    selected_link.right = true;
  }
  restart();
}
function lKey() {
  if(selected_link) {
    // set link direction to left only
    selected_link.left = true;
    selected_link.right = false;
  }
  restart();
}
function bKey() {
  if(selected_link) {
    // set link direction to both left and right
    selected_link.left = true;
    selected_link.right = true;
  }
  restart();
}
function fKey() {
  if(selected_node) {
    // Make the selected node fixed in position.
    selected_node.fixed = true;
  }
  restart();
}
function rmObj() {
  // Backspace should not navigate back
  d3.event.preventDefault();

  if(selected_node) {
    nodes.splice(nodes.indexOf(selected_node), 1);
    spliceLinksForNode(selected_node);
  } else if(selected_link) {
    links.splice(links.indexOf(selected_link), 1);
  }
  selected_link = null;
  selected_node = null;
  restart();
}
var win = d3.select(window)
    .onKey('⌫/⌦', rmObj)
    .onKey('b', bKey)
    .onKey('l', lKey)
    .onKey('r', rKey)
    .onKey('f', fKey);


// app starts here

svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);
restart();


var button = d3.select('body').append('button')
    .attr("name", "solve")
    .attr("type", "button")
    .text("Solve");


// Ford - Fulkerson : Solve for the max flow.
button.on('click', function(){ fordFulkerson(nodes, links) });

function fordFulkerson(vs, es) {
  var rG = initResidual(vs,es),
      path;

  // Initialize a residual graph structure.
  // returns a map of vetex id's to an array of their outgoing edges.
  function initResidual(vs,es) {
    var g = d3.map(),
        outgoing,
        incoming;

    vs.forEach(function(v) {
      g.set(v.id, []);
    });

    es.forEach(function(e) {
      var bEdge = {target: e.target.id, flow: e.capacity};
      var fEdge = {target: e.source.id, flow: 0};

      outgoing = g.get(e.source.id) || [];
      outgoing.push(bEdge);

      incoming = g.get(e.target.id) || [];
      incoming.push(fEdge);

      g.set(e.source.id, outgoing);
      g.set(e.target.id, incoming);
    });

    return g;
  }
  function findAugmentingP(rG) {
    // run dfs to find s-t path, return the path seq.
    var explored = d3.map();

    function dfs(path) {
      var u = path[path.length-1];
      explored.set(u, true);

      if (u === 1) { return path; }

      // Consider edges which have nonzero residual flow.
      var es = rG.get(u).filter(function(e){return e.flow>0;});

      if (!es || es.length === 0) { return false; }

      for (var i=0; i<es.length; i++) {
        var tgt = es[i].target;
        if (! explored.get(tgt)) {
          var newpath = path.slice(0);
          newpath.push(tgt);
          var p = dfs(newpath);
          
          if (p) { return p; }
        }
      }
    }
    return dfs([0]);
  }
  function augment(path, rG) {
    function bottleneck(path, rG) {
      // return the min residual capacity of any edge on the path.
      path = path.reverse();
      var u = path.pop(),
          min = parseFloat('Infinity');
      
      for (var v; v = path.pop();) {
        var edge = rG.get(u).filter(function(e) {return e.target === v})[0];
        if (edge.flow < min) {min = edge.flow;}

        u = v;
      }
      return min;
    }

    var b = bottleneck(path.slice(0), rG);
    var u = 0;
    console.log(path);
    path.forEach(function(v) {
      if (u === v) {return;}

      var bEdge = rG.get(u).filter(function(e) {return e.target === v})[0];
      var fEdge = rG.get(v).filter(function(e) {return e.target === u})[0];

      fEdge.flow += b;
      bEdge.flow -= b;

      u = v;
    });
  }
  function makeFlow(rG) {

    // Display the result flow
    links.forEach(function(l) {
      var edge = rG.get(l.target.id).filter(function(e) { return e.target === l.source.id})[0];
      l.flow = edge.flow;
    });
    restart();

    // Display the max flow
    var sinkIncedent = rG.get(1);
    var total = 0;
    sinkIncedent.forEach(function (e) {
      total += e.flow;
    });
    maxFlow.text(total);
  }

  path = findAugmentingP(rG);
  console.log("path: ", path);
  console.log("graph: ", rG);
  var i = 10;
  while (path && i>0) {
    augment(path, rG);
    console.log("path: ", path);
    console.log("graph: ", rG);

    path = findAugmentingP(rG);
  }

  console.log("Final flow: ", rG);
  
  makeFlow(rG);
}
