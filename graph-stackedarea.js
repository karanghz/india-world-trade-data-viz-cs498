function updateStackedAreaChart(div_name, graphType, trade_type) {
    var yAxisUpperBound = 550 * 1000; // We know the bounds of our data

    var csvFileList = {
        import: "./data/timeline-i-" + graphType + ".csv",
        export: "./data/timeline-e-" + graphType + ".csv",
        total: "./data/timeline-ie-" + graphType + ".csv" // not used
    };

    var csvFile = csvFileList[trade_type];

    var svg = d3.select(div_name).select("svg");
    svg.selectAll("svg > *").remove(); // cleans up SVG

    var margin = {
        top: 50,
        bottom: 50,
        right: 150,
        left: 100
    };

    var height = +svg.attr("height") - margin.top - margin.bottom,
        width = +svg.attr("width") - margin.left - margin.right;

    var svgInner = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create X axis scale
    var xScale = d3
        .scaleLinear()
        .rangeRound([0, width])
        .domain([2009, 2018]); // We know the bounds of our data

    // Create Y axis scale
    var yScale = d3
        .scaleLinear()
        .rangeRound([height, 0])
        .domain([0, yAxisUpperBound]);

    // Define the  line/area generator
    var pathGenerator = d3
        .area()
        .x(function(d) {
            return xScale(d.year);
        })
        .y1(function(d) {
            return yScale(d.stackValueUpper);
        })
        .y0(function(d) {
            return yScale(d.stackValueLower);
        });

    // Draw the X axis
    svgInner
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    // add the X gridlines
    svgInner
        .append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(
            d3
                .axisBottom(xScale)
                .tickFormat("")
                .tickSize(-height)
        );

    // Draw the Y axis
    svgInner
        .append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Trade Value (Millon $)");

    // Converts strings to numeric type
    var typeConvert = function(d) {
        d.year = +d.year;
        d.export = +d.export;
        d.import = +d.import;
        d.total = +d.total;
        // Store the current column of interest in a separate variable
        d.value = +d[trade_type];
        return d;
    };

    // ---- READ FROM CSV ---
    d3.csv(csvFile, typeConvert, function(error, data) {
        var drawGlyphs = function(chartData, color, pathGenerator, index) {
            // Draw the glyphs
            var glyph = svgInner
                .append("path")
                .datum(chartData)
                .style("fill", "white")
                .style("stroke", "gray")
                .style("stroke-width", 0.3)
                .style("opacity", 0.8)
                .attr("d", pathGenerator);

            glyph
                .transition()
                .duration(500 + 200 * (21 - index))
                .style("fill", color);

            glyph
                .on("mouseover", function(d, i) {
                    // Note that d is an array of objects
                    d3.select(this).style("opacity", 1);
                    d3.select(".tooltip")
                        .style("opacity", 1)
                        .style("left", d3.event.pageX + 10 + "px")
                        .style("top", d3.event.pageY - 20 + "px")
                        .html("<b>" + d[0][graphType]); // Tooltip format
                })
                .on("mouseout", function(d, i) {
                    d3.select(this).style("opacity", 0.8);
                    d3.select(".tooltip").style("opacity", 0);
                });
        };

        // Create a data structure indexed on country/commodity
        // This operation also takes care of the stack values
        var yearStackValues = {};
        var dataList = (function(data) {
            var list = {};
            for (let i = 0; i < data.length; i++) {
                // Generate stack value
                if (yearStackValues[data[i].year] == undefined) {
                    yearStackValues[data[i].year] = 0;
                }
                data[i].stackValueLower = yearStackValues[data[i].year]; //Lower (previous stack value)
                yearStackValues[data[i].year] += data[i].value;
                data[i].stackValueUpper = yearStackValues[data[i].year]; //Upper (updated stack value)

                // Push data values
                if (list[data[i][graphType]] == undefined) {
                    list[data[i][graphType]] = [];
                }
                list[data[i][graphType]].push(data[i]);
            }
            return list;
        })(data);

        // Define colour scheme
        var categoryColorScheme = function(key, rank) {
            var color = coColorPalette[graphType][key];
            if (color != undefined && rank <= 10) {
                return color; // Return as per the config
            } else if (key.includes("OTHERS")) {
                return "#f2f2f2"; // Return a lighter shade for 'OTHERS'
            } else {
                return "lightgray"; // This is for everything else
            }
        };

        /* var categoryColorSchemecategoryColorPalette.slice();
        for (let i = 0; i < 10; i++) {
            categoryColorScheme.push("lightgray");
        }
        categoryColorScheme.push("#f2f2f2");

        categoryColorScheme.reverse(); */

        // Loop through all commodities/countries and draw glyohs
        var i = 0;
        for (const category in dataList) {
            if (dataList.hasOwnProperty(category)) {
                var dataset = dataList[category]; //an array of data
            }
            drawGlyphs(
                dataset,
                categoryColorScheme(category, dataset[0].rank),
                pathGenerator,
                i
            );
            i++;
        }

        // Create Legend
        var legendSvg = svgInner
            .append("g")
            .attr("transform", "translate(" + (width + 20) + "," + 20 + ")");

        var legendData = (function(dataList) {
            var list = [];
            var i = 0;
            for (const key in dataList) {
                if (dataList.hasOwnProperty(key)) {
                    list.push({
                        color: categoryColorScheme(key, dataList[key][0].rank),
                        text: key,
                        shorttext: truncate(key)
                    });
                }
            }
            return list;
        })(dataList).reverse();

        var tooltipMouseover = function(d, i) {
            d3.select(this).style("opacity", 1);
            d3.select(".tooltip")
                .style("opacity", 1)
                .style("left", d3.event.pageX + 10 + "px")
                .style("top", d3.event.pageY - 20 + "px")
                .html("<b>" + d.text); // Tooltip format
        };

        var tooltipMouseout = function(d, i) {
            d3.select(this).style("opacity", 0.8);
            d3.select(".tooltip").style("opacity", 0);
        };

        legendSvg
            .selectAll("circle")
            .data(legendData)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("cy", function(d, i) {
                return i * 12;
            })
            .attr("fill", function(d) {
                return d.color;
            })
            .on("mouseover", tooltipMouseover)
            .on("mouseout", tooltipMouseout);

        legendSvg
            .selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", 10)
            .style("font-size", "0.7em")
            .style("textOverflow", "ellipsis")
            .attr("y", function(d, i) {
                return 5 + i * 12;
            })
            .text(function(d) {
                return d.shorttext;
            })
            .on("mouseover", tooltipMouseover)
            .on("mouseout", tooltipMouseout);
    });
}

// A utility function to truncate a string
function truncate(string) {
    if (string.length > 15) return string.substring(0, 15) + "...";
    else return string;
}
