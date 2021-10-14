#%% Import Packages
import pandas as pd
import numpy as np
import pickle
import parselmouth
import matplotlib.pyplot as plt
import seaborn as snsee

#%%
class GBDT():
    def __init__(self, model_path):
        self.model = self.get_model(model_path)
        self.feature_name = ['Jitter (local)','Jitter (local, absolute)','Jitter (rap)','Jitter (ppq5)','Jitter (ddp)',
                 'Shimmer (local)', 'Shimmer (local, dB)', 'Shimmer (apq3)', 'Shimmer (apq5)', 'Shimmer (apq11)', 'Shimmer (dda)',
                 'Mean autocorrelation', 'Mean noise-to-harmonics ratio', 'Mean harmonics-to-noise ratio',
                 'Median pitch', 'Mean pitch', 'Standard deviation', 'Minimum pitch', 'Maximum pitch',
                 'Number of pulses', 'Number of periods', 'Mean period', 'Standard deviation of period', 'Fraction of locally unvoiced frames', 'Number of voice breaks', 'Degree of voice breaks']                


    def get_model(self, model_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        return model
    
    def predict(self, sound_path):
        sound = parselmouth.Sound(sound_path)
        feature = self.get_feature(sound)
        # y_pred = self.model.predict(feature)
        y_predprob =self.model.predict_proba(feature)[:,1]
        y_predprob = y_predprob[0] 
        return y_predprob, self.out_feature(feature)
        
    def out_feature(self, feature):
        feature = dict(zip(self.feature_name, feature[0].tolist()))
        return feature

    def tofloat(self, text):
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

    def get(self, name, voice_report):
        i = voice_report.index(f"{name}: ") + len(f"{name}: ")
        j = voice_report.index("\n", i)
        return self.tofloat(voice_report[i:j])

    def get_feature(self, sound):
        pitch =sound.to_pitch()
        # pulses = parselmouth.praat.call([sound, pitch], 'To PointProcess (cc)')
        point_process = parselmouth.praat.call([sound, pitch], "To PointProcess (cc)")
        voice_report = parselmouth.praat.call([sound, pitch, point_process], "Voice report", 0, 0, 75, 600, 1.3, 1.6, 0.03, 0.45)

        feature = []
        for name in self.feature_name:
            feature.append(self.get(name, voice_report))

        feature = np.array(feature).reshape(1,-1)
        return feature


#%%
if __name__ == "__main__":
    model = GBDT('../model/gbdt.pkl')
    import mysql
    mc = mysql.mysql_connecter()
    path = mc.find_file_id(6)
    path = '.' + path[1]['file_path']
    result, feature = model.predict(path)
    
# %%
