d3.json('data/data.json').then(function(data) {
	const formattedData = data.map((yearEntry) => {
		return yearEntry.countries.filter(country => {
			return country.income != null &&
				   country.life_exp != null &&
				   country.population != null &&
				   country.continent != null;
		}).map(country => {
			country.income = +country.income;
			country.life_exp = +country.life_exp;
			country.population = +country.population;
			return country;
		});
	});

	const allContinents = Array.from(new Set(
		formattedData.flat().map(d => d.continent)
	));

	const margin = { top: 50, right: 150, bottom: 80, left: 100 };
	const width = 800 - margin.left - margin.right;
	const height = 500 - margin.top - margin.bottom;

	const svg = d3.select('body')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	const xScale = d3.scaleLog()
		.domain([142, 150000])
		.range([0, width]);

	const yScale = d3.scaleLinear()
		.domain([0, 90])
		.range([height, 0]);

	const areaScale = d3.scaleLinear()
		.domain([2000, 1400000000])
		.range([25 * Math.PI, 1500 * Math.PI]);

	const colorScale = d3.scaleOrdinal()
		.domain(allContinents)
		.range(d3.schemePastel1);

	const xAxis = d3.axisBottom(xScale)
		.tickValues([400, 4000, 40000])
		.tickFormat(d3.format("$,.0f"));

	const yAxis = d3.axisLeft(yScale);

	svg.append('g')
		.attr('class', 'x-axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);

	svg.append('g')
		.attr('class', 'y-axis')
		.call(yAxis);

	svg.append('text')
		.attr('class', 'axis-label x-axis-label')
		.attr('x', width / 2)
		.attr('y', height + margin.bottom - 10)
		.style('text-anchor', 'middle')
		.text('Income (log scale)');

	svg.append('text')
		.attr('class', 'axis-label y-axis-label')
		.attr('transform', 'rotate(-90)')
		.attr('y', -margin.left + 40)
		.attr('x', -height / 2)
		.style('text-anchor', 'middle')
		.text('Life Expectancy');

	const yearLabel = svg.append('text')
		.attr('class', 'year-label')
		.attr('x', width - 10)
		.attr('y', -10)
		.style('text-anchor', 'end')
		.text('Year: 1800');

	const legend = svg.append('g')
		.attr('class', 'legend')
		.attr('transform', `translate(${width + 20}, 20)`);

	const legendEntries = legend.selectAll('.legend-entry')
		.data(allContinents)
		.enter().append('g')
		.attr('class', 'legend-entry')
		.attr('transform', (d, i) => `translate(0, ${i * 20})`);

	legendEntries.append('rect')
		.attr('width', 18)
		.attr('height', 18)
		.attr('fill', d => colorScale(d));

	legendEntries.append('text')
		.attr('x', 24)
		.attr('y', 9)
		.attr('dy', '0.35em')
		.text(d => d)
		.style('font-size', '12px');

	let currentIndex = 0;
	function update() {
		const currentYearData = formattedData[currentIndex];
		const year = data[currentIndex].year;

		yearLabel.text(`Year: ${year}`);

		const circles = svg.selectAll('circle')
			.data(currentYearData, d => d.country);

		circles.exit()
			.transition().duration(1000)
			.attr('r', 0)
			.remove();

		const enter = circles.enter()
			.append('circle')
			.attr('cx', d => xScale(d.income))
			.attr('cy', d => yScale(d.life_exp))
			.attr('r', 0)
			.attr('fill', d => colorScale(d.continent));

		enter.merge(circles)
			.transition().duration(1000)
			.attr('cx', d => xScale(d.income))
			.attr('cy', d => yScale(d.life_exp))
			.attr('r', d => Math.sqrt(areaScale(d.population) / Math.PI));

		currentIndex = (currentIndex + 1) % data.length;
	}

	update();

	setInterval(update, 1000);
});
