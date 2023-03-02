import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

data = pd.read_csv("./data/0.txt")

plt.subplot(1, 2, 1)
sns.scatterplot(data=data,x="rock",y="paper",label="rock/paper")
sns.scatterplot(data=data,x="paper",y="scissors",label="paper/scissors")
sns.scatterplot(data=data,x="scissors",y="rock",label="scissors/rock")

plt.subplot(1, 2, 2)
sns.lineplot(data=data)

plt.show()