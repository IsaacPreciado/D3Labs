var margin = {top: 20, right: 300, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        "," + margin.top + ")");

var parseDate = d3.timeParse('%Y');
var formatSi = d3.format(".3s");
var formatNumber = d3.format(".1f"),
    formatBillion = (x) => { return formatNumber(x / 1e9); };

var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);
var color = d3.scaleOrdinal(d3.schemeSpectral[11]);

var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft().tickFormat(formatBillion);

var area = d3.area()
    .x(function(d) { return x(d.data.date); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

var stack = d3.stack()
    .keys([])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis");
        
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Billions of liters");

var legend = g.append("g")
    .attr("transform", "translate(" + (width + 150) + 
        "," + (height - 210) + ")");

d3.csv('data/stacked_area2.csv').then((data) => {

    color.domain(d3.keys(data[0]).filter((key) => { 
        return key !== 'date'; 
    }));
        
    var keys = color.domain();
    
    data.forEach((d) => {
        d.date = parseDate(d.date);
    });

    var maxDateVal = d3.max(data, (d) => {
        var vals = d3.keys(d).map((key) => { 
            return key !== 'date' ? d[key] : 0;
        });
        return d3.sum(vals);
    });

    x.domain(d3.extent(data, (d) => { return d.date; }));
    y.domain([0, maxDateVal]);

    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));


    stack.keys(keys);

    var stackedData = stack(data);

    g.selectAll(".area")
        .data(stackedData)
        .enter().append("path")
        .attr("class", "area")
        .attr("d", area)
        .style("fill", function(d, i) { return color(keys[i]); });

    var legendItems = legend.selectAll(".legend-item")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legendItems.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d); });

    legendItems.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

}).catch((error) => {
    console.log(error);
});
