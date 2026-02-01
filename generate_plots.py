import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Load Data
# Assuming running from project root
df = pd.read_csv('server/training/data/cycle_data.csv')

# Data Cleaning: Convert columns to numeric, coercing errors (like ' ') to NaN
numeric_cols = ['CycleLength-1', 'CycleLength-2', 'CycleLength-3', 'CumulativeAverages', 'Age', 'BMI', 'LengthofCycle']
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Drop rows with any NaN values in these columns
df = df.dropna(subset=numeric_cols)

# Set Style
sns.set_theme(style="whitegrid")

# 1. Cycle Length Distribution
plt.figure(figsize=(10, 6))
sns.histplot(df['LengthofCycle'], bins=20, kde=True, color='#E8B4B8')
plt.title('Distribution of Menstrual Cycle Lengths', fontsize=16)
plt.xlabel('Days', fontsize=12)
plt.ylabel('Frequency', fontsize=12)
plt.axvline(df['LengthofCycle'].mean(), color='r', linestyle='--', label=f'Mean: {df["LengthofCycle"].mean():.1f} days')
plt.legend()
plt.savefig('cycle_distribution.png')
# plt.show()

# 2. Correlation Matrix
features = ['CycleLength-1', 'CycleLength-2', 'CycleLength-3', 'CumulativeAverages', 'Age', 'BMI', 'LengthofCycle']
corr = df[features].corr()

plt.figure(figsize=(10, 8))
sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Feature Correlation Matrix', fontsize=16)
plt.savefig('feature_correlation.png')
# plt.show()

print("Plots generated: cycle_distribution.png, feature_correlation.png")
