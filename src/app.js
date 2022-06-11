import europeData from '../data/europe.json' assert { type: "json" };
import healthDataMetaData from '../data/health_data-cleaned-metadata.json' assert { type: "json" };
import healthData from '../data/health_data-cleaned.json' assert { type: "json" };
import { addInteractiveChoroplethMap } from './choropleth.js';

const propertyKey = "healthData";
const yearsAvailable = d3.range(0, 12).map(function (d) {
    return new Date(2005 + d, 1, 1);
});
let map;

// selecciones unos valores por defecto
let selectedFeature = healthDataMetaData[0].key;
let selectedYear = d3.timeFormat('%Y')(yearsAvailable.at(-1));

// Creamos el mapa con los valores por defecto
processChoroloplethMap(selectedFeature, selectedYear);

// Añadimos y configuramos el dropdown de selección de feature
const featureDropdown = d3.select("#featureDropdown")
featureDropdown
    .selectAll("option")
    .data(healthDataMetaData)
    .enter()
    .append("option")
    .attr("value", option => option.key)
    .text(option => `${option.description} (${option.units})`)
    .property("selected", d => d === selectedFeature)
featureDropdown.on("change", event => {
    selectedFeature = event.target.value;
    processChoroloplethMap(selectedFeature, selectedYear);
});

// Añadimos y configuramos el slider de selección de año. Ref: https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518 
const gTime = d3
    .select('div#yearsSlider')
    .append('svg')
    .attr('width', 1000)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

gTime.call(d3
    .sliderBottom()
    .min(d3.min(yearsAvailable))
    .max(d3.max(yearsAvailable))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(800)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(yearsAvailable)
    .default(yearsAvailable.at(-1))
    .on('onchange', val => {
        selectedYear = d3.timeFormat('%Y')(val);
        processChoroloplethMap(selectedFeature, selectedYear);
    })
);

function processChoroloplethMap(featureKey, year) {
    const featureDescription = healthDataMetaData.find(d => d.key === featureKey).description;
    const featureUnits = healthDataMetaData.find(d => d.key === featureKey).units;
    const data4Year = healthData.filter(d => d.YEAR == year);
    const legendColors = ['#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
    const minValue = Math.min(...data4Year.map(item => item[featureKey]));
    const maxValue = Math.max(...data4Year.map(item => item[featureKey]));
    const colorsSpan = (maxValue - minValue) / legendColors.length;

    function mergeDataIntoGeoJSON(geoJSON, data) {
        for (let i = 0; i < geoJSON.features.length; i++) {
            const feature = geoJSON.features[i];
            const countryCode = feature.properties.ISO3;
            const countryData = data.find(d => d.COU === countryCode);
            if (countryData) {
                feature.properties[propertyKey] = countryData;
            }
        }
    }

    mergeDataIntoGeoJSON(europeData, data4Year);

    if (map) map.remove();

    map = addInteractiveChoroplethMap(
        europeData,
        'map',
        [54, 10],
        3,
        propertyKey,
        selectedFeature,
        featureDescription,
        featureUnits,
        legendColors,
        minValue,
        colorsSpan
    );
}