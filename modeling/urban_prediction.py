import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

df = pd.read_csv('samplesWithCoordinates.csv')
print(df.head())  # Check the first few rows

#df['Change_in_Distance'] = df['Distance_to_2024'] - df['Distance_to_2019']
#df['Change_in_LandCover'] = df['LandCover_2024'] - df['LandCover_2019']

#X = df[['Distance_to_2019', 'LandCover_2019']]
#y = df['LandCover_2024']

X = df[['Distance_to_2019', 'LandCover_2019',]]
y = df['LandCover_2024']


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training set size:", X_train.shape)
print("Test set size:", X_test.shape)

print(df['LandCover_2019'].value_counts())
print(df['LandCover_2024'].value_counts())


#model = RandomForestClassifier(n_estimators=100, random_state=42)
#model = GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, random_state=42)
model = LogisticRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("Model Accuracy:", accuracy)

df_AOI = pd.read_csv('Full_AOI_Predictors_2024.csv') 
print(df_AOI.head())  # Verify structure

#Rename columns temporarily to match model's expected input and to avoid error
df_AOI = df_AOI.rename(columns={'Distance_to_2024': 'Distance_to_2019', 
                                'LandCover_2024': 'LandCover_2019'})

# Prepare features
X_2029 = df_AOI[['Distance_to_2019', 'LandCover_2019']]

print(X_2029.head())

# Predict 2029 land cover
df_AOI['LandCover_2029'] = model.predict(X_2029)

# Save the results
#df_AOI.to_csv('predicted_AOI_2029_LR.csv', index=False)

print("Prediction complete. CSV saved as 'predicted_AOI_2029.csv'.")

