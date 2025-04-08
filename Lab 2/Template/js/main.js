var svg = d3.select("#chart-area")
            .append("svg")
            .attr("width", 400)
            .attr("height", 400);

var data = [25, 20, 15, 10, 5];

svg.selectAll("rect")
   .data(data)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
       return i * 50;
   })
   .attr("y", function(d) {
       return 400 - d;
   })
   .attr("width", 40)
   .attr("height", function(d) {
       return d;
   })
   .attr("fill", "steelblue");
