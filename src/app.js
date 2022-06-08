import unemployment from '../data/unemployment.json' assert { type: "json" };
import us from '../data/us.json' assert { type: "json" };
import { Choropleth } from './choropleth.js';

const counties = topojson.feature(us, us.objects.counties);
const states = topojson.feature(us, us.objects.states);
const statemap = new Map(states.features.map(d => [d.id, d]));
const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

const chart = Choropleth(unemployment, {
    id: d => d.id,
    value: d => d.rate,
    scale: d3.scaleQuantize,
    domain: [1, 10],
    range: d3.schemeBlues[9],
    title: (f, d) => `${f.properties.name}, ${statemap.get(f.id.slice(0, 2)).properties.name}\n${d?.rate}%`,
    features: counties,
    borders: statemesh,
    width: 975,
    height: 610
})

const appDiv = document.getElementById('app');
appDiv.appendChild(chart);