// @docs
// https://darksky.net/dev/docs

// =================================================
// Stagger Fade-In
// =================================================

function staggerFade() {
	setTimeout(function() {
		$('.fadein-stagger > *').each(function() {
			$(this).addClass('js-animated');
		})
	}, 30);
}


// =================================================
// Skycons
// =================================================

function skycons() {
	let i,
			icons = new Skycons({
				"color" : "#FFFFFF",
				"resizeClear": true // nasty android hack
			}),
			list  = [ // listing of all possible icons
				"clear-day",
				"clear-night",
				"partly-cloudy-day",
				"partly-cloudy-night",
				"cloudy",
				"rain",
				"sleet",
				"snow",
				"wind",
				"fog"
			];

	// loop thru icon list array
	for(i = list.length; i--;) {
		let weatherType = list[i], // select each icon from list array
				// icons will have the name in the array above attached to the
				// canvas element as a class so let's hook into them.
				elements    = document.getElementsByClassName( weatherType );

		// loop thru the elements now and set them up
		for (e = elements.length; e--;) {
			icons.set(elements[e], weatherType);
		}
	}

	// animate the icons
	icons.play();
}


// =================================================
// Temperature Converter
// =================================================

// convert degrees to celsius
function fToC(fahrenheit) {
	let fTemp  = fahrenheit,
			fToCel = (fTemp - 32) * 5 / 9;

	return fToCel;
}


// =================================================
// Weather Reporter
// =================================================

function weatherReport(latitude, longitude) {
	// variables config for coordinates, url and api key
	// latitude and longitude are accepted arguments and passed
	// once a user has submitted the form.
	let apiKey       = '83222a5584605220420e32267a417267',
			url          = 'https://api.darksky.net/forecast/',
			lati         = latitude,
			longi        = longitude,
			api_call     = url + apiKey + "/" + lati + "," + longi + "?extend=hourly&callback=?";

	// Hold our days of the week for reference later.
	let days = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];

	// Hold hourly values for each day of the week.
	// This will store our 24 hour forecast results.
	let sunday    = [],
			monday    = [],
			tuesday   = [],
			wednesday = [],
			thursday  = [],
			friday    = [],
			saturday  = [];

	// Celsius button check. Is it toggled or not?
	let isCelsiusChecked = $('#celsius:checked').length > 0;

	// Hourly report method to reference in our daily loop
	function hourlyReport(day, selector) {
		for(let i = 0, l = day.length; i < l; i++) {
			$("." + selector + " " + "ul").append('<li>' + Math.round(day[i]) + '</li>');
		}
	}

	// Call to the DarkSky API to retrieve JSON
	$.getJSON(api_call, function(forecast) {

		// Loop thru hourly forecasts
		for(let j = 0, k = forecast.hourly.data.length; j < k; j++) {
			let hourly_date    = new Date(forecast.hourly.data[j].time * 1000),
					hourly_day     = days[hourly_date.getDay()],
					hourly_temp    = forecast.hourly.data[j].temperature;

			// If Celsius is checked then convert degrees to celsius
			// for general forecast report.
			if(isCelsiusChecked) {
				hourly_temp = fToC(hourly_temp);
				hourly_temp = Math.round((hourly_temp));
			}

			// push 24 hour forecast values to our empty days array
			switch(hourly_day) {
				case 'Sunday':
					sunday.push(hourly_temp);
					break;
				case 'Monday':
					monday.push(hourly_temp);
					break;
				case 'Tuesday':
					tuesday.push(hourly_temp);
					break;
				case 'Wednesday':
					wednesday.push(hourly_temp);
					break;
				case 'Thursday':
					thursday.push(hourly_temp);
					break;
				case 'Friday':
					friday.push(hourly_temp);
					break;
				case 'Saturday':
					saturday.push(hourly_temp);
					break;
				default: console.log(hourly_date.toLocaleTimeString());
					break;
			}
		}

		// Loop thru daily forecasts
		for(let i = 0, l = forecast.daily.data.length; i < l - 1; i++) {

			let date     = new Date(forecast.daily.data[i].time * 1000),
					day      = days[date.getDay()],
					skicons  = forecast.daily.data[i].icon,
					time     = forecast.daily.data[i].time,
					humidity = forecast.daily.data[i].humidity,
					summary  = forecast.daily.data[i].summary,
					temp    = Math.round(forecast.hourly.data[i].temperature),
					tempMax = Math.round(forecast.daily.data[i].temperatureMax);

			// If Celsius is checked then convert degrees to celsius
			// for 24 hour forecast results
			if(isCelsiusChecked) {
				temp    = fToC(temp);
				tempMax = fToC(tempMax);
				temp = Math.round(temp);
				tempMax = Math.round(tempMax);
			}

			// Append Markup for each Forecast of the 7 day week
			$("#forecast").append(
				'<li class="shade-'+ skicons +'"><div class="card-container"><div><div class="front card"><div>' +
					"<div class='graphic'><canvas class=" + skicons + "></canvas></div>" +
					"<div><b>Day</b>: " + date.toLocaleDateString() + "</div>" +
					"<div><b>Temperature</b>: " + temp + "</div>" +
					"<div><b>Max Temp.</b>: " + tempMax + "</div>" +
					"<div><b>Humidity</b>: " + humidity + "</div>" +
					'<p class="summary">' + summary + '</p>' +
					'</div></div><div class="back card">' +
					'<div class="hourly' + ' ' + day + '"><b>24hr Forecast</b><ul class="list-reset"></ul></div></div></div></div></li>'
			);

			// Daily forecast report for each day of the week
			switch(day) {
				case 'Sunday':
					hourlyReport(sunday, days[0]);
					break;
				case 'Monday':
					hourlyReport(monday, days[1]);
					break;
				case 'Tuesday':
					hourlyReport(tuesday, days[2]);
					break;
				case 'Wednesday':
					hourlyReport(wednesday, days[3]);
					break;
				case 'Thursday':
					hourlyReport(thursday, days[4]);
					break;
				case 'Friday':
					hourlyReport(friday, days[5]);
					break;
				case 'Saturday':
					hourlyReport(saturday, days[6]);
					break;
			}
		}

		skycons(); // inject skycons for each forecast
		staggerFade(); // fade-in forecast cards in a stagger-esque fashion

	});
}


