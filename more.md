<div id="container">
# Network Flow

## Introduction

I was first introduced to network flow in CS201: Algorithms in my final quarter of my time as an undergraduate at UC Santa Cruz. The class was taught by Professor Dimitris Achilloptas. The course loosely followed the text [Algorithm Design](http://books.google.com/books/about/Algorithm_Design.html?id=OiGhQgAACAAJ) by Jon Kleinberg and Eva Tardos. After covering the standard Greedy algorithms, Divide and Conquer, and Dynamic Programming, and with only a few weeks left of the quarter, we began studying Network Flow. I found the problems extremely challenging and inspiring, and even after graduating am still thinking about then.

## Network Flow Preliminaries

First and foremost, a Network Flow is defined on a Digraph or directed Graph. 

*Definition:* A **Graph** is defined by a set of vertices and edges $G = (V, E)$, such that for all $e \in E$, $e = \{v_1, v_2\}$ where $v_1, v_2 \in V$.

*Definition:* In a **Digraph** we make the distinction that for all $e \in E$, $e = (v_1, v_2)$. This simply indicates that the edges have a direction.

*Definition:* A **Network** is defined by extending a Digraph $G=(V,E)$ by a specification of the capacity $c(e)$ $\forall e \in E$ and two special nodes the source $s$ and the sink $t$. 

*Definition:* A **Network Flow** is an abstraction for material flowing throught the graph. Finding the solution to a network flow consists of determining the maximum flow which can be pushed throught the network from the source $s$ to the sink $t$. As we'll learn later, this is in fact equivalent to what is called the *minimum cut* of the Network.

*Remark:*  For our purposes we'll be considering network flows with integer capacity only.

## Considering a Trivial Flow

Consider the trivial flow.

<div class="svg-container">
<svg height="160" width="580" class="editor"><defs><marker orient="auto" markerUnits="userSpaceOnUse" markerHeight="10" markerWidth="10" refX="6" viewBox="0 -5 10 10" id="end-arrow"><path d="M0,-5L10,0L0,5"></path></marker></defs><path style="" d="M58,80L527,81.19999694824219" class="link dragline hidden"></path><g><g class="link"><path d="M70,80L505,80" style="marker-end: url(&quot;#end-arrow&quot;);" id="139743228468111" class="link"></path><path d="M70,80L505,80" class="halo"></path><text><textPath startOffset="50%" xlink:href="#139743228468111"><tspan dy="-5">0 / 1</tspan></textPath></text></g></g><g><g transform="translate(58,80)" class="node"><circle style="fill: rgb(31, 119, 180); stroke: rgb(21, 83, 125);" r="12"></circle><text class="id" y="4">s</text></g><g transform="translate(522,80)" class="node"><circle style="fill: rgb(174, 199, 232); stroke: rgb(121, 139, 162);" r="12"></circle><text class="id" y="4">t</text></g></g></svg>
</div>

In this flow there is a single edge which has capacity $1$ from the source node $s$, to the sink node $t$. Clearly, given this flow we may have a maximum flow of $1$ through the network.

The flow below illustrates a core concept in network flow, namely that the maximum flow is equal to the minimum cut. We'll see what this means in a minute, but in this simple network, the flow is limited by the edge with the least capacity.

<div class="svg-container">
<svg height="160" width="580" class="editor"><defs><marker orient="auto" markerUnits="userSpaceOnUse" markerHeight="10" markerWidth="10" refX="6" viewBox="0 -5 10 10" id="end-arrow"><path d="M0,-5L10,0L0,5"></path></marker></defs><path style="" d="M290.01424180728776,79.9999999997844L290.01424180728776,79.9999999997844" class="link dragline hidden"></path><g><g class="link"><path d="M69.99999999993658,80.00003901592389L273.0024884307849,80.00069904339382" style="marker-end: url(&quot;#end-arrow&quot;);" id="139743232831912" class="link"></path><path d="M69.99999999993658,80.00003901592389L273.0024884307849,80.00069904339382" class="halo"></path><text><textPath startOffset="50%" xlink:href="#139743232831912"><tspan dy="-5">0 / 2</tspan></textPath></text></g><g class="link"><path d="M302.0024884306316,80.0007152991918L505.00000000008987,80.00005527374456" style="marker-end: url(&quot;#end-arrow&quot;);" id="139743233044413" class="link"></path><path d="M302.0024884306316,80.0007152991918L505.00000000008987,80.00005527374456" class="halo"></path><text><textPath startOffset="50%" xlink:href="#139743233044413"><tspan dy="-5">0 / 1</tspan></textPath></text></g></g><g><g transform="translate(58,80)" class="node"><circle style="fill: rgb(31, 119, 180); stroke: rgb(21, 83, 125);" r="12"></circle><text class="id" y="4">s</text></g><g transform="translate(522,80)" class="node"><circle style="fill: rgb(174, 199, 232); stroke: rgb(121, 139, 162);" r="12"></circle><text class="id" y="4">t</text></g><g transform="translate(290.00248843069505,80.00075431595268)" class="node"><circle style="fill: rgb(255, 152, 150); stroke: rgb(178, 106, 105);" r="12"></circle><text class="id" y="4">a</text></g></g></svg>
</div>

## Maximum Flow and Minimum Cut

Lets begin with the definitions.

*Definition:* The **Maximum Flow** of a network is the maximum units of flow which can propagate through the network from the source to the sink given the capacities of each edge.

*Definition:* Technically speaking, a **cut** is a partitioning of the vertices in a graph into two disjoint subsets. With respect to a network, a **cut** has the additional constraints that each partition must have either the source or the sink in it's set.

Consider the following example where the vertices in one partition are blue and the vertices in the other partition are brown.

<div class="svg-container">
<svg viewBox="60, 100, 800, 260" height="260" width="900" class="editor active"><defs><marker orient="auto" markerUnits="userSpaceOnUse" markerHeight="10" markerWidth="10" refX="6" viewBox="0 -5 10 10" id="end-arrow"><path d="M0,-5L10,0L0,5"></path></marker></defs><path d="M0,0L0,0" class="link dragline hidden"></path><g><g class="link"><path d="M105.71484101266599,232.60048073401035L381.92508014617107,293.91410885977604" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888101" class="link"></path><path d="M105.71484101266599,232.60048073401035L381.92508014617107,293.91410885977604" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888101"><tspan dy="-5">0 / 10</tspan></textPath></text></g><g class="link"><path d="M105.59071316613242,226.89269114820488L356.4103361653738,159.65144174633375" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888102" class="link"></path><path d="M105.59071316613242,226.89269114820488L356.4103361653738,159.65144174633375" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888102"><tspan dy="-5">0 / 10</tspan></textPath></text></g><g class="link"><path d="M396.38981897139263,285.7889056369286L375.84983490291745,171.97914580066475" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888103" class="link"></path><path d="M396.38981897139263,285.7889056369286L375.84983490291745,171.97914580066475" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888103"><tspan dy="-5">0 / 2</tspan></textPath></text></g><g class="link"><path d="M410.51031512637843,298.1068849513953L550.1911418330886,304.03423597535544" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888104" class="link"></path><path d="M410.51031512637843,298.1068849513953L550.1911418330886,304.03423597535544" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888104"><tspan dy="-5">0 / 4</tspan></textPath></text></g><g class="link"><path d="M407.2400327958064,289.35310676275816L529.1299513632026,174.08843204859977" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888105" class="link"></path><path d="M407.2400327958064,289.35310676275816L529.1299513632026,174.08843204859977" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888105"><tspan dy="-5">0 / 8</tspan></textPath></text></g><g class="link"><path d="M384.8197177579755,155.7583146590813L524.4970593353322,161.68705918547525" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888106" class="link"></path><path d="M384.8197177579755,155.7583146590813L524.4970593353322,161.68705918547525" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888106"><tspan dy="-5">0 / 9</tspan></textPath></text></g><g class="link"><path d="M578.7665059364476,301.6474359243595L829.5799130156876,234.40235657660918" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888107" class="link"></path><path d="M578.7665059364476,301.6474359243595L829.5799130156876,234.40235657660918" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888107"><tspan dy="-5">0 / 10</tspan></textPath></text></g><g class="link"><path d="M543.6133577337723,174.2171544281399L564.156101149162,288.02533503957477" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888108" class="link"></path><path d="M543.6133577337723,174.2171544281399L564.156101149162,288.02533503957477" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888108"><tspan dy="-5">0 / 6</tspan></textPath></text></g><g class="link"><path d="M553.196651456908,165.00827193878857L829.4039120742574,226.31627015634666" style="marker-end: url(&quot;#end-arrow&quot;);" id="13976799888109" class="link"></path><path d="M553.196651456908,165.00827193878857L829.4039120742574,226.31627015634666" class="halo"></path><text><textPath startOffset="50%" xlink:href="#13976799888109"><tspan dy="-5">0 / 10</tspan></textPath></text></g></g><g><g transform="translate(94,230)" class="node"><circle style="fill: steelblue; stroke: grey;" r="12"></circle><text class="id" y="4">s</text></g><g transform="translate(846,230)" class="node"><circle style="fill: brown; stroke: grey;" r="12"></circle><text class="id" y="4">t</text></g><g transform="translate(398.5211049141146,297.59812323295733)" class="node"><circle style="fill: steelblue; stroke: grey;" r="12"></circle><text class="id" y="4">a</text></g><g transform="translate(372.83051315072805,155.2494208729573)" class="node"><circle style="fill: steelblue; stroke: grey;" r="12"></circle><text class="id" y="4">b</text></g><g transform="translate(567.1758563004624,304.7549817431425)" class="node"><circle style="fill: brown; stroke: grey;" r="12"></circle><text class="id" y="4">c</text></g><g transform="translate(541.4817658622661,162.40799204915092)" class="node"><circle style="fill: brown; stroke: grey;" r="12"></circle><text class="id" y="4">d</text></g></g></svg>
</div>

*Definition:*  The **Minimum Cut** is the 

# Bulk
Finally we have the Max-Flow / Min-Cut Theorem, it establishes the equivalence of finding the maximum flow and establishing the minimum cut. Specifically the theorem states that value of the maximum flow is equal to the minimum cut.


## Notes and References
- The slides which acompany the text are available online [here](http://www.cs.princeton.edu/~wayne/kleinberg-tardos/).
</div>
