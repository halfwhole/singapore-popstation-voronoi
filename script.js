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

    function pointToLayer(feature, latlng) {
        return L.marker([latlng['lat'], latlng['lng']]);
    }

    // Add markers
    L.geoJSON(data, {
        onEachFeature: addPopupContent,
        pointToLayer: pointToLayer
    }).addTo(map);

    // Draw points as markers
    const points = data['features']
          .map(ft => ft['geometry']['coordinates'])
          .map(pt => new L.LatLng(pt[1], pt[0]));

    function update() {

        const layerPoints = points.map(latlng => {
            return map.latLngToLayerPoint(latlng);
        });

        // Draw points as circles
        // svg.selectAll('g').remove();

        // const svgPoints = svg
        //       .selectAll('g')
        //       .data(layerPoints)
        //       .enter()
        //       .append('g');

        // svgPoints
        //     .append('circle')
        //     .attr('transform', d => `translate(${d.x},${d.y})`)
        //     .attr('r', 2);

        // Draw voronoi graph
        const width = map.getSize().x;
        const height = map.getSize().y;
        const voronoi = d3.voronoi().x(d => d.x).y(d => d.y).extent([[0, 0], [width, height]]);
        const polygons = voronoi.polygons(layerPoints).filter(x => !!x);

        svg.selectAll('path').remove();

        function buildPath(polygon) {
            return 'M' + polygon.join('L') + 'Z';
        }

        const svgPolygons = svg.selectAll('g')
            .data(polygons)
            .enter()
            .append('path')
            .attr('d', buildPath)
            .attr('fill', 'none')
            .attr('stroke', '#777')
            .attr('stroke-width', '0.7');
    }

    map.on("viewreset moveend", update);
    update();
});
