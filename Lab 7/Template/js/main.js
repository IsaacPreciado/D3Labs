var margin = { top: 20, right: 30, bottom: 40, left: 40 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var flag = true;

var g = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var x = d3.scaleBand().range([0, width]).padding(0.2);
var y = d3.scaleLinear().range([height, 0]);

var xAxisGroup = g.append("g").attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")");
var yAxisGroup = g.append("g").attr("class", "y-axis");

var yLabel = g.append("text")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("transform", "rotate(-90)")
    .attr("dy", ".71em")
    .style("text-anchor", "middle")
    .text("Revenue");

function update(data) {
    var value = flag ? "revenue" : "profit";

    x.domain(data.map((d) => d.month));
    y.domain([0, d3.max(data, (d) => d[value])]);

    xAxisGroup.call(d3.axisBottom(x));
    yAxisGroup.call(d3.axisLeft(y));

    var bars = g.selectAll("rect")
        .data(data, (d) => d.month); // Add key function for smooth transitions

    bars.exit().remove();

    bars.attr("x", (d) => x(d.month))
        .attr("y", (d) => y(d[value]))
        .attr("width", x.bandwidth)
        .attr("height", (d) => height - y(d[value]));

    bars.enter().append("rect")
        .attr("x", (d) => x(d.month))
        .attr("y", (d) => y(d[value]))
        .attr("width", x.bandwidth)
        .attr("height", (d) => height - y(d[value]))
        .attr("fill", "yellow");

    var label = flag ? "Revenue" : "Profit";
    yLabel.text(label);
}

d3.json("data/revenues.json").then((data) => {
    data.forEach((d) => {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    update(data);

    d3.interval(() => {
        var newData = flag ? data : data.slice(1); // Remove January when showing profit
        update(newData);
        flag = !flag;
    }, 1000);

}).catch((error) => {
    console.log(error);
});
