//darksky.net code : 0bc482389970a7b2fcfa20591b770a7a
//mapbox token: pk.eyJ1Ijoic3VnYXJkcmF3IiwiYSI6ImNqcGkzbW5vczEzYWkzcHA1dHoycnJ4MzMifQ.12gATJkF053PSxfxM_U4-g

/**
 * icons types:
 * clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, partly-cloudy-night
 * hail, thunderstorm, or tornado
 */

const express = require("express");
const route = express.Router();
const app = express();
const request = require("request");
const path = require("path");
var EJS = require("ejs");

/**
 * middlewares
 */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use("/options/icons", express.static(__dirname + "/icons"));
app.engine("html", EJS.renderFile);

/**
 * trick to use EJS events
 */



let lat;
let lng;
let placeName;

const getWeather = (address, lat, lng, res) => {
  console.log(lat, lng);
  request(
    {
      url: ` https://api.darksky.net/forecast/0bc482389970a7b2fcfa20591b770a7a/${lat},${lng}`,
      json: true
    },
    (error, response, body) => {

      let errors = [];
      if (error) {
        errors.push("error: " + response.statusCode);
        console.log("error:", error); // Print the error if one occurred
        res.render("errorPage.ejs", {
          errors: errors
        });
      } else if (body.code === 400) {
        errors.push("error: " + body.code + ", " + body.error);
        res.render("errorPage.ejs", {
          errors: errors
        });
      } else {
        let results = body.currently;
        let temperatureToDegrees = ((results.temperature - 32) / 1.8).toFixed(2);
        let icon = results.icon;
        res.render("results.ejs", {
          place: address,
          results: results,
          temperature: temperatureToDegrees,
          icon: icon,
        });
      }
    }
  );
  console.log("returning data");
};

const geocodeAddress = (address, callback, res) => {
  request(
    {
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?types=address&access_token=pk.eyJ1Ijoic3VnYXJkcmF3IiwiYSI6ImNqcGkzbW5vczEzYWkzcHA1dHoycnJ4MzMifQ.12gATJkF053PSxfxM_U4-g`,
      json: true
    },
    (error, response, body) => {
      if (error) {
        console.log("error:", error); // Print the error if one occurred
      } else {
        console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received

        lat = body.features[0].geometry.coordinates[0];
        lng = body.features[0].geometry.coordinates[1];
        callback(address, lat, lng, res);
      }
    }
  );
};

checkAlternatives = (address, res) => {
  request(
    {
      url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?types=address&access_token=pk.eyJ1Ijoic3VnYXJkcmF3IiwiYSI6ImNqcGkzbW5vczEzYWkzcHA1dHoycnJ4MzMifQ.12gATJkF053PSxfxM_U4-g`,
      json: true
    },
    (error, response, body) => {
      if (error) {
        let errors = [];
        errors.push(error);
        console.log("error:", error); // Print the error if one occurred
        res.render("alternatives.ejs", {
          errors: errors
        });
      } else {
        console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
        let places = [];
        for (let item in body.features) {
          places.push(body.features[item].place_name);
        }

        res.render("alternatives.ejs", {
          alternatives: places
        });
      }
    }
  );
};

/**
 * Routes
 *
 */

route.get("/", (req, res) => {
  res.render("index.ejs");
});
route.get("/options", (req, res) => {
  checkAlternatives(req.query.city, res);
});
route.get("/options/get-weather", (req, res) => {
  console.log(req.query);
  geocodeAddress(req.query.options, getWeather, res);
});

app.use(route);

app.listen(3000, () => {
  console.log("listening on port 3000");
});
