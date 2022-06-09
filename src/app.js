import europeData from '../data/europe.json' assert { type: "json" };
import healthData from '../data/health_data-cleaned.json' assert { type: "json" };

function mergeDataIntoGeoJSON(geoJSON, data) {
    for (let i = 0; i < geoJSON.features.length; i++) {
        const feature = geoJSON.features[i];
        const countryCode = feature.properties.ISO3;
        const countryData = data.find(d => d.COU === countryCode);
        if (countryData) {
            feature.properties.healthData = countryData;
        }
    }
}

const year = 2016;
const featureDescription = "Calorías totales";
const featureUnits = "Kcal";
const data4Year = healthData.filter(d => d.YEAR == year);
const colors = ['#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
const min = Math.min(...data4Year.map(item => item.FOODTFAT));
const max = Math.max(...data4Year.map(item => item.FOODTFAT));
const colorsSpan = (max - min) / colors.length;

mergeDataIntoGeoJSON(europeData, data4Year);

const map = L.map('map').setView([54, 10], 3);

const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// control that shows state info on hover
const info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = `<h4>${featureDescription}</h4>` + (props ?
        '<b>' + props.NAME + '</b><br />' + (props.healthData?.FOODTFAT ? props.healthData?.FOODTFAT + ` ${featureUnits}` : "No data") : 'Hover over a country');
};

info.addTo(map);



// get color depending on population density value
function getColor(d) {
    console.log(d);
    const colorIndex = Math.floor((parseFloat(d) - min) / colorsSpan);
    console.log(colorIndex);
    return colors[colorIndex];
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.healthData?.FOODTFAT)
    };
}

function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

/* global statesData */
const geojson = L.geoJson(europeData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);


const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

    const div = L.DomUtil.create('div', 'info legend');
    const labels = [];
    let from, to;

    for (let i = 0; i < colors.length; i++) {
        from = min + colorsSpan * i;
        to = min + colorsSpan * (i + 1);

        labels.push(
            '<i style="background:' + getColor(from) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);