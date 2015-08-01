var tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("display", "none")
    .style("position", "absolute")
    .html("<label><span id=\"tt_county\"></span></label>");

var width = 960, height = 600;

var rateCNById = d3.map();

var projCN = d3.geo.mercator().center([105, 38]).scale(750).translate([width/2, height/2]);
var pathCN = d3.geo.path().projection(projCN);

var svgCN = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

queue()
    .defer(d3.json, "data/china_cities.json")
    .defer(d3.json, "data/china_provinces.json")
    .defer(d3.csv, "data/china_cities.csv", function(d) {rateCNById.set(d.id, +d.value);})
    .await(makeCNMap);

function makeCNMap(error, counties, states) {
    svgCN.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(counties.features)
        .enter()
        .append("path")
        .attr("class", function(d) { return "q" + rateCNById.get(d.id); })
        .attr("d", pathCN)
        .on("mouseover", function(d) {
            var m = d3.mouse(d3.select("body").node());
            tooltip.style("display", null)
                .style("left", m[0] + 10 + "px")
                .style("top", m[1] - 10 + "px");
            $("#tt_county").text(d.properties.name);
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    svgCN.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr("d", pathCN)
}

var cartogram = d3.cartogram()
  .projection(d3.geo.albersUsa())
  .value(function(d) {
    return Math.random() * 100;
  });
 d3.json("data/china_cities_topo.json", function(topology) {
  var features = cartogram(topology, topology.objects.OBJECTNAME.geometries);
  d3.select("svg").selectAll("path")
    .data(features)
    .enter()
    .append("path")
      .attr("d", cartogram.path);
 });