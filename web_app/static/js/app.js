
//let d3 = require('d3');
//let dagreD3 = require('dagre-d3');

function createEdgeLabelHTML(edge) {
    let label = $.trim(edge.label);
    const lastChar = label[label.length -1];

    if (lastChar == '|') {
        label = label.slice(0, label.length -1)
    }

    label = " <a target=\"_blank\" href=\"../" + edge.debug_file + "\">" + label + "</a>";

    return label;
}

function drawGraph(nodes, edges, sub_graphs){
    let g = new dagreD3.graphlib.Graph({ multigraph: true, compound:true}).setGraph({});

    nodes.forEach(function(node) { g.setNode(node.id, {
        label: (_.tail(node.id.split("_"))).join("")
    })});

    const color_palette = ["#1f78b4","#33a02c","#ff7f00","#6a3d9a","#b15928","#e31a1c"];
    let ctr = 0;

    sub_graphs.forEach(function (sub_graph) {
       g.setNode(sub_graph.name, {
                label: sub_graph.name, clusterLabelPos: 'top',
                labelStyle: "fill: " + color_palette[ctr] + ";",
                style: "stroke: " + color_palette[ctr] + ";fill: #e3e3e3;"
            }
       );
       ctr = ctr + 1;

       if (ctr === 6){
           ctr = 0;
       }
       if (sub_graph.parent !== ""){
           g.setParent(sub_graph.name, sub_graph.parent);
       }

       sub_graph.nodes_in_graph.forEach(function (node_of_subgraph) {
           g.setParent(node_of_subgraph, sub_graph.name);
       })
    });

    edges.forEach(function(edge) {g.setEdge(edge.source, edge.target, {
        label: createEdgeLabelHTML(edge),
        labelType: "html",
        debug_file: edge.debug_file,
        labelStyle: "background: #f5f5f5; border-radius: 3px; border-width: 1px; color: #16191c; padding: 6px; opacity: 0.8;",
        labelpos: 'c',
        curve: d3.curveBasis
    }, edge.source + "_" + edge.label + "_" + edge.target)});

    // Set some general styles
    g.nodes().forEach(function(v) {
        let node = g.node(v);
        if (node.label.includes("StorageNode")){
            node.style = "fill: #00AEEF";
        }

        node.rx = node.ry = 5;
    });

    g.edges().forEach(function(v) {
        let edge = g.edge(v);
        //$("ul").find(`[debug_file='${edge.debug_file}']`)
    });

    let svg = d3.select("svg"),
        inner = svg.select("g");
    // Set up zoom support
    let zoom = d3.zoom().on("zoom", function() {
        inner.attr("transform", d3.event.transform);
    });
    svg.call(zoom);

    let render = new dagreD3.render();
    // Run the renderer. This is what draws the final graph.
    render(inner, g);

    inner.selectAll("g.node")
        .attr("description", function(v) { return g.node(v).description; })
        .on('mouseenter', function (d, i) {
            //$(this).find( "text" ).html("<b>test</b>");
            console.log($(this).attr("description"));
        });
    // Center the graph
    let initialScale = 0.85;
    svg.call(zoom.transform, d3.zoomIdentity.translate((svg.attr("width") - g.graph().width * initialScale) / 2, 20).scale(initialScale));
    // svg.on('.zoom', null);
    svg.attr('height', g.graph().height * initialScale + 40);

    $('.cluster rect').attr("rx", 15);
    $('.cluster rect').attr("ry", 15);
}

const graphName = $('h1').html();
console.log(graphName);

d3.json("../static/json/" + graphName + ".json", function(error, json_obj) {
    if (error) {
        console.log(error);
        throw error;
    }

    let graph = json_obj.graph;

    const nodeIds = graph.nodes.map(node => node.id);
    const nodeDuplicates = _.filter(nodeIds, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
    const subGraphNames = graph.sub_graphs.map(subGraph => subGraph.name);
    const subGraphDuplicates = _.filter(subGraphNames, (val, i, iteratee) => _.includes(iteratee, val, i + 1));

    if (nodeDuplicates.length > 0) {
        $('body').html('Duplicate node ids detected: ' + nodeDuplicates);
    } else if (subGraphDuplicates.length > 0){
        $('body').html('Duplicate graph names detected: ' + subGraphDuplicates);
    } else {
        drawGraph(graph.nodes, graph.edges, graph.sub_graphs);
    }
});