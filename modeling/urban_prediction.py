import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

df = pd.read_csv('samplesWithCoordinates.csv')
print(df.head())  # Check the first few rows

X = df[['Distance_to_2019', 'LandCover_2019']]
y = df['LandCover_2024']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training set size:", X_train.shape)
print("Test set size:", X_test.shape)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("Model Accuracy:", accuracy)

df_2029 = df.copy()  # Copy the existing dataset

X_2029 = df_2029[['Distance_to_2024', 'LandCover_2024']]

df_2029['LandCover_2029'] = model.predict(X_2029)


