var svg = d3.select("#chart-area")
            .append("svg")
            .attr("width", 500)
            .attr("height", 500);

d3.csv("data/ages.csv").then((data) => {
    console.log("CSV:", data);
}).catch((error) => {
    console.log("CSV error:", error);
});

d3.tsv("data/ages.tsv").then((data) => {
    console.log("TSV:", data);
}).catch((error) => {
    console.log("TSV error:", error);
});

d3.json("data/ages.json").then((data) => {
    data.forEach((d) => {
        d.age = +d.age;
    });

    console.log("JSON:", data);

    svg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", (d, i) => (i * 60) + 50)
       .attr("cy", 250)
       .attr("r", (d) => d.age * 2)
       .attr("fill", (d) => d.age > 10 ? "tomato" : "steelblue");

}).catch((error) => {
    console.log("JSON error:", error);
});
