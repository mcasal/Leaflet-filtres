const map = L.map('mapid').on('load', onMapLoad).setView([41.400, 2.206], 13);
//map.locate({setView: true, maxZoom: 17});

const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

//en el clusters almaceno todos los markers
const markers = L.markerClusterGroup();

let data_markers = [];

function onMapLoad() {
	/*
	FASE 3.1
		1) Relleno el data_markers con una petición a la api
		2) Añado de forma dinámica en el select los posibles tipos de restaurantes
		3) Llamo a la función para --> render_to_map(data_markers, 'all'); <-- para mostrar restaurantes en el mapa
	*/

	let typeFood = [];

	$.getJSON("http://localhost:8888/mapa/api/apiRestaurants.php", data => {
		$.each(data, (key, val) => {
			//3.1.1	
			data_markers.push(val);
			//afegeix els valors de kind_food a nova array
			typeFood.push(val.kind_food);
		});
		//afegeix tots els tipus de menjar en una array. Split per partir strings i afegeix element x element. Ojo pq afegeix elements duplicats també
		let temp = [];

		for (let i = 0; i < typeFood.length; i++) {
			const element = typeFood[i].split(',');
			for (let j = 0; j < element.length; j++) {
				const el = element[j];
				temp.push(el);
			}
		}
		//esborra els duplicats a una nova array amb tots els tipus de menjar
		let food = Array.from(new Set(temp));
		food.unshift('Todos');

		//3.1.2 volca la info al select > options
		foodValues = food.values();

		for (const iterator of foodValues) {
			const inputSelect = document.getElementById("kind_food_selector");
			const option = document.createElement("option");

			// afegeix un option al HTML
			inputSelect.append(option);

			// injecta cada foodValues (aka iterator) a un option
			option.value = iterator;
			option.textContent = iterator;
		}
		//3.1.3
		render_to_map(data_markers, 'Todos');
	});
}

$('#kind_food_selector').on('change', function () {
	console.log(this.value); // quan selecciona un tipus de menjar, imprimeix quin és
	render_to_map(data_markers, this.value);
});

function render_to_map(data_markers, filter) {
	/*
	FASE 3.2
		1) Limpio todos los marcadores
		2) Realizo un bucle para decidir que marcadores cumplen el filtro, y los agregamos al mapa
	*/

	//3.2.1
	markers.clearLayers();

	//3.2.2	
	data_markers.forEach(data => {
		if (data.kind_food.includes(filter) == true || filter == 'Todos') { //array.includes() retorna un booleano
			let marker;
			marker = L.marker([data.lat, data.lng])
			marker.bindPopup(`<b>${data.name}</b><br>Comida: ${data.kind_food}<br><br>${data.address}`);
			markers.addLayer(marker);
		};
	});

	map.addLayer(markers);

}