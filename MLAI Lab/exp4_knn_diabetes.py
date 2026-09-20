# Experiment 4: KNN on the Diabetes dataset
# Dataset: "Pima Indians Diabetes Database" from Kaggle
# Link: https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database
# Download it and keep diabetes.csv in the SAME folder as this file.

# Step 1: Import the libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.inspection import DecisionBoundaryDisplay
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# Step 2: Read the file
df = pd.read_csv("diabetes.csv")
print(df.head())

# Step 3: Clean the data - in these columns a 0 is not possible,
# so treat 0 as missing and fill it with the median value
cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
df[cols] = df[cols].replace(0, np.nan)
df[cols] = df[cols].fillna(df[cols].median())

# Step 4: X = inputs, y = Outcome (1 = diabetes, 0 = no diabetes)
X = df.drop("Outcome", axis=1)
y = df["Outcome"]

# Step 5: Split into train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 6: Scale the data (KNN uses distance, so scaling is important)
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Step 7: Try k = 1 to 30 and check each one with cross-validation
k_list = list(range(1, 31))
scores = []
for k in k_list:
    knn = KNeighborsClassifier(n_neighbors=k)
    cv = cross_val_score(knn, X_train_s, y_train, cv=5)   # 5-fold cross-validation
    scores.append(cv.mean())

# Step 8: Pick the k that gave the best score
best_k = k_list[np.argmax(scores)]
print("Best k =", best_k)

plt.plot(k_list, scores, marker="o")
plt.xlabel("k value")
plt.ylabel("Cross-validation accuracy")
plt.title("Choosing the best k")
plt.show()

# Step 9: Train the final model with the best k and test it
model = KNeighborsClassifier(n_neighbors=best_k)
model.fit(X_train_s, y_train)
y_pred = model.predict(X_test_s)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))

# Step 10: Decision boundary using only 2 columns (Glucose and BMI)
two = ["Glucose", "BMI"]
small_model = KNeighborsClassifier(n_neighbors=best_k)
small_model.fit(X_train[two], y_train)

DecisionBoundaryDisplay.from_estimator(small_model, X_train[two], cmap="coolwarm", alpha=0.4)
plt.scatter(X_train["Glucose"], X_train["BMI"], c=y_train, cmap="coolwarm", edgecolor="k")
plt.xlabel("Glucose")
plt.ylabel("BMI")
plt.title("KNN Decision Boundary (k = " + str(best_k) + ")")
plt.show()
