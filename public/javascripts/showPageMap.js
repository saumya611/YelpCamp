// const campground = require("../../models/campground");

mapboxgl.accessToken = mapToken;
var map = new mapboxgl.Map({
    container: 'cluster-map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL also streets-v11, light-v10,satelite-v9
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 7 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());


// var layerList = document.getElementById('menu');
// var inputs = layerList.getElementsByTagName('input');
 
// function switchLayer(layer) {
//     var layerId = layer.target.id;
//     map.setStyle('mapbox://styles/mapbox/' + layerId);
// }
 
// for (var i = 0; i < inputs.length; i++) {
//     inputs[i].onclick = switchLayer;
// }


// Create a default Marker, colored black, rotated 45 degrees.
// { color: 'black', rotation: 45 }

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)