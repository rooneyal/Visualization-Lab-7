Promise.all([
    d3.json('airports.json'),
    d3.json('world-110m.json')
])

.then(data => {
    let airports = data[0];
	let worldmap = data[1];

let margin = { top: 40, right: 20, bottom: 40, left: 90 },
width = 600 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;
     
width = width > 600 ? 600 : width;


let svg = d3.select(".chart").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

const details = topojson.feature(data[1], data[1].objects.countries).features;
const future = d3.geoMercator()
    .fitExtent([[0,0], [width, height]], topojson.feature(data[1], data[1].objects.countries));

const Paths = d3.geoPath()
    .projection(future);

svg.selectAll('Paths')
    .data(details)
    .join('Paths')
    .attr('d', Paths)
    .attr('fill', 'black');

svg.append('Paths')
    .datum(topojson.mesh(data[1], data[1].objects.countries))
    .attr('d', Paths)
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-linejoin', 'round');


const passengersList = []
      for (i = 0; i < airports.nodes.length; i++) {
        passengersList.push(airports.nodes[i].passengers);
      }

let circleScale = d3.scaleLinear()
  .domain(d3.extent(passengersList))
  .range([4, 9])

let force = d3.forceSimulation(data[0].nodes)
  .force("charge", d3.forceManyBody().strength(-25))
  .force("link", d3.forceLink(airports.links).distance(50))
  .force("center",d3.forceCenter()
      .x(width / 2)
      .y(height / 2)
  )

change = 'force';
    VisChange()

    function VisChange() {
      
        if (change === 'map') {

            ForcedLinks = svg.selectAll('.chart')
                .data(data[0].links)
                .enter()
                .append('line')
                .attr('class', 'force')
                .attr('x1', (d)=> (d.source.x))
                .attr('y1',(d) => (d.source.y))
                .attr('x2', (d) => (d.target.x))
                .attr('y2',(d) => (d.target.y))
                .transition()
                .duration(1200)
                .attr('stroke', 'black')
                .attr('x1', function(d) {
                    return future([d.source.longitude, d.source.latitude])[0];
                })
                .attr('y1', function(d) {
                    return future([d.source.longitude, d.source.latitude])[1];
                })
                .attr('x2', function(d) {
                    return future([d.target.longitude, d.source.latitude])[0];
                })
                .attr('y2', function(d) {
                    return future([d.targer.longitude, d.target.latitude])[1];
                })


            let Links = svg.selectAll('.chart')
                .data(data[0].links)
                .enter()
                .append('line')
                .attr('stroke', 'black')
                .attr('x1', function(d) {
                    return d.source.x;
                })
                .attr('y1', function(d) {
                    return d.source.y;
                })
                .attr('x2', function(d) {
                    return d.target.x;
                })
                .attr('y2', function(d) {
                    return d.target.y;
                })
                .transition()
                .duration(2000)
                .attr('x1', function(d) {
                    return future([d.source.longitude, d.source.latitude])[0];
                })
                .attr('y1', function(d) {
                    return future([d.source.longitude, d.source.latitude])[1];
                })
                .attr('x2', function(d) {
                    return future([d.target.longitude, d.target.latitude])[0];
                })
                .attr('y2', function(d) {
                    return future([d.target.longitude, d.target.latitude])[1];
                })


            let Nodes = svg.selectAll('.chart')
                .data(data[0].nodes)
                .enter()
                .append('circle')
                .attr('class', 'map')
                .attr('cx', (d,i)=>(d.x))
                .attr('cy', (d,i)=>(d.y))
                .attr('fill', 'orange') 
                .attr('r',d=>circleScale(d.passengers))
                .on('mouseenter', (event, d) => {
                    const position = d3.pointer(event, window)
                    d3.selectAll('.tooltip')
                        .style('display', 'inline-block')
                        .style('position', 'fixed')
                        .style('top', pos[1]+'px')
                        .style('left', pos[0]+'px')
                        .html( d.name)
                })
                .on('mouseleave', (event, d) => {
                    d3.selectAll('.tooltip')
                        .style('display', 'none')
                })
                .transition()
                .duration(2000)
                .attr('cx', function(d) {
                    return future([d.longitude, d.latitude])[0];
                })
                .attr('cy', function(d) {
                    return future([d.longitude, d.latitude])[1];
                })
    
        svg.selectAll('Paths')
            .attr('opacity', 0);


        svg.selectAll('.force').remove()

        force.alpha(0.5).stop();

        force.on("tick", () => {
            Links
            .attr('x1', function(d) {
                return future([d.source.longitude, d.source.latitude])[0];
            })
            .attr('y1', function(d) {
                return future([d.source.longitude, d.source.latitude])[1];
            })
            .attr('x2', function(d) {
                return future([d.target.longitude, d.target.latitude])[0];
            })
            .attr('y2', function(d) {
                return future([d.target.longitude, d.target.latitude])[1];
            });


        Nodes
        .attr('transform', function(d) {
            return "translate(" + future([d.longiitude, d.latitude]) + ")";
        })

        dragfilter(event => change === 'force')
    });

    svg.selectAll('Paths')
        .transition()
        .delay(1000)
        .attr('opacity', 1)
    } else {
        svg.selectAll('.map').remove()

        drag = force => {


        function Start(event) {
            if (!event.active) force.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function Middle(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function End(event) {
            if (!event.active) force.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        
        return d3.drag()
            .on("start", Start)
            .on("drag", Middle)
            .on("end", End);
      }
    
        force.alpha(0.5).restart();

        let ForceLinks = svg.selectAll('.chart')
            .data(data[0].links)
            .enter()
            .append('line')
            .attr('class', 'force')
            .attr('stroke', 'black')
            .attr('x1', (d)=> (d.source.x))
            .attr('y1',(d) => (d.source.y))
            .attr('x2', (d) => (d.target.x))
            .attr('y2',(d) => (d.target.y))


        let ForcedNodes = svg.selectAll('.chart')
            .data(data[0].nodes)
            .enter()
            .append('circle')
            .attr('fill', 'orange')
            .attr('r', function(d) {
                return circleScale(d.passengers)
            })
            .attr('class', 'force')
            .attr('cx', (d,i) => (d.x))
            .attr('cy', (d,i) => (d.y))
            .call(drag(force));

        svg.selectAll('Paths')
            .attr('opacity', 0);

        force.on('tick'), () => {
           
        ForcedLinks
            .attr('x1', d => (d.source.x))
            .attr('y1', d => (d.source.y))
            .attr('x2', d => (d.target.x))
            .attr('y2', d => (d.target.y));

        ForcedNodes
            .attr('cx', d => (d.x))
            .attr('cy', d => (d.y))
        };
    }

}

d3.selectAll('input[name=display]').on('change', event => {
    force = event.target.value;
    VisChange();
});
        
})