#%%
import pandas as pd
import numpy as np
import sklearn
from sklearn import model_selection
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn import  metrics
from sklearn.model_selection import GridSearchCV
import pickle

#%%
feature_name = ['Jitter (local)','Jitter (local, absolute)','Jitter (rap)','Jitter (ppq5)','Jitter (ddp)',
                 'Shimmer (local)', 'Shimmer (local, dB)', 'Shimmer (apq3)', 'Shimmer (apq5)', 'Shimmer (apq11)', 'Shimmer (dda)',
                 'AC', 'NTH', 'HTN',
                 'Median pitch', 'Mean pitch', 'Standard deviation', 'Minimum pitch', 'Maximum pitch',
                 'Number of pulses', 'Number of periods', 'Mean period', 'Standard deviation of period', 'Fraction of locally unvoiced frames', 'Number of voice breaks', 'Degree of voice breaks'
]

d1 = pd.read_csv('train_data.txt', header=None)
d2 = pd.read_csv('test_data.txt', header=None)

random_state = 0
# %%
feature1 = d1.iloc[:,1:27]
result1 = d1.iloc[:,28:29]

feature2 = d2.iloc[:,1:27]
result2 = d2.iloc[:,27:28]

feature1.columns = feature_name
result1.columns = ['PD']
feature2.columns = feature_name
result2.columns = ['PD']

feature = pd.concat([feature1, feature2], axis=0)
result = pd.concat([result1, result2], axis = 0)

# %%
X_train, X_test, y_train, y_test = model_selection.train_test_split(feature.to_numpy(), result.to_numpy(), test_size=0.2, random_state=random_state)

y_train = y_train.reshape(-1)
y_test =  y_test.reshape(-1)
# %%
gbdt = GradientBoostingClassifier(n_estimators=200)
gbdt.fit(X_train, y_train)

y_pred= gbdt.predict(X_test)
y_predprob= gbdt.predict_proba(X_test)[:,1]
print("Accuracy : %.4g" % metrics.accuracy_score(y_test, y_pred))
print("AUC Score (Train): %f" % metrics.roc_auc_score(y_test, y_predprob))

# %%
param_test1= {'n_estimators':range(20,81,10)}
gsearch1= GridSearchCV(estimator = GradientBoostingClassifier(learning_rate=0.1,min_samples_split=300,min_samples_leaf=20,max_depth=8,max_features='sqrt',subsample=0.8,random_state=10),
param_grid= param_test1, scoring='roc_auc', cv=5)
gsearch1.fit(X_train, y_train)

print("Best: %f using %s" % (gsearch1.best_score_,gsearch1.best_params_))
# 'n_estimators': 70
# %%
param_test2= {'max_depth':range(3,14,2), 'min_samples_split':range(100,801,200)}
gsearch2= GridSearchCV(estimator = GradientBoostingClassifier(learning_rate=0.1,n_estimators=70, min_samples_leaf=20, max_features='sqrt', subsample=0.8,random_state=10),
param_grid= param_test2,scoring='roc_auc',cv=5)
gsearch2.fit(X_train, y_train)

print("Best: %f using %s" % (gsearch2.best_score_,gsearch2.best_params_))
# 'max_depth': 7, 'min_samples_split': 100
# %%
param_test3= {'min_samples_split':range(10,500,50),'min_samples_leaf':range(10,101,10)}
gsearch3= GridSearchCV(estimator = GradientBoostingClassifier(learning_rate=0.1,n_estimators=70,max_depth=7,max_features='sqrt',subsample=0.8,random_state=10),param_grid=param_test3,scoring='roc_auc',cv=5)
gsearch3.fit(X_train, y_train)
print("Best: %f using %s" % (gsearch3.best_score_,gsearch3.best_params_))
# 'min_samples_leaf': 20, 'min_samples_split': 60

# %%
param_test4= {'max_features':range(7,20,2)}
gsearch4= GridSearchCV(estimator = GradientBoostingClassifier(learning_rate=0.1,n_estimators=70,max_depth=7, min_samples_leaf =20, min_samples_split =60,subsample=0.8, random_state=10),
param_grid= param_test4,scoring='roc_auc',cv=5)
gsearch4.fit(X_train, y_train)
print("Best: %f using %s" % (gsearch4.best_score_,gsearch4.best_params_))
# 'max_features': 13
# %%
gbdt_c = GradientBoostingClassifier(learning_rate=0.1,n_estimators=70,max_depth=7, min_samples_leaf =20, min_samples_split =60,subsample=0.8, max_features=13, random_state=10)

gbdt_c.fit(X_train, y_train)
y_pred= gbdt_c.predict(X_test)
y_predprob= gbdt_c.predict_proba(X_test)[:,1]
print("Accuracy : %.4g" % metrics.accuracy_score(y_test, y_pred))
print("AUC Score (Train): %f" % metrics.roc_auc_score(y_test, y_predprob))

# %%
# gbdt_r = GradientBoostingRegressor(n_estimators=200)
# gbdt_r.fit(X_train, y_train[:,0])

# y_pred= gbdt_r.predict(X_test)
# print("MSE : %.4g" % metrics.mean_squared_error(y_test[:,0], y_pred))

# %%
with open('./gbdt.pkl', 'wb') as f:
    pickle.dump(gbdt_c, f)
    print("保存模型成功！")
# %%
with open('./gbdt.pkl', 'rb') as f:
    model = pickle.load(f)
y_pred= model.predict(X_test)
y_predprob= model.predict_proba(X_test)[:,1]
print("Accuracy : %.4g" % metrics.accuracy_score(y_test, y_pred))
print("AUC Score (Train): %f" % metrics.roc_auc_score(y_test, y_predprob))

y_pred= model.predict(X_train)
y_predprob= model.predict_proba(X_train)[:,1]
print("Accuracy : %.4g" % metrics.accuracy_score(y_train, y_pred))
print("AUC Score (Train): %f" % metrics.roc_auc_score(y_train, y_predprob))

# %%
