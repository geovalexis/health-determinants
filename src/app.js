import europeData from '../data/europe.json' assert { type: "json" };
import healthDataMetaData from '../data/health_data-cleaned-metadata.json' assert { type: "json" };
import healthData from '../data/health_data-cleaned.json' assert { type: "json" };
import { addInteractiveChoroplethMap } from './choropleth.js';

const propertyKey = "healthData";
const yearsAvailable = Array.from({ length: 12 }, (_, i) => i + 2005);
let map;

// selecciones unos valores por defecto
let selectedFeature = healthDataMetaData[0].key;
let selectedYear = yearsAvailable.at(-1);

// Añadimos los dropdowns de selección de año y feature
const featureDropDown = d3.select("#featureDropdown")
featureDropDown.selectAll("option")
    .data(healthDataMetaData)
    .enter()
    .append("option")
    .attr("value", function (option) { return option.key; })
    .text(function (option) { return `${option.description} (${option.units})`; })
    .property("selected", function(d){ return d === selectedFeature; })
    
const yearDropDown = d3.select("#yearDropdown")
yearDropDown.selectAll("option")
    .data(yearsAvailable)
    .enter()
    .append("option")
    .attr("value", function (option) { return option; })
    .text(function (option) { return option; })
    .property("selected", function(d){ return d === selectedYear; })

// Creamos el mapa con los valores por defecto
processChoroloplethMap(selectedFeature, selectedYear);

// Escuchamos los cambios de selección de datos que realiza el usuario y actualizamos el mapa en consecuencia
featureDropDown.on("change", function () {
    selectedFeature = featureDropDown.property("value");
    processChoroloplethMap(selectedFeature, selectedYear);
});
yearDropDown.on("change", function () {
    selectedYear = yearDropDown.property("value");
    processChoroloplethMap(selectedFeature, selectedYear);
});


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