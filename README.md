Click in the open space to **add a node**, drag from one node to another to **add an edge**.  
Ctrl-drag a node to **move** the graph layout.  
Click a node or an edge to **select** it.

When a node is selected: **R** toggles reflexivity, **Delete** removes the node.  
When an edge is selected: **L**(eft), **R**(ight), **B**(oth) change direction, **Delete** removes the edge.

The di-graph logic was borrowed from [rkirsling](http://rkirsling.github.com)!.

This project is an attempt to make the solutions to network flow problems accessible the general public. I will use a modified version of Ford-Fulkerson to compute the max flow. Special thanks to [Dimitris Achilloptas](http://users.soe.ucsc.edu/~optas/) for the introduction to such a great algorithm!

TODO:
- Implement Ford-Fulkerson
- Better handling of keyString in keybinding.js
- Multi-Edge Selection
- Linear gravitation points
- Cleanup restart()