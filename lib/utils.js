


function mungeLocationData(body) {
  return {
    latitude: body.lat,
    longitude: body.lon,
    formatted_query: body.display_name,
  };
}

module.exports = { mungeLocationData };