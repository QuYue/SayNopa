#%%
import parselmouth
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# %%
file = '../../resources/received_file/oF2W85FVL-qPylS2me0TWdV1F6sY/2021-10-14_09-05-24.mp3'
snd = parselmouth.Sound(file)
plt.figure()
plt.plot(snd.xs(), snd.values.T)
plt.xlim([snd.xmin, snd.xmax])
plt.xlabel("time [s]")
plt.ylabel("amplitude")
plt.show() # or plt.savefig("sound.png"), or plt.savefig("sound.pdf")
# %%
pitch =snd.to_pitch()
pulses = parselmouth.praat.call([snd, pitch], 'To PointProcess (cc)')
# %%
point_process = parselmouth.praat.call([snd, pitch], "To PointProcess (cc)")
voice_report=parselmouth.praat.call([snd, pitch, point_process], "Voice report", 0, 0, 75, 600, 1.3, 1.6, 0.03, 0.45)
# voice_report = parselmouth.praat.call([snd, pitch, point_process], "Voice report", 0, 0, 75, 600, 1.3, 1.6, 0.03, 0.45)
# %%
def tofloat(text):
    if '(' in text:
        text = text.split('(')[0]
    if '%' in text:
        t = text.index('%')
        text=text[:t]
        z = float(text)
        z /=100
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

def get(name):
    i = voice_report.index(f"{name}: ") + len(f"{name}: ")
    j = voice_report.index("\n", i)
    return tofloat(voice_report[i:j])


# %%
jitter_local = parselmouth.praat.call(pulses, "Get jitter (local)", 0.0, 0.0, 0.0001, 0.02, 1.3)
print(f"jitter_local:{jitter_local} {get('Jitter (local)')}")
jitter_local_ab = parselmouth.praat.call(pulses, "Get jitter (local, absolute)", 0.0, 0.0, 0.0001, 0.02, 1.3)
print(f"jitter_local_abs:{jitter_local_ab} {get('Jitter (local, absolute)')}")
jitter_rap = parselmouth.praat.call(pulses, "Get jitter (rap)", 0.0, 0.0, 0.0001, 0.02, 1.3)
print(f"jitter_rap:{jitter_rap} {get('Jitter (rap)')}")
jitter_ppq5 = parselmouth.praat.call(pulses, "Get jitter (ppq5)", 0.0, 0.0, 0.0001, 0.02, 1.3)
print(f"jitter_ppq5:{jitter_ppq5} {get('Jitter (ppq5)')}")
jitter_ddp = parselmouth.praat.call(pulses, "Get jitter (ddp)", 0.0, 0.0, 0.0001, 0.02, 1.3)
print(f"jitter_ddp:{jitter_ddp} {get('Jitter (ddp)')}")
shimmer_local = parselmouth.praat.call([snd, pulses], "Get shimmer (local)", 0.0, 0.0, 0.0001, 0.02, 1.3, 1.6)
print(f"shimmer_local:{shimmer_local} {get('Jitter (local)')}")
print(f"shimmer_dda:{get('Shimmer (local, dB)')}")
shimmer_apq3= parselmouth.praat.call([snd, pulses], "Get shimmer (apq3)", 0.0, 0.0, 0.0001, 0.02, 1.3, 1.6)
print(f"shimmer_apq3:{shimmer_apq3} {get('Shimmer (apq3)')}")
shimmer_apq5= parselmouth.praat.call([snd, pulses], "Get shimmer (apq5)", 0.0, 0.0, 0.0001, 0.02, 1.3, 1.6)
print(f"shimmer_apq5:{shimmer_apq5} {get('Shimmer (apq5)')}")
shimmer_apq11= parselmouth.praat.call([snd, pulses], "Get shimmer (apq11)", 0.0, 0.0, 0.0001, 0.02, 1.3, 1.6)
print(f"shimmer_apq11:{shimmer_apq11} {get('Shimmer (apq11)')}")
shimmer_dda= parselmouth.praat.call([snd, pulses], "Get shimmer (dda)", 0.0, 0.0, 0.0001, 0.02, 1.3, 1.6)
print(f"shimmer_dda:{shimmer_dda} {get('Shimmer (dda)')}")
print(f"AC: {get('Mean autocorrelation')}")
print(f"NTH:{ get('Mean noise-to-harmonics ratio')}")
print(f"HTN:{ get('Mean harmonics-to-noise ratio')}")
print(f"Median_pitch: {get('Median pitch')}")
print(f"Mean_pitch: {get('Mean pitch')}")
print(f"Standard_deviation: {get('Standard deviation')}")
print(f"Minimum_pitch: {get('Minimum pitch')}")
print(f"Maximum_pitch: {get('Maximum pitch')}")
print(f"Number_of_pulses: {get('Number of pulses')}")
print(f"Number_of_periods: {get('Number of periods')}")
print(f"Mean_period: {get('Mean period')}")
print(f"Standard_deviation_of_period: {get('Standard deviation of period')}")
print(f"Fraction_of_locally_unvoiced_frames: {get('Fraction of locally unvoiced frames')}")
print(f"Number_of_voice_breaks: {get('Number of voice breaks')}")
print(f"Fraction_of_locally_unvoiced_frames: {get('Fraction of locally unvoiced frames')}")
print(f"Degree_of_voice_breaks: {get('Degree of voice breaks')}")
# %%
# %%
