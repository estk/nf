function showSteps(log){
  "use strict";
  var margin = {top: 20, right: 10, bottom: 20, left: 10};
  var width = 960 - margin.left - margin.right,
      height = 1000 - margin.top - margin.bottom,
      colors = d3.scale.category20(),
      percentile = width/10;

  var index = 0;
  // Build a log viewer
  var body = d3.select('body');

  var navContainer = body.append('div')
      .attr('class', 'navcontainer');

  var back = navContainer.append('button')
      .attr('id', 'back')
      .attr("name", "back")
      .attr("type", "button")
      .text("<")
      .on('click', function() {showStep(--index);});

  var back = navContainer.append('button')
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

  showStep(index);

  function showStep(index) {
    var logItem = log[index],
        flow = new Graph(logItem.flow.vertices, logItem.flow.edges),
        residual = new Residual(logItem.residual);

    // Make flow and residual graphs. (non-interactive)
    var flowG = svg.append('g')
        .attr('class', 'flow');
    var residualG = svg.append('g')
        .attr('class', 'residual');

    // Build svg of flow and residual.
  }

}
