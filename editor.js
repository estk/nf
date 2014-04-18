  window.homePath = window.location.pathname;
  window.onpopstate = function(e) {
    if (e.target.location.pathname === homePath) {
      e.preventDefault();
      makeEditor();
    } else if (e.target.location.pathname === "/flowview") {
      e.preventDefault();
      flowView();
    }
  };

function makeEditor(){
  "use strict";
  var margin = {top: 20, right: 10, bottom: 20, left: 10};
  var width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      colors = d3.scale.category20(),
      percentile = width/10;



  d3.select('#app-container').remove();
  var body = d3.select('body')
      .append('div')
    .attr('id', 'app-container');

  // === UI ===

  // TextBox
  var textBox = body.append('textarea')
      .attr('class', 'dialog')
      .onKey('return', textboxHandler);


  // MaxFlow
  var maxFlow = body.append('div')
      .attr('class', 'maxflow')
      .text("Max Flow: ")
    .append("span");

  var solveBtnContainer = body.append('div')
      .attr('class', 'solvebtncontainer');

  var solveButton = solveBtnContainer.append('button')
      .attr('class', 'solve')
      .attr("name", "solve")
      .attr("type", "button")
      .text("Solve")
      .on('click', solveFlow);
          
  function solveFlow (){
    var res = fordFulkerson(networkGraph.nodes(), networkGraph.links());
    updateGraph(res[0]);
  }

  function updateGraph(res) {
    var flow = res.maxflow,
        tmpLinks = res.edges,
        tmpNodes = res.vertices;
    networkGraph = new Graph([], []);
    maxFlow.text("");
    restart();

    networkGraph = new Graph(tmpNodes, tmpLinks);
    maxFlow.text(flow);
    restart();
  }

  var resetButton = solveBtnContainer.append('button')
      .attr('class', 'reset')
      .attr("name", "reset")
      .attr("type", "button")
      .text("Reset")
      .on('click', resetFlow);

  function resetFlow() {
    networkGraph.resetFlow();
    maxFlow.text("");
    restart();
  }

  var showStepsButton = solveBtnContainer.append('button')
      .attr('class', 'show-steps')
      .attr("name", "showSteps")
      .attr("type", "button")
      .text("Show Steps")
      .on('click', makeFlowView);

  function makeFlowView() {
    var url = '/flowview';
    window.history.pushState(null,null, url);
    // perform ford fulkerson
    var res = fordFulkerson(networkGraph.nodes(), networkGraph.links()),
        finalFlow = res[0],
        log = res[1];

    window.log = log;
    window.networkGraph = networkGraph;

    flowView();
  }

  function textboxHandler() {
    var contents = textBox[0][0].value;
    function setName(n, v) {
      n.name = v;
      restart();
    }
    function setCapacity(e, v) {
      e.capacity = v;
      restart();
    }

    // === Dispatch ===

    d3.event.preventDefault();
    // Empty
    if (contents === "") {
      alert("No name!");
      return;

    // Nothing selected
    } else if (!selected_node && !selected_link) {
      alert("Please select a link or node to name.");
    }

    // Changing Node Name
    if (selected_node) {
      if (contents.length > 2) {
        alert("Need Length <= 2");
      }
      else {
        setName(selected_node, contents);
      }

    // Changing Edge Capacity
    } else if (selected_link) {
      resetFlow();
      var newCap = parseInt(contents, null);
      if (isNaN(newCap)) {
        alert("Please enter a number");
      }
      else {
        setCapacity(selected_link, newCap);
      }
    }

    // Clear textbox
    textBox[0][0].value = "";
  }

  // === Graph ===

  // Svg
  var svg = body
    .append('svg')
    .attr('class', 'editor')
    .attr('width', width)
    .attr('height', height);

  // set up initial nodes and links
  //  - Source has id === 0, Sink id === 1.
  //  - nodes are known by 'id', not by index in array.
  //  - links are always source < target; edge directions are set by 'left' and 'right'.
  var tmpNodes = [
      {id: 0, name: 's', fixed: true, x: (percentile), y: height/2},
      {id: 1, name: 't', fixed: true, x: (width-percentile), y: height/2},
      {id: 2, name: 'a', },
      {id: 3, name: 'b', },
      {id: 4, name: 'c', },
      {id: 5, name: 'd', }
    ],
    tmpLinks = [
      {source: tmpNodes[0], target: tmpNodes[2], capacity: 10 },
      {source: tmpNodes[0], target: tmpNodes[3], capacity: 10 },
      {source: tmpNodes[2], target: tmpNodes[3], capacity: 2 },
      {source: tmpNodes[2], target: tmpNodes[4], capacity: 4 },
      {source: tmpNodes[2], target: tmpNodes[5], capacity: 8 },
      {source: tmpNodes[3], target: tmpNodes[5], capacity: 9 },
      {source: tmpNodes[4], target: tmpNodes[1], capacity: 10 },
      {source: tmpNodes[5], target: tmpNodes[4], capacity: 6 },
      {source: tmpNodes[5], target: tmpNodes[1], capacity: 10 },
    ];

  var networkGraph;
  if (window.networkGraph) {
    networkGraph = Graph.fromJSON( window.networkGraph.toJSON() );
  } else {
    networkGraph = new Graph(tmpNodes, tmpLinks);
  }

  // init D3 force layout
  var force = d3.layout.force()
      .nodes(networkGraph.nodes)
      .links(networkGraph.links)
      .size([width, height])
      .linkDistance(100)
      .gravity(0.1)
      .charge(-1000)
      .linkStrength(0.05)
      .on('tick', tick);

  var drag = force.drag();

  // define arrow markers for graph links
  var defs = svg.append('svg:defs');

  defs.append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('markerUnits', "userSpaceOnUse")
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

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
        

  function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
  }

  // === Business Time ===

  // handles to link and node element groups
  var path = svg.append('svg:g').selectAll('g'),
      circle = svg.append('svg:g').selectAll('g');

  // update force layout (called automatically each iteration)
  function tick() {
    // draw directed edges with proper padding from node centers
    path.selectAll('path').attr('d', function(d) {
      var deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist,
          sourcePadding = 12,
          targetPadding = 17,
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
    // Re-seed force layout with new nodes (/links).
    force.nodes(networkGraph.nodes())
        .links(networkGraph.links());

    // path (link) group
    path = path.data(networkGraph.links(), function(d) {return d.id});

    // add new links
    var g = path.enter().append('g')
      .attr('class', 'link')
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

    g.append('svg:path')
      .attr('class', 'link')
      .attr('id', function(d) {return d.id})
      .classed('selected', function(d) { return d === selected_link; })
      .style('marker-end', 'url(#end-arrow)');

    g.append("svg:path")
        .attr('class', 'halo');

    g.append('text')
      .append('textPath')
        .attr('xlink:href', function (d) {return "#" + d.id})
        .attr('startOffset', '50%')
      .append('tspan')
        .attr('dy', -5);

    // remove old links
    path.exit().remove();

    // update existing links
    path.select('path').classed('selected', function(d) { return d === selected_link; })
      .style('marker-end', 'url(#end-arrow)');

    path.select('text')
      .select('tspan')
        .text(function(d) {
          if (d.flow) {return d.flow + " / " + d.capacity;}
          else {return 0 + " / " + d.capacity;}
        });
        

    // circle (node) group
    circle = circle.data(networkGraph.nodes(), function(d) {return d.id});

    circle
      .classed('selected', function(d){ return d === selected_node; });

    circle.selectAll('text')
        .attr('y', 4)
        .attr('class', 'id')
        .text(function(d) { return d.name; });

    // update existing nodes (selected visual states)
    circle.selectAll('circle')
      .style('fill', function(d) {
        return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
      });

    // add new nodes
    var gC = circle.enter().append('svg:g');

    // Add the circle where it should be.
    gC.attr('class','node')
        .classed('selected', function(d){ return d === selected_node })
        .attr('transform', function(d) {
          if (!d.x || !d.y) {return ""}
          return 'translate(' + d.x + ',' + d.y + ')';
        });

    gC.append('svg:circle')
      .attr('r', 12)
      .style('fill', function(d) {
        return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id);
      })
      .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); });

    // show node names
    gC.append('svg:text')
        .attr('y', 4)
        .attr('class', 'name')
        .text(function(d) { return d.name; });

    gC.on('mouseover', function(d) {
        if(!mousedown_node || d === mousedown_node) {return}
        // e.target target node
        d3.select(this).select('circle').transition().attr('transform', 'scale(1.1)');
      })
      .on('mouseout', function(d) {
        if(!mousedown_node || d === mousedown_node) {return}
        // unenlarge target node
        d3.select(this).select('circle').transition().attr('transform', '');
      })
      .on('mousedown', function(d) {
        if(d3.event.altKey) {return}

        // select node
        mousedown_node = d;
        selected_node = mousedown_node;
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
        d3.select(this).select('circle').transition().attr('transform', '');

        // add link to graph (update if exists)
        // NB: links are strictly source < target; arrows separately specified by booleans
        var source = mousedown_node,
            target = mouseup_node;

        var link = networkGraph.addLink({source: source, target: target});
        textBox.attr('placeholder', "New Max Capacity");

        // select new link
        selected_link = link;
        selected_node = null;
        restart();
      });

    // remove old nodes
    circle.exit().remove();

    // set the graph in motion
    force.start();
  }

  // ========== Listeners ===========

  // ========== Mouse Listeners ===========
  function mousedown() {
    svg.classed('active', true);
    
    if(d3.event.which !== 1) {return}
    if(d3.event.altKey || mousedown_node || mousedown_link) {return}

    // insert new node at point
    var point = d3.mouse(this),
        node = networkGraph.addNode(point);

    textBox.attr('placeholder', "New Node Name");

    selected_link = null;
    selected_node = node;
    restart();
  }

  function mousemove() {
    if (! mousedown_node) {return}

    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
    restart();
  }

  function mouseup() {
    if (mousedown_node) {
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');
    }

    svg.classed('active', false);

    // clear mouse event vars
    resetMouseVars();
  }

  // ========== Key Listeners ===========
  function keydown() {
    if (d3.event.altKey) {
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
  function fKey() {
    if (! selected_node) {return}

    if (! selected_node.fixed) {
      selected_node.fixed = true;
    } else {
      selected_node.fixed = false;
    }
    restart();
  }
  function rmObj() {
    // Backspace should not navigate back
    d3.event.preventDefault();

    if (selected_node) {
      networkGraph.deleteNode(selected_node.id);
    } else if(selected_link) {
      networkGraph.deleteLinks(function(l) {return l === selected_link; });
    }
    selected_link = null;
    selected_node = null;

    resetFlow();
    restart();
  }

  d3.select(window)
      .onKey('backspace/del', rmObj)
      .onKey('f', fKey);

  // app starts here
  svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup);
  d3.select(window)
    .on('keydown', keydown)
    .on('keyup', keyup);
  restart();



  // JSONify graph
  var transBtnContainer = body.append('div')
      .attr('class', 'transbtncontainer');

  var transcribeButton = transBtnContainer.append('button')
      .attr('class', 'transcribe')
      .attr("name", "solve")
      .attr("type", "button")
      .text("Transcribe")
      .on('click', function(){
        transcribeArea[0][0].value = networkGraph.toJSON();
      });

  var renderButton = transBtnContainer.append('button')
      .attr('class', 'render')
      .attr("name", "solve")
      .attr("type", "button")
      .text("Render")
      .on('click', renderGraph);

  window.autoBoxResize = function () {
    var preHeight = this.style.height;
    this.style.height = 0;
    var height = this.scrollHeight;
    this.style.height = preHeight;
    d3.select(this)
      .transition()
        .attr('style', 'height:' + height + 'px');
  };

  var transcribeArea = body.append('textarea')
      .attr('class', 'transcribe')
      .on('keyup', autoBoxResize)
      .on('mousedown', autoBoxResize);

  function renderGraph () {
    // Flush

    networkGraph = Graph.fromJSON(transcribeArea[0][0].value);
    restart();
  }
}

makeEditor();
