function updateTradeBalanceChart(div_name) {
    var csvFile = "data/trade-balance-final.csv";

    var svg = d3.select(div_name).select("svg");

    var height = +svg.attr("height"),
        width = +svg.attr("width");

    // Map and projection
    var path = d3.geoPath();
    var projection = d3
        .geoNaturalEarth1()
        .scale(width / 2 / Math.PI)
        .translate([width / 2, height / 2]);
    var path = d3.geoPath().projection(projection);

    // Data and color scale
    var data_trade_balance = {};
    var colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([-1, 1]);

    // Load external data and boot
    d3.queue()
        .defer(
            d3.json,
            "https://enjalot.github.io/wwsd/data/world/world-110m.geojson"
        )
        .defer(d3.csv, csvFile, function(d) {
            data_trade_balance[d.country_code] = {
                balance: +d.trade_balance, // Negative implies more import
                import: +d.import,
                export: +d.export,
                country: d.country_name
            };
        })
        .await(ready);

    function ready(error, world) {
        if (error) throw error;

        // A little function to right align numbers
        var numFormat = function(num) {
            return d3
                .format("$12,.2f")(num)
                .replace(/ /g, "&nbsp;");
        };
        // Draw the map
        var worldMap = svg
            .append("g")
            .attr("class", "countries") //TODO: Check if this class has been added
            .selectAll("path")
            .data(world.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "white")
            .on("mouseover", function(d, i) {
                if (d.import == undefined) return;
                d3.select(this).attr("fill", "gray");
                d3.select(".tooltip")
                    .style("opacity", 1)
                    .style("left", d3.event.pageX + 10 + "px")
                    .style("top", d3.event.pageY - 20 + "px")
                    .html(
                        "<b>" +
                            d.country +
                            "</b>" +
                            "<br/>Import:" +
                            numFormat(d.import) +
                            "M" +
                            "<br/>Export:" +
                            numFormat(d.export) +
                            "M</span>"
                    ); // Tooltip format
            })
            .on("mouseout", function(d, i) {
                if (d.import == undefined) return;
                d3.select(this).attr("fill", colorScale(d.trade_balance));
                d3.select(".tooltip").style("opacity", 0);
            });

        worldMap
            .transition()
            .duration(2000)
            .attr("fill", function(d) {
                // Pull out data item
                var dataItem = data_trade_balance[d.id];
                if (dataItem) {
                    // Pull data for this country
                    d.trade_balance = data_trade_balance[d.id].balance || 0;
                    d.country = data_trade_balance[d.id].country;
                    d.import = data_trade_balance[d.id].import;
                    d.export = data_trade_balance[d.id].export;
                    // Set the color
                    return colorScale(d.trade_balance);
                } else {
                    return "none";
                }
            });

        // -- Add Annotations --
        // Draw the map
        svg.append("g")
            .selectAll("text")
            .data(world.features)
            .enter()
            .append("text")
            .attr("x", function(d) {
                return path.centroid(d)[0] - 10;
            })
            .attr("y", function(d) {
                return path.centroid(d)[1];
            })
            .text(function(d) {
                // Pull out data item
                if (d.trade_balance < -0.8) {
                    return d.properties.name;
                }
            })
            .style("font-size", "10px")
            .attr("fill", "black");

        // ---- DRAW THE LEGEND ----
        var legendSvg = svg
            .append("g")
            .attr("transform", "translate(" + 200 + "," + (height - 200) + ")");

        var legendDim = { width: 10, height: 150 };

        // Generate the data for plotting the legend
        var legendDataLength = 51;
        var legendData = (function() {
            var points = [];
            var scale = d3
                .scaleLinear()
                .range([-1, 1])
                .domain([0, legendDataLength]);
            for (let i = 0; i < legendDataLength; i++) {
                points.push(scale(i));
            }
            return points;
        })();

        // Define a scale for the bottom axis of the legend
        var legendScale = d3
            .scalePoint()
            .rangeRound([0, legendDim.height])
            .padding(0)
            .domain(["Mostly Import", "Balanced", "Mostly Export"]);

        // Draw the legend using colour scales
        legendSvg
            .selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("height", legendDim.height / legendDataLength)
            .attr("width", legendDim.width)
            .attr("y", function(d, i) {
                return i * (legendDim.height / legendDataLength);
            })
            .attr("fill", function(d, i) {
                return colorScale(d);
            });

        // Draw the legend bottom axis
        legendSvg
            .append("g")
            //.attr("transform", "translate(" + legendDim.width + ",0)")
            .call(d3.axisLeft(legendScale));
    }
}
