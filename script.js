const map = L.map('map').setView([1.35, 103.82], 12);

L.tileLayer('http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '',
    maxZoom: 17,
}).addTo(map);

// Initialize SVG layer and group
L.svg().addTo(map);

// Select SVG layer and group from map
const svg = d3.select('#map').select('svg');
const g = svg.select('g');

fetch('data.json').then(res => res.json()).then(data => {
    function addPopupContent(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.name + "</h3>" +
                        "<p>" + feature.properties.address + "</p>" +
                        "<p>Operating hours: " + feature.properties.operating_hours + "</p>");
    }

    // Add markers
    L.geoJSON(data, {
        onEachFeature: addPopupContent,
        pointToLayer: (feature, latlng) => {
            newLatLng = [latlng['lat'], latlng['lng']];
            return L.marker(newLatLng);
        }
    }).addTo(map);

    // Draw voronoi graph
    const points = data['features'].map(ft => ft['geometry']['coordinates']);
    const voronoi = d3.voronoi().x(d => d[1]).y(d => d[0]);
    const polygons = voronoi(points).polygons();

    const paths = polygons.map(polygon => {
        return "M" + polygon.join("L") + "Z";
    });
    console.log(paths);

    // create references to polygons in points
    // voronoiPolygons.forEach(function(polygon) {
    //     console.log(polygon);
    //     polygon.point.cell = polygon;
    // });

    // draw voronoi cells
    var buildPathFromPoint = function(point) {
        if (point.cell == undefined) console.log(point);
        return "M" + point.cell.join("L") + "Z";
    }

    svg.append("path")
        .attr("d", buildPathFromPoint)
        .attr('fill', 'none')
        .attr('stroke', '#777')
        .attr('stroke-width', '0.7');
});

// d3.json('circles.json').then(function(collection) {
//     // Add a LatLng object to each item in the dataset
//     collection.objects.forEach(function(d) {
//         d.LatLng = new L.LatLng(d.circle.coordinates[0],
//                                 d.circle.coordinates[1])
//     });

//     const feature = g.selectAll("circle")
//         .data(collection.objects)
//         .enter().append("circle")
//         .style("stroke", "black")
//         .style("opacity", .6)
//         .style("fill", "red")
//         .attr("r", 20);

//     function update() {
//         feature.attr("transform",
//                      function(d) {
//                          return "translate("+
//                              map.latLngToLayerPoint(d.LatLng).x +","+
//                              map.latLngToLayerPoint(d.LatLng).y +")";
//                      }
//                     )
//     }

//     map.on("viewreset moveend", update);
//     update();
// });
