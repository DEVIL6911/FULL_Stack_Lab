# Experiment 3: Logistic Regression on Breast Cancer data
# Dataset: "Breast Cancer Wisconsin (Diagnostic) Data Set" from Kaggle
# Link: https://www.kaggle.com/datasets/uciml/breast-cancer-wisconsin-data
# Download it and keep data.csv in the SAME folder as this file.

# Step 1: Import the libraries
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.inspection import DecisionBoundaryDisplay
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score, roc_curve

# Step 2: Read the file
df = pd.read_csv("data.csv")

# Step 3: Remove the columns we do not need
df = df.drop(["id", "Unnamed: 32"], axis=1)

# Step 4: Change the answer column into numbers (M = malignant = 1, B = benign = 0)
df["diagnosis"] = df["diagnosis"].map({"M": 1, "B": 0})
print(df.head())

# Step 5: X = inputs, y = diagnosis
X = df.drop("diagnosis", axis=1)
y = df["diagnosis"]

# Step 6: Split into train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 7: Scale the data so all columns are on the same level
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Step 8: Train the model
model = LogisticRegression(max_iter=1000)
model.fit(X_train_s, y_train)

# Step 9: Predict (class) and get probability (needed for ROC AUC)
y_pred = model.predict(X_test_s)
y_prob = model.predict_proba(X_test_s)[:, 1]

# Step 10: Check the results
print("Accuracy  :", accuracy_score(y_test, y_pred))
print("Precision :", precision_score(y_test, y_pred))
print("Recall    :", recall_score(y_test, y_pred))
print("ROC AUC   :", roc_auc_score(y_test, y_prob))

# Step 11: Draw the ROC curve
fpr, tpr, _ = roc_curve(y_test, y_prob)
plt.plot(fpr, tpr, label="Logistic Regression")
plt.plot([0, 1], [0, 1], "k--", label="Random guess")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend()
plt.show()

# Step 12: Decision boundary - we can only draw 2 columns on a graph,
# so we train a small model using just 2 columns
two = ["radius_mean", "texture_mean"]
small_model = LogisticRegression()
small_model.fit(X_train[two], y_train)

DecisionBoundaryDisplay.from_estimator(small_model, X_train[two], cmap="coolwarm", alpha=0.4)
plt.scatter(X_train["radius_mean"], X_train["texture_mean"], c=y_train, cmap="coolwarm", edgecolor="k")
plt.xlabel("radius_mean")
plt.ylabel("texture_mean")
plt.title("Decision Boundary (red = malignant, blue = benign)")
plt.show()
