// Cargar el archivo JSON
d3.json("data/revenues.json").then(function(data) {
    // Convertir las cadenas a números y asegurarnos de que los valores existen
    data.forEach(function(d) {
        d.revenue = +d.revenue;  // Convertir a número
        d.profit = +d.profit;    // Convertir a número
    });

    // Configuración de márgenes, ancho y alto del gráfico
    var margin = { top: 20, right: 30, bottom: 40, left: 40 },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Crear el contenedor SVG para el gráfico
    var svg = d3.select("#chart-area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Crear las escalas para los ejes
    var x = d3.scaleBand().range([0, width]).padding(0.2);
    var y = d3.scaleLinear().range([height, 0]);

    // Crear los ejes
    var xAxisGroup = svg.append("g").attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")");
    var yAxisGroup = svg.append("g").attr("class", "y-axis");

    // Etiqueta del eje Y
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Revenue");

    // Función para actualizar el gráfico
    function update(data) {
        // Actualizar las escalas
        x.domain(data.map(function(d) { return d.month; }));
        y.domain([0, d3.max(data, function(d) { return d.revenue; })]);

        // Actualizar los ejes
        xAxisGroup.call(d3.axisBottom(x));
        yAxisGroup.call(d3.axisLeft(y));

        // Crear los rectángulos para las barras
        var bars = svg.selectAll("rect")
            .data(data);

        // Eliminar barras antiguas
        bars.exit().remove();

        // Actualizar las barras existentes
        bars.attr("x", function(d) { return x(d.month); })
            .attr("y", function(d) { return y(d.revenue); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.revenue); })
            .attr("fill", "orange");

        // Agregar nuevas barras
        bars.enter().append("rect")
            .attr("x", function(d) { return x(d.month); })
            .attr("y", function(d) { return y(d.revenue); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d.revenue); })
            .attr("fill", "orange");
    }

    // Inicializar el gráfico
    update(data);
}).catch(function(error) {
    console.log(error);
});
