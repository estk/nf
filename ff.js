"use strict";
function fordFulkerson(vs, es) {
  es = es.slice(0).map(function(o) {
    return {
      source: o.source,
      target: o.target,
      capacity: o.capacity,
    };
  });
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
    path.forEach(function(v) {
      if (u === v) {return;}

      var bEdge = rG.get(u).filter(function(e) {return e.target === v})[0];
      var fEdge = rG.get(v).filter(function(e) {return e.target === u})[0];

      fEdge.flow += b;
      bEdge.flow -= b;

      u = v;
    });
  }
  // Returns [maxflow, edges]
  function makeFlow(rG, vs, es) {

    // Display the result flow
    es.forEach(function(l) {
      var edge = rG.get(l.target.id).filter(function(e) { return e.target === l.source.id})[0];
      l.flow = edge.flow;
    });

    // Display the max flow
    var sinkIncedent = rG.get(1);
    var total = 0;
    sinkIncedent.forEach(function (e) {
      total += e.flow;
    });

    return [total, es];
  }

  path = findAugmentingP(rG);
  var i = 10;
  while (path && i>0) {
    augment(path, rG);

    path = findAugmentingP(rG);
  }

  console.debug("Residual Graph flow: ", rG);
  
  return makeFlow(rG, vs, es);
}