// =================================================
// Get Weather Button Event
// =================================================

// Get Weather Button Event
$('button').on('click', function(e) {
	let lat       = $('#latitude').val(),
			long      = $('#longitude').val(),
			city_name = $('#city-search').val()

	// If the latitude and longitude inputs aren't empty
	// then continue with the code. Otherwise report error to user.
	if(lat && long !== '') {
		e.preventDefault();

		// Fade logo out when form is submitted
		$('#logo').fadeOut(100);

		// Fade the form out, submit the weather request,
		// inject "new forecast" button, city name & forecast cards.
		$('.form').fadeOut(100, function() {
			weatherReport(lat, long);
			$('.screen').append('<button id="back">New Forecast</button><h3 class="city">' + city_name + '</h3><ul class="list-reset fadein-stagger" id="forecast"></ul>');
		});
	}
});


// "new forecast" button. Allow user
// to return to forecast form.
$('body').on('click', '#back', function() {
	window.location.reload(true);
})


// =================================================
// Report City & AutoFill Coords
// =================================================

function insertGoogleScript() {
	let google_api = document.createElement('script'),
			api_key    = 'AIzaSyAfWu_rmDBIwlSLZwVzcLyFhvhiEAQP0r8';

	// Inject the script for Google's API and reference the initGoogleAPI
	// function as a callback.
	google_api.src = 'https://maps.googleapis.com/maps/api/js?key='+ api_key +'&callback=initGoogleAPI&libraries=places,geometry';
	document.body.appendChild(google_api);
}


// SearchBox Method
function initGoogleAPI() {
	let autocomplete = new google.maps.places.SearchBox(document.querySelector("#city-search"));

	autocomplete.addListener('places_changed', function() {
		let place = autocomplete.getPlaces()[0];
		document.querySelector("#latitude").value = place.geometry.location.lat();
		document.querySelector("#longitude").value = place.geometry.location.lng();
	});
}

insertGoogleScript();

let vm = new Vue ({
    el: '#vue',
    data: {
        hashtags: [],
        cities: [],
        textSearch: '',
        url: {
            hashtags: 'https://dka-develop.ru/api?type=hashtag',
            cities: 'https://dka-develop.ru/api?type=city'
        }
    },
    watch: { //наблюдатель. Следит за свойствами. У него есть список ситуаций, в резултате которых он будет принимать решение. Надо только сказать, за каким свойством ему следить.
        textSearch: function() { //если значение свойства меняется, срабатывает код, который внутри анонимной функции.
            if(this.textSearch.length>3) {
                this.textSearch = 'Меняем содержимое поля из кода';
            }
        }
    },
    created: function() {
        console.log(this.url.hashtags); //проверяем, что возвращает свойство. Работает ли в консоли ссылка.
    },
    methods: {
        getHashtags() {
            //then выполняется, когда мы получили hashtags успешено.
            axios.get(this.url.hashtags).then((response) => { //такая запись удобна. Можно будет исправить url в data и эта ссылка изменится везде.
                console.log(this);
                this.hashtags = response.data;
            }); 
        },
        getCities() {
            //then выполняется, когда мы получили hashtags успешено.
            axios.get(this.url.cities).then((response) => { //такая запись удобна. Можно будет исправить url в data и эта ссылка изменится везде.
                console.log(response.data);
                this.cities = response.data;
            }); 
        }
    }
});
