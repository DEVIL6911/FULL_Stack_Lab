# Experiment 1: Simple Linear Regression (Number of Bedrooms vs Price)
# Dataset: "House Sales in King County, USA" from Kaggle
# Link: https://www.kaggle.com/datasets/harlfoxem/housesalesprediction
# Download it and keep kc_house_data.csv in the SAME folder as this file.

# Step 1: Import the libraries we need
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Step 2: Read the file
df = pd.read_csv("kc_house_data.csv")
print(df.head())

# Step 3: Keep only the 2 columns we need and remove wrong data
df = df[["bedrooms", "price"]]
df = df.dropna()                 # remove empty rows
df = df[df["bedrooms"] <= 10]    # remove unusual houses (one house has 33 bedrooms)

# Step 4: X is the input (bedrooms), y is what we want to predict (price)
X = df[["bedrooms"]]
y = df["price"]

# Step 5: Split the data - 80% for training, 20% for testing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 6: Create the model and train it
model = LinearRegression()
model.fit(X_train, y_train)

# Step 7: Predict the price for the test data
y_pred = model.predict(X_test)

# Step 8: Check how good the model is
print("Slope     :", model.coef_[0])
print("Intercept :", model.intercept_)
print("MSE       :", mean_squared_error(y_test, y_pred))   # lower is better
print("R2 Score  :", r2_score(y_test, y_pred))             # closer to 1 is better

# Step 9: Draw the graph with the regression line
plt.scatter(X_test, y_test, color="blue", alpha=0.3, label="Actual data")
plt.plot(X_test, y_pred, color="red", label="Regression line")
plt.xlabel("Number of Bedrooms")
plt.ylabel("Price")
plt.title("House Price vs Bedrooms")
plt.legend()
plt.show()
