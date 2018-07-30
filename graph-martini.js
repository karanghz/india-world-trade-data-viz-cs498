// Place for martini dataset
martiniDataset = [];

// Function to update martini dropdowns: country, commodity
var updateMartiniDropdown = function(type, codeField) {
    d3.csv("/data/martini/martini-" + type + "-selection.csv", function(data) {
        d3.select("#select-martini-" + type)
            .selectAll("option")
            .data(data)
            .enter()
            .append("option")
            .attr("value", function(d) {
                return d[codeField];
            })
            .attr("title", function(d) {
                return d[type];
            })
            .html(function(d) {
                return truncate(d[type]);
            });
    });
};

// Update COUNTRY dropdown
updateMartiniDropdown("commodity", "hscode");
// Update COMMODITY dropdown
updateMartiniDropdown("country", "ccode");

// Update the martini chart with the selection
function updateMartiniChart(div_name, country_code, commodity_code) {
    var csvFile = "/data/martini/martini-dataset.csv";
    // Converts strings to numeric type
    var typeConvert = function(d) {
        d.year = +d.year;
        d.export = +d.export;
        d.import = +d.import;
        return d;
    };

    // function to plot graph
    var plotGraph = function(dataset) {
        // Filter data based on selection
        var filteredData = dataset.filter(function(row) {
            return row.hscode == commodity_code && row.ccode == country_code;
        });

        // Generate a graph based on the above data
        updateLineChart(div_name, filteredData, false);
    };

    // Get remote CSV data
    if (martiniDataset[0] == undefined) {
        d3.csv(csvFile, typeConvert, function(data) {
            console.log("Martini dataset loaded from remote location!");
            martiniDataset = data;
            plotGraph(martiniDataset);
        });
    } else {
        console.log("Dataset already in the memory");
        plotGraph(martiniDataset);
    }
}
