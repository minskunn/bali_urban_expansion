// Create binary masks for urban areas (1 = urban, 0 = non-urban)
var urbanMask2019 = urban2019.eq(2);
var urbanMask2024 = urban2024.eq(2);

// Compute Euclidean distances
var distToUrban2019 = urbanMask2019
  .fastDistanceTransform()
  .sqrt()
  .multiply(10)
  .rename("Distance_to_2019");

var distToUrban2024 = urbanMask2024
  .fastDistanceTransform()
  .sqrt()
  .multiply(10)
  .rename("Distance_to_2024");

// Combine predictor layers
var predictors = ee.Image.cat([
  urban2019.rename("LandCover_2019"),
  urban2024.rename("LandCover_2024"),
  distToUrban2019,
  distToUrban2024,
]);

// sampling parameters
var sampleSizePerClass = 5000;
var scale = 10; // Sentinel-2 resolution

// Stratified sampling for LandCover_2019
var samples2019 = predictors.stratifiedSample({
  numPoints: sampleSizePerClass,
  classBand: "LandCover_2019", // Balance 2019 land cover
  scale: scale,
  region: urban2019.geometry(),
  seed: 42,
  geometries: true,
});

// Stratified sampling for LandCover_2024
var samples2024 = predictors.stratifiedSample({
  numPoints: sampleSizePerClass,
  classBand: "LandCover_2024", // Balance 2024 land cover
  scale: scale,
  region: urban2024.geometry(),
  seed: 42,
  geometries: true,
});

// Merge samples
var balancedSamples = samples2019.merge(samples2024);

// Extract coordinates and remove the .geo column
var samplesWithCoordinates = balancedSamples.map(function (feature) {
  var coords = feature.geometry().coordinates();
  return feature
    .set("longitude", coords.get(0))
    .set("latitude", coords.get(1))
    .setGeometry(null); // Remove geometry
});

// Export the samples as CSV
Export.table.toDrive({
  collection: samplesWithCoordinates,
  description: "samplesWithCoordinates",
  fileFormat: "CSV",
});

// Print sample size
print("Final Sample Size:", samplesWithCoordinates.size());
