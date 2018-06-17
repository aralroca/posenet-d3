import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import * as d3 from 'd3';

export default class SVGGraph extends Component {
  shouldComponentUpdate = () => false;

  componentDidMount() {
    this.draw();
    window.addEventListener('resize', this.redraw);
  }

  componentWillReceiveProps() {
    this.redraw();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.redraw);
  }

  containerSize() {
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }
  }

  redraw = () => {
    if (this.svg) {
      this.svg.selectAll('*').remove();
    }

    this.draw();
  }

  draw() {
    const { nodes, links } = this.props.graph;
    const { width, height } = this.containerSize();
    this.svg = d3.select(this.mySvg)
      .attr('width', width)
      .attr('height', height);

    const node = this.svg.append('g')
      .selectAll('g')
      .data(nodes, d => d.id)
      .enter()
      .append('g')

    const circles = node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', '#1565c0');

    const link = this.svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#1565c0')
      .attr('stroke-width', 5)

   const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))  
      .force('center', d3.forceCenter(width / 2, height / 2));

    const ticked = () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
      }

    simulation
      .nodes(nodes)
      .on('tick', ticked)

    simulation
      .force('link')
      .links(links);
  }

  render() {
    return (
      <div
        className="container"
        ref={ref => { this.container = ref; }}
      >
        <svg ref={ref => { this.mySvg = ref;  }} />
      </div>
    );
  }
}

SVGGraph.propTypes = {
  graph: PropTypes.object,
};

SVGGraph.defaultProps = {
  graph: { nodes: [], links: [] },
};
