var svg = d3.select("#chart-area")
            .append("svg")
            .attr("width", 500)
            .attr("height", 500);

d3.json("data/buildings.json").then((data) => {
    data.forEach((d) => {
        d.height = +d.height;
    });

    var x = d3.scaleBand()
              .domain(data.map((d) => d.name))
              .range([0, 400])
              .paddingInner(0.3)
              .paddingOuter(0.3);

    var y = d3.scaleLinear()
              .domain([0, 828])
              .range([400, 0]);

    var color = d3.scaleOrdinal()
                  .domain(data.map((d) => d.name))
                  .range(d3.schemeSet3);

    svg.selectAll("rect")
       .data(data)
       .enter()
       .append("rect")
       .attr("x", (d) => x(d.name))
       .attr("y", (d) => y(d.height))
       .attr("width", x.bandwidth())
       .attr("height", (d) => 400 - y(d.height))
       .attr("fill", (d) => color(d.name));

}).catch((error) => {
    console.log("Error al cargar el archivo JSON:", error);
});
