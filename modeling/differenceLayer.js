// Define visualization parameters
var vis = { min: 1, max: 2, palette: ["green", "red"] };

// Add to Map
Map.addLayer(urban2019, vis, "Urban 2019");
Map.addLayer(urban2024, vis, "Urban 2024");
Map.centerObject(urban2019, 12);

var urbanMask2019 = urban2019.eq(2); // Urban pixels become 1, others 0
var urbanMask2024 = urban2024.eq(2);

var urbanExpansion = urbanMask2024.and(urbanMask2019.not()); // Only count new urban pixels

var expansionVis = { min: 0, max: 1, palette: ["white", "blue"] };
Map.addLayer(urbanExpansion, expansionVis, "Urban Expansion 2019-2024");

// Function to calculate area of urban pixels in km²
function calculateUrbanArea(image, mask) {
  var pixelArea = ee.Image.pixelArea().divide(1e6); // Convert m² to km²
  var urbanArea = pixelArea.updateMask(mask).reduceRegion({
    reducer: ee.Reducer.sum(),
    scale: 10,
    maxPixels: 1e13,
  });

  return urbanArea.getNumber("area"); // Extract the area value
}

// Compute areas
var urbanArea2019 = calculateUrbanArea(urban2019, urbanMask2019);
var urbanArea2024 = calculateUrbanArea(urban2024, urbanMask2024);
var urbanExpansionArea = calculateUrbanArea(urbanExpansion, urbanExpansion); // Direct calculation from the expansion layer

// Print results
urbanArea2019.evaluate(function (area2019) {
  urbanArea2024.evaluate(function (area2024) {
    urbanExpansionArea.evaluate(function (expansion) {
      print("Urban Area 2019:", area2019, "km²");
      print("Urban Area 2024:", area2024, "km²");
      print("Urban Expansion (Direct from Layer):", urbanExpansionArea, "km²");
    });
  });
});

// Export the 2019 classified image
Export.image.toDrive({
  image: urban2019,
  description: "Classified_2019",
  scale: 10,
  fileFormat: "GeoTIFF",
});

// Export the 2024 classified image
Export.image.toDrive({
  image: urban2024,
  description: "Classified_2024",
  scale: 10,
  fileFormat: "GeoTIFF",
});
