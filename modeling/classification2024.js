//Imports: 2 featureCollections

// Load the Sentinel-2 composite image asset.
var s2_median = ee.Image("projects/assets/Urban_2024");

// visualization parameters.
var visParams = {
  bands: ["B4", "B3", "B2"], // True color (RGB)
  min: 0,
  max: 0.3, //normalized reflectance
};

var AOI = ee.FeatureCollection("projects/assets/KutaSelatan");
Map.centerObject(AOI, 13);
Map.addLayer(s2_median.clip(AOI), visParams, "Urban Area 2024 - Median");

// Merge the two FeatureCollections.
var newfc = urban.merge(greenery);

// Empty image to paint the features with the 'class' property.
var emptyImage = ee.Image().byte();

// Paint the 'class' property of the FeatureCollection onto the empty image.
var classImage = emptyImage
  .paint({
    featureCollection: newfc,
    color: "class",
  })
  .rename("class");

// Combine the class image with the Sentinel-2 image.
var inputImage = s2_median.addBands(classImage);

// Bands for classification.
var bands = ["B2", "B3", "B4", "B8", "B11", "B12"];

// Stratified Sampling for classification.
var training = inputImage.select(bands.concat("class")).stratifiedSample({
  numPoints: 1000, // Number of points per class
  classBand: "class", // The band name that holds the class labels
  region: newfc.geometry(), // Geometry of AOI (merged feature collection)
  scale: 10,
  geometries: true,
});

// Print the training data
print("Training Data:", training);

// Train a CART classifier.
var classifier = ee.Classifier.smileCart().train({
  features: training,
  classProperty: "class",
  inputProperties: bands,
});

// Classify the image.
var classified = inputImage.select(bands).classify(classifier);

//  visualization parameters for the classified image
var classifiedVis = {
  min: 1,
  max: 2,
  palette: ["green", "red"], // Built-up areas in red, green areas in green.
};

// Add the classified image to the map
Map.addLayer(classified, classifiedVis, "Classified Image");

// print the confusion matrix
var withRandom = training.randomColumn("random");
var split = 0.7;
var trainingPartition = withRandom.filter(ee.Filter.lt("random", split));
var testingPartition = withRandom.filter(ee.Filter.gte("random", split));
var trainedClassifier = ee.Classifier.smileRandomForest(5).train({
  features: trainingPartition,
  classProperty: "class",
  inputProperties: bands,
});
var test = testingPartition.classify(trainedClassifier);
var confusionMatrix = test.errorMatrix("class", "classification");
print("Confusion Matrix", confusionMatrix);

// extract misclassified points
var misclassified = testingPartition.filter(
  ee.Filter.neq("classification", "class")
);

// parameters for misclassified points
var misclassVis = {
  color: "yellow",
  pointSize: 5,
};

// Add misclassified points to the map
Map.addLayer(misclassified, misclassVis, "Misclassified Points");

// Print misclassified points to the console for further analysis
print("Misclassified Points:", misclassified);

var areaImage = ee.Image.pixelArea().divide(1e6); // Convert to square km

var urbanPixels = classified.eq(2).multiply(areaImage); // Mask urban pixels (class 2)

var totalUrbanArea = urbanPixels.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: AOI,
  scale: 10,
  maxPixels: 1e13,
});

print("Total Urban Area (sq km):", totalUrbanArea);

Export.image.toDrive({
  image: classified,
  description: "Urban_2024_Classified",
  scale: 10,
  region: AOI.geometry(),
  fileFormat: "GeoTIFF",
  maxPixels: 1e13,
});

Export.image.toAsset({
  image: classified,
  description: "Urban_2019_Classified_Asset",
  assetId: "Urban_2024_Classified",
  scale: 10,
  region: AOI.geometry(),
  maxPixels: 1e13,
});
