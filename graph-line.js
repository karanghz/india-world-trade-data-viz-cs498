function updateLineChart(div_name, outsideData, useLogScale) {
    var csvFile = "data/timeline-ie-all.csv";

    var svg = d3.select(div_name).select("svg");
    svg.selectAll("svg > *").remove(); // cleans up SVG

    var margin = { top: 50, bottom: 50, right: 150, left: 100 };

    var height = +svg.attr("height") - margin.top - margin.bottom,
        width = +svg.attr("width") - margin.left - margin.right;

    var svgInner = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Converts strings to numeric type
    var typeConvert = function(d) {
        d.year = +d.year;
        d.export = +d.export;
        d.import = +d.import;
        d.deficit = +d.deficit;
        return d;
    };

    // Create X axis scale
    var xScale = d3
        .scaleLinear()
        .rangeRound([0, width])
        .domain([2009, 2018]); // We know the bounds of our data

    // Create Y axis scale
    var yScale = d3.scaleLinear();
    if (useLogScale != undefined && useLogScale) {
        yScale = d3.scaleLog();
    }

    var domainMax = 550 * 1000;
    if (outsideData != undefined) {
        domainMax =
            d3.max(outsideData, function(d) {
                return d3.max([d.export, d.import]);
            }) * 1.05;
    }

    var yScale = yScale.rangeRound([height, 0]).domain([0.01, domainMax]); // We know the bounds of our data

    // Define the initial line generator
    // This is used for animation
    var lineInit = d3
        .line()
        .x(function(d) {
            return xScale(d.year);
        })
        .y(function(d) {
            return yScale(height);
        });

    // Define the export line generator
    var lineExport = d3
        .line()
        .x(function(d) {
            return xScale(d.year);
        })
        .y(function(d) {
            return yScale(d.export);
        });

    // Define the import line generator
    var lineImport = d3
        .line()
        .x(function(d) {
            return xScale(d.year);
        })
        .y(function(d) {
            return yScale(d.import);
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
        .call(
            d3.axisLeft(yScale)
            //.tickFormat(d3.format(","))
            //.tickArguments([10])
            //.tickPadding(3)
        )
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Trade Value (Million $)");

    // Function that plots the graph
    var plotGraph = function(error, data) {
        var drawLineCircle = function(lineGenerator, color, lineType) {
            // Draw the Line
            svgInner
                .append("path")
                .datum(data)
                .attr("class", "line")
                .attr("stroke", color)
                .attr("d", lineInit)
                .transition()
                .duration(1000)
                .attr("d", lineGenerator);

            //Draw the Bullet Points
            var bulletPoints = svgInner
                .append("g")
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("r", 5)
                .attr("fill", color)
                .attr("cx", function(d, i) {
                    return xScale(d.year);
                })
                .attr("cy", function(d, i) {
                    return yScale(0);
                })
                .on("mouseover", function(d, i) {
                    d3.select(this).attr("r", 10);
                    d3.select(".tooltip")
                        .style("opacity", 1)
                        .style("left", d3.event.pageX + 10 + "px")
                        .style("top", d3.event.pageY - 20 + "px")
                        .html("$" + d3.format(",")(d[lineType]) + "M"); // Tooltip format
                    console.log(d3.event.pageX);
                })
                .on("mouseout", function(d, i) {
                    d3.select(this)
                        .attr("r", 5)
                        .select("text")
                        .remove();
                    d3.select(".tooltip").style("opacity", 0);
                });

            bulletPoints
                .transition()
                .duration(1000)
                .attr("cy", function(d, i) {
                    return yScale(d[lineType]);
                });
        };

        // Draw import/export lines
        drawLineCircle(lineImport, "darkred", "import");
        drawLineCircle(lineExport, "darkgreen", "export");

        // Create Legend
        var legendSvg = svgInner
            .append("g")
            .attr("transform", "translate(" + (width + 20) + "," + 20 + ")");

        var legendData = [
            { color: "darkred", text: "Import" },
            { color: "darkgreen", text: "Export" }
        ];

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
            });

        legendSvg
            .selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", 10)
            .style("font-size", "0.7em")
            .attr("y", function(d, i) {
                return 5 + i * 12;
            })
            .text(function(d) {
                return d.text;
            });

        // Add Annotations
        var annotSvg = svgInner.append("g");

        annotSvg // Upper line
            .append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .style("font-size", "0.8em")
            .attr("x", function(d, i) {
                return xScale(d.year);
            })
            .attr("y", height - 40)
            .text(function(d) {
                return d.annotation_l1;
            });

        annotSvg // Lower Line
            .append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .style("font-size", "0.8em")
            .attr("x", function(d, i) {
                return xScale(d.year);
            })
            .attr("y", height - 27)
            .text(function(d) {
                return d.annotation_l2;
            });

        var annotData = data.filter(function(d) {
            return d.annotation_l1 != undefined && d.annotation_l1 != "";
        });
        annotSvg // Pointer Line
            .append("g")
            .selectAll("line")
            .data(annotData)
            .enter()
            .append("line")
            .attr("x1", function(d, i) {
                return xScale(d.year) + 20;
            })
            .attr("x2", function(d, i) {
                return xScale(d.year);
            })
            .attr("y1", height - 50)
            .attr("y2", function(d) {
                return yScale(d.export) + 10;
            })
            .style("stroke-width", "1px")
            .style("stroke", "black");
    };

    // Check if outside data is available,
    // if not, read from remote csv

    if (outsideData == undefined) {
        d3.csv(csvFile, typeConvert, plotGraph);
    } else {
        plotGraph({}, outsideData);
    }
}
