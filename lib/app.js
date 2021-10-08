const express = require('express');
const cors = require('cors');
const request = require('superagent');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
/*app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});
*/
app.get('/location', async(req, res) => {
  try {
    const cityName = req.query.search;

    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${process.env.LocationIQ}&q=${cityName}&format=json`);

    const mungedResponse = {
      latitude: response.body[0].lat,
      longitude: response.body[0].lon,
      formatted_query: response.body[0].display_name,
    };

    res.json(mungedResponse);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/weather', async(req, res) => {
  try {
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?&lat=${latitude}&lon=${longitude}&key=${process.env.WeatherBit}`);

    const mungedWeather = [{
      forecast: response.body.data[0].weather.description,
      time: response.body.data[0].valid_date
    },
    {
      forecast: response.body.data[1].weather.description,
      time: response.body.data[1].valid_date
    },
    {
      forecast: response.body.data[2].weather.description,
      time: response.body.data[2].valid_date
    },
    {
      forecast: response.body.data[3].weather.description,
      time: response.body.data[3].valid_date
    },
    {
      forecast: response.body.data[4].weather.description,
      time: response.body.data[4].valid_date
    },
    {
      forecast: response.body.data[5].weather.description,
      time: response.body.data[5].valid_date
    },
    {
      forecast: response.body.data[6].weather.description,
      time: response.body.data[6].valid_date
    }
    ];
    res.json(mungedWeather);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
 
});

app.get('/reviews', async(req, res) => {
  try {
    const lat = req.query.latitude;
    const long = req.query.longitude;

    const response = await request.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${long}`).set({ Authorization: `Bearer ${process.env.YelpKey}` });

    /*const mungedYelp = [
     {
      name: response.body.businesses[0].name,
      image_url: response.body.businesses[0].image_url,
      price: response.body.businesses[0].price,
      rating: response.body.businesses[0].rating,
      url: response.body.businesses[0].url
     },
     {
       name: response.body.businesses[1].name,
      image_url: response.body.businesses[1].image_url,
      price: response.body.businesses[1].price,
      rating: response.body.businesses[1].rating,
      url: response.body.businesses[1].url
     }
   ]
*/

    const yelpArray = response.body.businesses;
    const returnArray = yelpArray.map(business => {
      return {
        name: business.name,
        image_url: business.image_url,
        price: business.price,
        rating: business.rating,
        url: business.url
      };
    });
    res.json(returnArray);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
