# Experiment 5: Decision Tree on the Titanic dataset
# Dataset: "Titanic - Machine Learning from Disaster" from Kaggle
# Link: https://www.kaggle.com/competitions/titanic
# Download train.csv (Data tab) and keep it in the SAME folder as this file.

# Step 1: Import the libraries
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# Step 2: Read the file and look for missing values
df = pd.read_csv("train.csv")
print(df.head())
print(df.isnull().sum())

# Step 3: Remove columns that are not useful
df = df.drop(["PassengerId", "Name", "Ticket", "Cabin"], axis=1)

# Step 4: Fill the missing values
df["Age"] = df["Age"].fillna(df["Age"].median())              # middle age
df["Embarked"] = df["Embarked"].fillna(df["Embarked"].mode()[0])   # most common port

# Step 5: Change text columns into numbers
df["Sex"] = df["Sex"].map({"male": 0, "female": 1})
df = pd.get_dummies(df, columns=["Embarked"], drop_first=True, dtype=int)

# Step 6: X = inputs, y = Survived (1 = survived, 0 = died)
X = df.drop("Survived", axis=1)
y = df["Survived"]

# Step 7: Split into train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 8: Train the tree (max_depth=4 keeps the tree small and easy to read)
model = DecisionTreeClassifier(max_depth=4, random_state=42)
model.fit(X_train, y_train)

# Step 9: Test the model
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))

# Step 10: Draw the tree
plt.figure(figsize=(20, 10))
plot_tree(model, feature_names=X.columns, class_names=["Died", "Survived"], filled=True)
plt.title("Decision Tree - Titanic")
plt.show()
