class GraphVisualizer {
    constructor() {
        this.svg = d3.select('#graph');
        this.width = +this.svg.attr('width');
        this.height = +this.svg.attr('height');
        this.color = d3.scaleOrdinal(d3.schemeCategory20);
        this.simulation = null;

        this.initSimulation();
    }

    initSimulation() {
        const nodeRadius = 5;

        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink()
                .id(d => d.id)
                .distance(20)
                .strength(0.4)
            )
            .force('charge', d3.forceManyBody().strength(-70))
            .force('collision', d3.forceCollide()
                .radius(nodeRadius + 4)
                .strength(0.7)
            )
            .force('x', d3.forceX(this.width / 2).strength(0.04))
            .force('y', d3.forceY(this.height / 2).strength(0.04))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2));
    }

    render(graphData) {
        this.svg.selectAll('*').remove();

        const { nodes, links } = graphData;

        const linkGroup = this.svg.append('g')
            .attr('class', 'links');

        const link = linkGroup.selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke-width', d => Math.sqrt(d.value));

        const nodeGroup = this.svg.append('g')
            .attr('class', 'nodes');

        const node = nodeGroup.selectAll('g')
            .data(nodes)
            .enter()
            .append('g');

        const circles = node.append('circle')
            .attr('r', 5)
            .attr('fill', d => this.color(d.group))
            .call(d3.drag()
                .on('start', d => this.dragStarted(d))
                .on('drag', d => this.dragged(d))
                .on('end', d => this.dragEnded(d))
            );

        const labels = node.append('text')
            .text(d => d.id)
            .attr('x', 6)
            .attr('y', 3);

        node.append('title')
            .text(d => d.id);

        this.simulation
            .nodes(nodes)
            .on('tick', () => this.ticked(link, node));

        this.simulation.force('link')
            .links(links);

        this.simulation.alpha(1).restart();
    }

    ticked(link, node) {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node.attr('transform', d => `translate(${d.x},${d.y})`);
    }

    dragStarted(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    dragEnded(d) {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.visualizer = new GraphVisualizer();
});
