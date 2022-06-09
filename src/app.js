import europeData from '../data/europe.json' assert { type: "json" };
import healthData from '../data/health_data-cleaned.json' assert { type: "json" };
import healthDataMetaData from '../data/health_data-cleaned-metadata.json' assert { type: "json" };
import { addInteractiveChoroplethMap } from './choropleth.js';


const year = 2016;
const featureKey = "MNTDISORDSHR";

const featureDescription = healthDataMetaData.find(d => d.key === featureKey).description;
const featureUnits = healthDataMetaData.find(d => d.key === featureKey).units;
const data4Year = healthData.filter(d => d.YEAR == year);
const legendColors = ['#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
const minValue = Math.min(...data4Year.map(item => item[featureKey]));
const maxValue = Math.max(...data4Year.map(item => item[featureKey]));
const colorsSpan = (maxValue - minValue) / legendColors.length;
const propertyKey = "healthData";

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

addInteractiveChoroplethMap(
    europeData,
    'map',
    [54, 10],
    3,
    propertyKey,
    featureKey,
    featureDescription,
    featureUnits,
    legendColors,
    minValue,
    colorsSpan
);
