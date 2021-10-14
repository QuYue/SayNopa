#%% Import Packages
import pandas as pd
import numpy as np
import pickle
import parselmouth
import matplotlib.pyplot as plt
import seaborn as sns

#%%
def tofloat(text):
    if 'undefined' in text:
        return 0.0
    if '(' in text:
        text = text.split('(')[0]
    if '%' in text:
        t = text.index('%')
        text=text[:t]
        z = float(text)

    elif 'seconds' in text:
        text=text[:-7]
        z = float(text)
    elif 'dB' in text:
        text=text[:-2]
        z = float(text)
    elif 'Hz' in text:
        text=text[:-2]
        z = float(text)
    else:
        z = float(text)
    return z

def get(name, voice_report):
    i = voice_report.index(f"{name}: ") + len(f"{name}: ")
    j = voice_report.index("\n", i)
    return tofloat(voice_report[i:j])

#%%
with open('./gbdt.pkl', 'rb') as f:
    model = pickle.load(f)

#%%
sns.set() # Use seaborn's default style to make attractive graphs
plt.rcParams['figure.dpi'] = 100 # Show nicely large images in this notebook

# %%
name = "2021-10-14_09-05-24.mp3"
file_name = name.split('.')[0]
snd = parselmouth.Sound(name)

plt.figure()
plt.plot(snd.xs(), snd.values.T)
plt.xlim([snd.xmin, snd.xmax])
plt.xlabel("time [s]")
plt.ylabel("amplitude")
plt.show()
# plt.savefig(f"{file_name}.png")
plt.close()
pitch =snd.to_pitch()
pulses = parselmouth.praat.call([snd, pitch], 'To PointProcess (cc)')

# %%
point_process = parselmouth.praat.call([snd, pitch], "To PointProcess (cc)")
voice_report=parselmouth.praat.call([snd, pitch, point_process], "Voice report", 0, 0, 75, 600, 1.3, 1.6, 0.03, 0.45)

#%%
feature_name = ['Jitter (local)','Jitter (local, absolute)','Jitter (rap)','Jitter (ppq5)','Jitter (ddp)',
                 'Shimmer (local)', 'Shimmer (local, dB)', 'Shimmer (apq3)', 'Shimmer (apq5)', 'Shimmer (apq11)', 'Shimmer (dda)',
                 'Mean autocorrelation', 'Mean noise-to-harmonics ratio', 'Mean harmonics-to-noise ratio',
                 'Median pitch', 'Mean pitch', 'Standard deviation', 'Minimum pitch', 'Maximum pitch',
                 'Number of pulses', 'Number of periods', 'Mean period', 'Standard deviation of period', 'Fraction of locally unvoiced frames', 'Number of voice breaks', 'Degree of voice breaks'
]
feature = []
for name in feature_name:
    feature.append(get(name, voice_report))


# %%
d = pd.read_csv('train_data.txt', header=None)
d = d.iloc[:,1:27]
d.columns = feature_name
d = d.iloc[:5,:]
# %%

d.loc['new'] = feature
# %%
feature = np.array(feature).reshape(1,-1)
# %%
y_pred= model.predict(feature)
y_predprob= model.predict_proba(feature)[:,1]
print(y_pred, y_predprob)
# %%
