(function(){
  "use strict";

  window.Residual = Residual;
  function Residual (graph, preres) {
    var self = this,
        ns = [],
        ls = [];

    var id;
    for (id in preres) {
      var es = preres[id];

      id = parseInt(id.charAt(1));
      ns.push({id: id});
      // No need to check for dupes.
      es.forEach(function (e) {
        ls.push({
          source: id,
          target: parseInt(e.target),
          flow: e.flow
        });
      });
    }

    ns = ns.map(function(n) {
      var node = graph.getNode(n.id);
      return JSON.parse( JSON.stringify(node) );
    });

    ls = ls.map(function(e){
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
  }
})();

