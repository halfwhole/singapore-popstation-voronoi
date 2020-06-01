// Set up the map
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
    // Add markers
    L.geoJSON(data, {
        onEachFeature: addPopupContent,
        pointToLayer: pointToLayer
    }).addTo(map);

    function addPopupContent(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.name + "</h3>" +
                        "<p>" + feature.properties.address + "</p>" +
                        "<p>Operating hours: " + feature.properties.operating_hours + "</p>");
    }

    function pointToLayer(feature, latlng) {
        return L.marker([latlng['lat'], latlng['lng']]);
    }

    // Get points in latitude/longitude format
    const points = data['features']
          .map(ft => ft['geometry']['coordinates'])
          .map(pt => new L.LatLng(pt[1], pt[0]));

    function update() {
        const width = map.getSize().x;
        const height = map.getSize().y;
        const deltaX = map.getPixelBounds().min.x - map.getPixelOrigin().x;
        const deltaY = map.getPixelBounds().min.y - map.getPixelOrigin().y;

        // Add extra allowance for smoother viewing experience (avoid seeing the outer box)
        const extent = [[deltaX - width, deltaY - height], [deltaX + 2 * width, deltaY + 2 * height]];

        const voronoi = d3.voronoi().x(d => d.x).y(d => d.y).extent(extent);
        const layerPoints = points.map(latlng => map.latLngToLayerPoint(latlng));
        const polygons = voronoi.polygons(layerPoints).filter(x => !!x);

        svg.selectAll('path').remove();

        const svgPolygons = svg.selectAll('g')
            .data(polygons)
            .enter()
            .append('path')
            .attr('d', (polygon) => 'M' + polygon.join('L') + 'Z')
            .attr('fill', 'none')
            .attr('stroke', '#777')
            .attr('stroke-width', '0.7');
    }

    map.on("viewreset moveend", update);
    update();
});
