d3.json('data/data.json').then(function(data) {
	// Clean and format data
	const formattedData = data.map((yearEntry, index) => {
		return {
			year: yearEntry.year,
			countries: yearEntry.countries.filter(country => {
				return country.income != null &&
					   country.life_exp != null &&
					   country.population != null &&
					   country.continent != null;
			}).map(country => {
				country.income = +country.income;
				country.life_exp = +country.life_exp;
				country.population = +country.population;
				return country;
			})
		};
	});

	// Extract all continents for color scale and filter
	const allContinents = Array.from(new Set(
		formattedData.flatMap(d => d.countries.map(c => c.continent))
	)).sort();

	// Populate continent filter dropdown
	const continentFilter = d3.select('#continentFilter');
	allContinents.forEach(continent => {
		continentFilter.append('option')
			.attr('value', continent)
			.text(continent);
	});

	// Setup SVG dimensions
	const margin = { top: 50, right: 150, bottom: 80, left: 100 };
	const width = 800 - margin.left - margin.right;
	const height = 500 - margin.top - margin.bottom;

	const svg = d3.select('body')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`);

	// Create scales
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

	// Create axes
	const xAxis = d3.axisBottom(xScale)
		.tickValues([400, 4000, 40000])
		.tickFormat(d3.format("$,.0f"));

	const yAxis = d3.axisLeft(yScale);

	// Append axes
	svg.append('g')
		.attr('class', 'x-axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis);

	svg.append('g')
		.attr('class', 'y-axis')
		.call(yAxis);

	// Add axis labels
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

	// Year label
	const yearLabel = svg.append('text')
		.attr('class', 'year-label')
		.attr('x', width - 10)
		.attr('y', -10)
		.style('text-anchor', 'end');

	// Create legend
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

	// Tooltip
	const tooltip = d3.select('#tooltip');

	// Animation control variables
	let currentIndex = 0;
	let isPlaying = false;
	let animationInterval;
	let filteredData = formattedData;

	// Update function
	function update(transition = true) {
		const currentYearData = filteredData[currentIndex];
		const year = currentYearData.year;

		// Update year display
		yearLabel.text(`Year: ${year}`);
		d3.select('#yearValue').text(year);
		d3.select('#yearSlider').property('value', currentIndex);

		// Filter data based on continent selection
		const continentFilterValue = d3.select('#continentFilter').property('value');
		const displayData = continentFilterValue === 'all' 
			? currentYearData.countries 
			: currentYearData.countries.filter(d => d.continent === continentFilterValue);

		const circles = svg.selectAll('circle')
			.data(displayData, d => d.country);

		// Exit
		circles.exit()
			.transition().duration(transition ? 500 : 0)
			.attr('r', 0)
			.remove();

		// Enter
		const enter = circles.enter()
			.append('circle')
			.attr('cx', d => xScale(d.income))
			.attr('cy', d => yScale(d.life_exp))
			.attr('r', 0)
			.attr('fill', d => colorScale(d.continent))
			.on('mouseover', function(event, d) {
				tooltip.transition()
					.duration(200)
					.style('opacity', .9);
				tooltip.html(`
					<strong>${d.country}</strong><br>
					Continent: ${d.continent}<br>
					Income: $${d3.format(',')(Math.round(d.income))}<br>
					Life Expectancy: ${d3.format('.1f')(d.life_exp)} years<br>
					Population: ${d3.format(',')(d.population)}
				`)
					.style('left', (event.pageX + 10) + 'px')
					.style('top', (event.pageY - 28) + 'px');
			})
			.on('mouseout', function() {
				tooltip.transition()
					.duration(500)
					.style('opacity', 0);
			});

		// Update
		const updateSelection = enter.merge(circles);
		
		if (transition) {
			updateSelection.transition().duration(500)
				.attr('cx', d => xScale(d.income))
				.attr('cy', d => yScale(d.life_exp))
				.attr('r', d => Math.sqrt(areaScale(d.population) / Math.PI));
		} else {
			updateSelection
				.attr('cx', d => xScale(d.income))
				.attr('cy', d => yScale(d.life_exp))
				.attr('r', d => Math.sqrt(areaScale(d.population) / Math.PI));
		}
	}

	// Play/Pause functionality
	function togglePlayPause() {
		isPlaying = !isPlaying;
		d3.select('#playPause').text(isPlaying ? 'Pause' : 'Play');
		
		if (isPlaying) {
			animationInterval = setInterval(() => {
				currentIndex = (currentIndex + 1) % filteredData.length;
				update();
				if (currentIndex === 0) clearInterval(animationInterval);
			}, 1000);
		} else {
			clearInterval(animationInterval);
		}
	}

	// Reset functionality
	function reset() {
		currentIndex = 0;
		isPlaying = false;
		clearInterval(animationInterval);
		d3.select('#playPause').text('Play');
		update(false);
	}

	// Filter functionality
	function applyFilter() {
		const continent = d3.select('#continentFilter').property('value');
		if (continent === 'all') {
			filteredData = formattedData;
		} else {
			filteredData = formattedData.map(yearData => {
				return {
					year: yearData.year,
					countries: yearData.countries.filter(d => d.continent === continent)
				};
			});
		}
		currentIndex = Math.min(currentIndex, filteredData.length - 1);
		update(false);
	}

	// Slider functionality
	function handleSliderChange() {
		currentIndex = +d3.select('#yearSlider').property('value');
		isPlaying = false;
		clearInterval(animationInterval);
		d3.select('#playPause').text('Play');
		update();
	}

	// Event listeners
	d3.select('#playPause').on('click', togglePlayPause);
	d3.select('#reset').on('click', reset);
	d3.select('#continentFilter').on('change', applyFilter);
	d3.select('#yearSlider').on('input', handleSliderChange);

	// Initialize slider max value
	d3.select('#yearSlider').attr('max', formattedData.length - 1);

	// Initial update
	update(false);
});