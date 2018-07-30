// Setup the event handler for COMMODITIES Export/Import selection
d3.select("#select-timeline-ie-commodity").on("change", function() {
    updateStackedAreaChart("#timeline-ie-commodity", "commodity", this.value);
});

// Setup the event handler for COUNTRIES Export/Import selection
d3.select("#select-timeline-ie-country").on("change", function() {
    updateStackedAreaChart("#timeline-ie-country", "country", this.value);
});

// Setup the event handler for Martini COUNTRIES selection
d3.selectAll("#select-martini-country, #select-martini-commodity").on(
    "change",
    function() {
        var selCountry = document.getElementById("select-martini-country")
            .value;
        var selCommodity = document.getElementById("select-martini-commodity")
            .value;
        updateMartiniChart("#timeline-martini", selCountry, selCommodity);
    }
);

// Setup triggers on scroll
var scrolledOnce = { total: false, country: false, commodity: false }; // We don't want to trigger stuff every time

window.onscroll = function() {
    this.console.log("scrolled to" + this.pageYOffset);

    if (this.pageYOffset > 600 && !scrolledOnce.total) {
        scrolledOnce.total = true;
        updateLineChart("#timeline-ie-all");
    }

    if (this.pageYOffset > 1300 && !scrolledOnce.country) {
        scrolledOnce.country = true;
        updateStackedAreaChart("#timeline-ie-country", "country", "import");
    }

    if (this.pageYOffset > 2100 && !scrolledOnce.commodity) {
        scrolledOnce.commodity = true;
        updateStackedAreaChart("#timeline-ie-commodity", "commodity", "import");
    }
};
