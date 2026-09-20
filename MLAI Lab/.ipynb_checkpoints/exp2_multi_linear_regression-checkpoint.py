# Experiment 2: Multiple Linear Regression
# (Bedrooms, Plot Area, Location, Age -> Price)
# Dataset: "House Sales in King County, USA" from Kaggle
# Link: https://www.kaggle.com/datasets/harlfoxem/housesalesprediction
# Download it and keep kc_house_data.csv in the SAME folder as this file.

# Step 1: Import the libraries
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score

# Step 2: Read the file
df = pd.read_csv("kc_house_data.csv")

# Step 3: Make our 4 features + price
#   Rooms     = bedrooms
#   PlotArea  = sqft_lot
#   Location  = zipcode
#   Age       = 2015 - year built (this data is from 2014-2015)
data = pd.DataFrame()
data["Rooms"] = df["bedrooms"]
data["PlotArea"] = df["sqft_lot"]
data["Age"] = 2015 - df["yr_built"]
data["Location"] = df["zipcode"].astype(str)    # zipcode is a name, not a number
data["Price"] = df["price"]
data = data.dropna()
data = data[data["Rooms"] <= 10]                # remove unusual houses
print(data.head())

# Step 4: Location is text, so change it into 0/1 columns
data = pd.get_dummies(data, columns=["Location"], drop_first=True, dtype=int)

# Step 5: Split into input (X) and output (y), then train/test
X = data.drop("Price", axis=1)
y = data["Price"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 6: Model WITHOUT scaling
model1 = LinearRegression()
model1.fit(X_train, y_train)
pred1 = model1.predict(X_test)
print("Without scaling -> MSE:", mean_squared_error(y_test, pred1), " R2:", r2_score(y_test, pred1))

# Step 7: Model WITH Standardization (mean = 0, spread = 1)
num_cols = ["Rooms", "PlotArea", "Age"]     # only scale the number columns
X_train_std = X_train.copy()
X_test_std = X_test.copy()
std = StandardScaler()
X_train_std[num_cols] = std.fit_transform(X_train[num_cols])
X_test_std[num_cols] = std.transform(X_test[num_cols])

model2 = LinearRegression()
model2.fit(X_train_std, y_train)
pred2 = model2.predict(X_test_std)
print("Standardized    -> MSE:", mean_squared_error(y_test, pred2), " R2:", r2_score(y_test, pred2))

# Step 8: Model WITH Normalization (values between 0 and 1)
X_train_mm = X_train.copy()
X_test_mm = X_test.copy()
mm = MinMaxScaler()
X_train_mm[num_cols] = mm.fit_transform(X_train[num_cols])
X_test_mm[num_cols] = mm.transform(X_test[num_cols])

model3 = LinearRegression()
model3.fit(X_train_mm, y_train)
pred3 = model3.predict(X_test_mm)
print("Normalized      -> MSE:", mean_squared_error(y_test, pred3), " R2:", r2_score(y_test, pred3))

# Step 9: Compare the coefficients of the 3 number columns
# (after scaling, a bigger number means that column affects price more)
print(pd.DataFrame({
    "Feature": num_cols,
    "Normal coef": model1.coef_[:3],
    "Scaled coef": model2.coef_[:3]
}))

# Step 10: Graph of actual price vs predicted price
plt.scatter(y_test, pred2, color="blue", alpha=0.3)
plt.plot([y.min(), y.max()], [y.min(), y.max()], "r--")   # perfect prediction line
plt.xlabel("Actual Price")
plt.ylabel("Predicted Price")
plt.title("Actual vs Predicted Price")
plt.show()
