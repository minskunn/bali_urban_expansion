**Bali Urban Expansion Analysis (2019–2029)**

Predicting Urban Growth Using Machine Learning & Remote Sensing

Project Overview
This project explores urban expansion in Southern part of Bali (Kuta Selatan) using satellite imagery and machine learning. 
The goal was to analyze land use change between 2019 and 2024, then predict urban growth for 2029.

The workflow involved:
- Extracting remote sensing data from Google Earth Engine (GEE)
- Training machine learning models (Random Forest, Gradient Boosting, Logistic Regression)
- Predicting 2029 land cover based on historical trends

Ultimately, the analysis revealed insufficient data trends to make a reliable 2029 prediction.

Data Extraction (Google Earth Engine)

Steps followed to retrieve and preprocess Sentinel-2 Data

Define AOI (Area of Interest) and import the shapefile as an asset to GEE
Retrieve Sentinel-2 SR Imagery from dry season (start of June to end of September) and collect cloud-free images (30% threshold) for 2019 & 2024.
Apply cloud masking & composite creation.
Land Cover Classification. Classify images into urban (1) / non-urban (2) using supervised classification. About 500 samples manually labeled for each class.
Calvulate distance to urban pixels (2019, 2024).
Export the Data (CSV Format)
Extract 20,000 random sample points for training.


Steps in Model Training

Read the sample CSV file.
Compute change metrics (e.g., distance change, land cover change).
Train-Test Split (80/20 ratio)
X_train → Distance & land cover variables.
y_train → Land cover class for 2024.
Model Training & Evaluation
Tested multiple classifiers: Random Forest, Gradient Boosting, Logistic Regression
Checked model accuracy & feature importance.
Prediction for 2029
Applied the trained model to the 2024 AOI dataset.
Saved predictions as a new CSV file.

Key Findings & Challenges: Why the 2029 Prediction Failed? 

Minimal Urban Growth (2019–2024) 
Expected high urban expansion did not occur.
Only ~344 pixels (~3.44 km²) changed from non-urban to urban.
Data Patterns Were Too Weak
Feature importance analysis showed weak predictive power.
The models struggled to differentiate growth patterns.
The model could not find significant new urbanization trends
2029 Output was Identical to 2024 

Switching to Clustering Analysis
Given the limitations of predictive modeling, the focus shifted to clustering analysis to better understand the spatial distribution of urbanized areas in Uluwatu.

Methodology

This clustering analysis focuses on identifying and quantifying urban clusters. The methodology involves reprojecting raster data, extracting urban areas, and clustering urban pixels to assess urbanization patterns.

1. Data Preprocessing
Reprojection to Local CRS: The classified raster (Classified2024_clean.tif) was reprojected to EPSG:32750 (UTM Zone 50S) to ensure accurate spatial measurements.
Handling NoData Values: NoData values were masked to avoid errors in analysis.
Pixel Size Calculation: The resolution of the raster was used to determine the real-world area of each pixel (in square meters).

3. Urban Cluster Identification
Binary Classification: Urban areas were extracted by converting the raster into a binary mask (1 = urban, 0 = non-urban).
Connected Component Labeling: An 8-connectivity structure was applied to label and identify urban clusters (i.e., contiguous urban areas).
Cluster Size Calculation: The number of pixels in each cluster was converted into real-world area (m² and km²).

