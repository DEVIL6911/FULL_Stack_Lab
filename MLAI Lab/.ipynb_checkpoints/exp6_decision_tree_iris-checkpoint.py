# Experiment 6: Decision Tree on the Iris dataset
# Dataset: "Iris Species" from Kaggle
# Link: https://www.kaggle.com/datasets/uciml/iris
# Download it and keep Iris.csv in the SAME folder as this file.

# Step 1: Import the libraries
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns  # Imported seaborn for dataset loading
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

# Step 2: Read/Load the file using seaborn
df = sns.load_dataset("iris")  # Replaces pd.read_csv("Iris.csv")

# Note: Seaborn's iris dataset doesn't have an "Id" column, 
# so dropping it is not required, but if your dataframe has it:
# df = df.drop("Id", axis=1)

print(df.head())

# Step 3: X = inputs (flower measurements), y = Species (flower name)
X = df.drop("Species", axis=1)
y = df["Species"]

# Step 4: Split into train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 5: Train the tree
model = DecisionTreeClassifier(max_depth=3, random_state=42)
model.fit(X_train, y_train)

# Step 6: Predict on the test data
y_pred = model.predict(X_test)

# Step 7: Check the results (Iris has 3 classes, so we use average="macro")
print("Accuracy  :", accuracy_score(y_test, y_pred))
print("Precision :", precision_score(y_test, y_pred, average="macro"))
print("Recall    :", recall_score(y_test, y_pred, average="macro"))
print("F1 Score  :", f1_score(y_test, y_pred, average="macro"))
print(classification_report(y_test, y_pred))

# Step 8: Draw the tree
plt.figure(figsize=(12, 7))
plot_tree(model, feature_names=X.columns, class_names=model.classes_, filled=True)
plt.title("Decision Tree - Iris")
plt.show()
