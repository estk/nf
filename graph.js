(function(){
  "use strict";

  window.Edge = Edge;
  function Edge (graph, edgeObj) {
    this._graph = graph;
    this.sourceId = edgeObj.sourceId;
    this.targetId = edgeObj.targetId;
    this.capacity = edgeObj.capacity;
    return this;
  }

  Edge.prototype.source = function () {
    return this._graph.getNode(this.sourceId);
  };
  Edge.prototype.target = function () {
    return this._graph.getNode(this.targetId);
  };

  window.Graph = Graph;
  function Graph (nodes, links) {
    var self = this;

    this._nodes = nodes;
    this._lastNodeId = nodes.length-1;
    this._links = links;

    return this;
  }
  
  Graph.prototype.toJSON = function () {

    // Make a new copy of links.
    var es = JSON.parse(JSON.stringify(this._links));
    es.map(function(e) {
      e.source = e.source.id;
      e.target = e.target.id;
      return e;
    });

    var graph = {
      vertices: this._nodes,
      edges: es,
    },
    graphJSON = JSON.stringify(graph, null, 2);

    return graphJSON;
  };

  Graph.fromJSON = function (JSONString) {
    var graphObj = JSON.parse(JSONString);

    var ns = graphObj.vertices;

    var ls = graphObj.edges.map(function(e){
      var sourceId = e.source,
          targetId = e.target;
      e.source = ns.filter(function(n) {
        return n.id === sourceId;
      })[0];
      e.target = ns.filter(function(n) {
        return n.id === targetId;
      })[0];
      return e;
    });

    return new Graph(ns, ls);
  };


  Graph.prototype.nodes = function () {
    return this._nodes;
  };

  Graph.prototype.links = function () {
    return this._links;
  };

  Graph.prototype.addNode = function (point) {
    var node =
      { id: ++this._lastNodeId
      , x: point[0]
      , y: point[1]
      };

    this._nodes.push(node);
    return node;
  };

  Graph.prototype.getNode = function (id) {
    if (! this._nodes) return null;

    var res = this._nodes.filter(function (n) {
      return n.id === id;
    });

    if (res.length === 0) return null;

    return res[0];
  };

  Graph.prototype.deleteNode = function (id) {
    this._nodes = this._nodes.filter(function(n) { return n.id !== id; });
    this._lastNodeId--;

    // Remove links incident to node
    this.deleteLinks(function(l) {
      return (l.source.id === id || l.target.id === id);
    });

  };

  Graph.prototype.addLink = function (sourceId, targetId) {
    var previous = this.getLink(sourceId, targetId);

    if (previous) return previous;

    var newLink = new Edge({sourceId: sourceId, targetId: targetId});
    this._links.push( newLink );

    return newLink;
  };
  Graph.prototype.getLink = function (source, target) {
    if (!this._links) return null;

    var res = this._links.filter(function(l) {
      return (l.source === source && l.target === target);
    });

    if (res.length === 0) return null;

    return res[0];
  };

  Graph.prototype.deleteLinks = function (cb) {
    var self = this;
    var toSplice = this._links.filter(cb);

    toSplice.map(function(l) {
      self._links.splice(self._links.indexOf(l), 1);
    });
  };

})();
