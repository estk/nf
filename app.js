// app starts here

svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);
restart();

// function fordFulkerson() {
//   function augmenting(g) {
//     // run dfs to find s-t path, return the path seq
//   }
//   function augment(f, p) {
//     // determine the bottleneck, b of the path
//     // increase the flow of every forward edge by b
//     // decrease the flow of every backward edge by b
//     //
//     // return the new max flow and return it
//   }
//   var ns = nodes,
//       es = links,
//       flow = 0;
//
//   es.forEach(function (e) {
//     e.flow = 0;
//   })
//   var g = residual(es)
//   while (var p = augmenting(g)) {
//     flow = augment(g, p)
//   }
//   return flow;
// }
