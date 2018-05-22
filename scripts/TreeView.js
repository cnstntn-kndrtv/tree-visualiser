//let d3 = require('d3');

class TreeView {
    constructor(config, data) {
        this._i = 1;
        this.data = data;
        this.endOfWordMark = config.endOfWordMark;

        this.margin = {
            top: 20,
            right: 90,
            bottom: 30,
            left: 90
        }
        // config.width = config.width || 500;
        // config.height = config.height || 500;
        console.log(config);
        this.width = config.width - this.margin.left - this.margin.right,
        this.height = config.height - this.margin.top - this.margin.bottom;
        
        this._previousTransform = 0;
        this._zoom = d3.zoom()
            .scaleExtent([0.3, 2]) // min , max
            .on('zoom', () => this._zoomed(this))
            .on('end', () => this._zoomEnded(this));

        this.svg = d3.select(config.container).append("svg")
            .attr("width", this.width + this.margin.right + this.margin.left)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .call(this._zoom);
            
        this.canvas = this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            

        this.i = 0;
        this.duration = 750;
        this.treemap = d3.tree().size([this.height, this.width]);

        this.root = d3.hierarchy(this.data, (d) => {
            // return d.childNodes;
            let childs = [];
            for(let child in d.childNodes) {
                childs.push(d.childNodes[child]);
            }
            return childs;
        });
        this.root.x0 = this.height / 2;
        this.root.y0 = 0;
        // this.collapseAll();
        this.update(this.root);
    }

    collapseAll() {
        this.root.children.forEach((d) => this._collapse(d, this));
    }

    _collapse(d, that) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(() => that._collapse);
            d.children = null;
        }
    }

    update(source) {
        // Assigns the x and y position for the nodes
        this.treeData = this.treemap(this.root);
        // Compute the new tree layout.
        this.nodes = this.treeData.descendants(),
            this.links = this.treeData.descendants().slice(1);
        // Normalize for fixed-depth.
        this.nodes.forEach((d) => {
            d.y = d.depth * 100;
        });

        // update nodes
        this.node = this.canvas.selectAll('g.node')
            .data(this.nodes, (d) => {
                return d.id || (d.id = ++this._i);
            });

        // Enter any new modes at the parent's previous position.
        this.nodeEnter = this.node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', (d) => this._click(d, this));

        // Add Circle for the nodes
        this.nodeEnter.append('circle')
            .attr('class', (d) => {
                return (d.data.letter == this.endOfWordMark) ? 'node eof' : 'node';
            })
            .attr('r', 0)
            .style("fill", (d) => {
                return d._children ? "lightsteelblue" : "#fff";
            });
        
        // Add labels for the nodes
        this.nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", (d) => {
                return 0;
            })
            .attr("text-anchor", (d) => {
                return 'middle';
            })
            .text((d) => {
                let text = d.data.letter;
                if (d.data.childCount) {
                    text += ' -' + d.data.childCount;
                }
                return text;
            });
        
        // UPDATE
        this.nodeUpdate = this.nodeEnter.merge(this.node);

        // Transition to the proper position for the node
        this.nodeUpdate.transition()
            .duration(this.duration)
            .attr("transform", (d) => {
                return "translate(" + d.y + "," + d.x + ")";
            });
        // Update the node attributes and style
        this.nodeUpdate.select('circle.node')
            .attr('r', 20)
            .style("fill", (d) => {
                return d._children ? "lightsteelblue" : "#fff";
            })
            .attr('cursor', 'pointer');
        
        // Remove any exiting nodes
        this.nodeExit = this.node.exit().transition()
            .duration(this.duration)
            .attr("transform", (d) => {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();
        
        // On exit reduce the node circles size to 0
        this.nodeExit.select('circle')
            .attr('r', 1e-6);
        
        // On exit reduce the opacity of text labels
        this.nodeExit.select('text')
            .style('fill-opacity', 1e-6);
        
        // ****************** links section ***************************

        // Update the links...
        this.link = this.canvas.selectAll('path.link')
            .data(this.links, (d) => {
                return d.id;
            });

        // Enter any new links at the parent's previous position.
        this.linkEnter = this.link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', (d)  => {
                let o = {
                    x: source.x0,
                    y: source.y0
                }
                return this._diagonal(o, o)
            });
        
        // UPDATE
        this.linkUpdate = this.linkEnter.merge(this.link);

        // Transition back to the parent element position
        this.linkUpdate.transition()
            .duration(this.duration)
            .attr('d', (d) => {
                return this._diagonal(d, d.parent)
            });

        // Remove any exiting links
        this.linkExit = this.link.exit().transition()
            .duration(this.duration)
            .attr('d', (d) => {
                let o = {
                    x: source.x,
                    y: source.y
                }
                return this._diagonal(o, o)
            })
            .remove();
        
        // Store the old positions for transition.
        this.nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

    }

    // Creates a curved (diagonal) path from parent to the child nodes
    _diagonal(s, d) {
        let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`
        return path;
    }

    _click(d, that) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        that.update(d);
    }

    _zoomed(that) {
        let currentTransform = d3.event.transform;
        if (currentTransform.k > that._previousTransform.k) that.svg.style('cursor', 'zoom-in');
        if (currentTransform.k < that._previousTransform.k) that.svg.style('cursor', 'zoom-out');
        that._previousTransform = currentTransform;
        that.canvas.attr('transform', currentTransform);
    }

    _zoomEnded(that) {
        that.svg.style('cursor', 'default');
    }

}