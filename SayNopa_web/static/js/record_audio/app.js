import { api_url, localCache } from '../utils.js';
import { getUserInfo } from '../hooks.js';
$(function () {
  // 判断是否有用户名和id,有则在导航输出用户名,没有返回登录页面
  getUserInfo($('#bp-user'));
});

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; //stream from getUserMedia()
var recorder; //WebAudioRecorder object
var input; //MediaStreamAudioSourceNode  we'll be recording
var encodingType = 'mp3'; //holds selected encoding for resulting audio (file)
var encodeAfterRecord = true; // when to encode

// const apihost = 'http://www.yueming.top:8010';
const apihost = api_url;

// shim for AudioContext when it's not avb.
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

// var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById('recordButton');
var stopButton = document.getElementById('stopButton');

//add events to those 2 buttons
recordButton.addEventListener('click', initRecording);
stopButton.addEventListener('click', stopRecording);
uploadButton.addEventListener('click', uploadAudio);

var audioBlob;

function initRecording() {
  console.log('startRecording() called');

  var constraints = { audio: true, video: false };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      __log(
        'getUserMedia() success, stream created, initializing WebAudioRecorder...'
      );

      audioContext = new AudioContext();

      gumStream = stream;

      input = audioContext.createMediaStreamSource(stream);

      recorder = new WebAudioRecorder(input, {
        workerDir: 'js/', // must end with slash
        encoding: encodingType,
        numChannels: 2, //2 is the default, mp3 encoding supports only 2
        onEncoderLoading: function (recorder, encoding) {
          // show "loading encoder..." display
          __log('加载 ' + encoding + ' 编码器...');
        },
        onEncoderLoaded: function (recorder, encoding) {
          // hide "loading encoder..." display
          __log(encoding + ' 编码器已加载');

          __log('录音中...');
          start_count_recording_time();
        },
      });

      recorder.onComplete = function (recorder, blob) {
        // __log("Encoding complete");
        __log('语音处理完成');

        audioBlob = blob;
        stop_count_recording_time();
        createDownloadLink(blob, recorder.encoding);
      };

      recorder.setOptions({
        timeLimit: 120,
        encodeAfterRecord: encodeAfterRecord,
        ogg: { quality: 0.5 },
        mp3: { bitRate: 160 },
      });

      recorder.startRecording();

      __log('开始录音');
    })
    .catch(function (err) {
      //enable the record button if getUSerMedia() fails
      recordButton.disabled = false;
      stopButton.disabled = true;
    });

  //disable the record button
  recordButton.disabled = true;
  stopButton.disabled = false;
}

function stopRecording() {
  console.log('stopRecording() called');

  //stop microphone access
  gumStream.getAudioTracks()[0].stop();

  //disable the stop button
  stopButton.disabled = true;
  recordButton.disabled = false;

  //tell the recorder to finish the recording (stop recording + encode the recorded audio)
  recorder.finishRecording();

  __log('录音停止');
}

function createDownloadLink(blob, encoding) {
  var url = URL.createObjectURL(blob);
  var au = document.createElement('audio');
  var li = document.createElement('li');
  // var link = document.createElement('a');

  //add controls to the <audio> element
  au.controls = true;
  au.src = url;

  //link the a element to the blob
  // link.href = url;
  // link.download = new Date().toISOString() + '.'+encoding;
  // link.innerHTML = link.download;

  li.appendChild(au);
  // li.appendChild(link);

  uploadButton.style.display = 'block';
  recordingsList.style.display = 'block';
  if (recordingsList.childNodes.length == 0) {
    recordingsList.appendChild(li);
  } else {
    recordingsList.replaceChild(li, recordingsList.childNodes[0]);
  }
  controls.style.display = 'none';
  refreshButton.style.display = 'block';
}

function uploadAudio() {
  // var blob = new Blob(chunks, {type: ''})
  var encoding = 'mp3';
  if (!audioBlob) {
    alert('尚未录制音频，无法上传。');
    return;
  }

  recordingsList.style.display = 'none';
  uploadButton.style.display = 'none';

  console.log('blob', audioBlob);
  var file = new File(
    [audioBlob],
    'audio-' + new Date().toISOString().replace(/:|\./g, '-') + '.' + encoding,
    { type: 'audio/mpeg-3' }
  );
  var formData = new FormData();
  formData.append('file', file);
  __log('音频上传中');
  var request = new XMLHttpRequest();
  request.open(
    'POST',
    `${apihost}/file_save/${localCache.getItem('bpOpenId').replace(/"/g, '')}`
  );
  request.onload = async function (evt) {
    // alert("loaded!");

    console.log('save done: ', evt);
    const res = JSON.parse(evt.currentTarget.responseText);
    console.log('res:', res);

    if (res.status === 'success') {
      __log('音频上传成功');
      document.getElementById('fileId').textContent = res.file_id;
      request = null;
      await perform_diagnose_speech();
    }
  };
  request.upload.addEventListener('progress', uploadProgress, false);
  request.addEventListener('error', uploadFailed, false);
  request.send(formData);
}

function uploadProgress(evt) {
  if (evt.lengthComputable) {
    var percentComplete = Math.round((evt.loaded * 100) / evt.total);
    // document.getElementById('fileId').innerHTML = percentComplete.toString() + '%';
    __log('上传进度： ' + percentComplete.toString() + '%');
  } else {
    // document.getElementById('fileId').innerHTML = 'unable to compute';
    __log('unable to compute');
  }
}

function uploadFailed(evt) {
  alert('There was an error attempting to upload the file.');
}

async function perform_diagnose_speech() {
  const url = `${apihost}/diagnose_speech`;
  const fileId = parseInt(document.getElementById('fileId').textContent);
  __log('诊断中...');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });
  const data = await res.text();
  console.log('diagnose result: ', data);
  __log('语音诊断完成');
  const json = JSON.parse(data);
  if (json['status'] == 'success') {
    const pd = Math.round(json['PD'] * 100);
    __log('诊断完成, 有' + pd + '%患病风险');
    if (pd > 50) {
      resultMessage.innerHTML =
        '<span style="color:red;">患病风险：' + pd + '%</span>';
    } else {
      resultMessage.innerHTML =
        '<span style="color:lightgreen;">患病风险：' + pd + '%</span>';
    }
  }
}
var seconds = 0;
var interval;

function start_count_recording_time() {
  interval = setInterval(() => {
    seconds += 1;
    __log('录音中... ' + seconds + '秒');
    if (seconds > 10) {
      stopRecording();
      stop_count_recording_time();
    }
  }, 1000);
}

function stop_count_recording_time() {
  interval = window.clearInterval(interval);
}

//helper function
function __log(e, data) {
  // log.innerHTML += "\n" + e + " " + (data || '');
  log.innerHTML = '\n' + e + ' ' + (data || '');
}
