import { api_url, localCache } from '../utils.js';
import { getUserInfo } from '../hooks.js';
$(function () {
  // 判断是否有用户名和id,有则在导航输出用户名,没有返回登录页面
  getUserInfo($('#bp-user'));
});

var camera_stream; //stream from getUserMedia()
var media_recorder; //WebAudioRecorder object
var input; //MediaStreamAudioSourceNode  we'll be recording
// var encodingType = 'mp3'; 					//holds selected encoding for resulting audio (file)
// var encodeAfterRecord = true;       // when to encode
var chunks = [];
var videoBlob;

const apihost = api_url;

var recordButton = document.getElementById('recordButton');
var stopButton = document.getElementById('stopButton');
var uploadButton = document.getElementById('uploadButton');
var diagnoseButton = document.getElementById('diagnoseButton');
var refreshButton = document.getElementById('refreshButton');

recordButton.addEventListener('click', initRecording);
stopButton.addEventListener('click', stopRecording);
uploadButton.addEventListener('click', uploadVideo);
diagnoseButton.addEventListener('click', perform_diagnose_face);

function initRecording() {
  console.log('startRecording() called');
  var constraints = { audio: false, video: true };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      // __log("getUserMedia() success, stream created...");
      __log('视频录制初始化中...');
      camera_stream = stream;
      video.srcObject = camera_stream;

      startRecord();
    })
    .catch((err) => {
      __log('error: ' + err);
      recordButton.disabled = false;
      stopButton.disabled = true;
    });
}

function startRecord() {
  media_recorder = new MediaRecorder(camera_stream, {
    mimeType: 'video/webm;codecs=h264',
  });

  media_recorder.addEventListener('dataavailable', function (e) {
    chunks.push(e.data);
  });

  media_recorder.addEventListener('stop', handleRecord);

  media_recorder.start(1000);
  __log('开始录制');
  start_count_recording_time();

  recordButton.disabled = true;
  stopButton.disabled = false;
}

function stopRecording() {
  __log('停止录像...');
  media_recorder.stop();
  stop_count_recording_time();
}

function handleRecord() {
  __log('录像已停止，处理中...');
  videoBlob = new Blob(chunks, { type: 'video/webm' });
  console.log('blob: ', videoBlob);
  downloadVideoLink.href = URL.createObjectURL(videoBlob);

  recordButton.style.display = 'none';
  stopButton.style.display = 'none';
  // downloadVideoLink.style.display = 'block';
  uploadButton.style.display = 'block';
  refreshButton.style.display = 'block';

  video.srcObject = null;
  // recordedBlock.style.visibility = 'visible'
  __log('视频处理完成，可上传');

  previewVideo();
}

function previewVideo() {
  if (downloadVideoLink.href) {
    console.log('preview', downloadVideoLink.href);
    video.src = downloadVideoLink.href;
  }
}

function uploadVideo() {
  // const video_blob = downloadVideoLink.href
  console.log('videoBlob', videoBlob);
  var file = new File(
    [videoBlob],
    'vidio-' + new Date().toISOString().replace(/:|\./g, '-') + '.webm',
    { type: 'video/webm' }
  );
  var formData = new FormData();
  formData.append('file', file);
  var request = new XMLHttpRequest();
  request.open(
    'POST',
    `${apihost}/file_save/${localCache.getItem('bpOpenId').replace(/"/g, '')}`
  );
  request.onload = async function (evt) {
    __log('视频已上传');
    console.log('save done: ', evt);
    const res = JSON.parse(evt.currentTarget.responseText);
    console.log('res:', res);

    if (res.status === 'success') {
      document.getElementById('fileId').textContent = res.file_id;
      request = null;
      __log('视频上传成功');
      // uploadButton.style.display = 'block'
      diagnoseButton.style.display = 'block';
      refreshButton.style.display = 'block';
      // await perform_diagnose_face()
    }
  };
  // request.upload.addEventListener("progress", uploadProgress, false);
  request.addEventListener(
    'error',
    () => alert('There was an error attempting to upload the file.'),
    false
  );

  __log('视频上传中...');
  uploadButton.style.display = 'none';
  refreshButton.style.display = 'none';
  request.send(formData);
}

async function perform_diagnose_face() {
  diagnoseButton.disabled = true;
  const url = `${apihost}/diagnose_face`;
  const fileId = parseInt(document.getElementById('fileId').textContent);

  __log('开始诊断，结果大概10s后生成...');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });
  const data = await res.text();
  console.log('diagnose result: ', data);

  refreshButton.style.display = 'block';
  __log('面部诊断完成');

  const json = JSON.parse(data);
  if (json['status'] == 'success') {
    if (json['error']) {
      if (json['error_reason'] == '文件正在转码，请等待') {
        __log('文件正在转码，请等待大约20s左右，再点击“开始诊断”');
      } else {
        __log('诊断错误：', json['error_reason']);
      }
    } else if ('PD' in json) {
      diagnoseButton.style.display = 'none';
      const pd = Math.round(json['PD'] * 100);

      if (pd > 50) {
        __log('患病风险：' + pd + '%');
        resultMessage.innerHTML =
          '<span style="color:red;">有帕金森病的风险</span>';
      } else {
        __log('患病风险：' + pd + '%');
        resultMessage.innerHTML =
          '<span style="color:lightgreen;">恭喜你，你很健康</span>';
      }
    }
  }
  diagnoseButton.disabled = false;
}

var seconds = 0;
var interval;

function start_count_recording_time() {
  interval = setInterval(() => {
    seconds += 1;
    __log('视频录制中... ' + seconds + '秒');
  }, 1000);
}

function stop_count_recording_time() {
  interval = window.clearInterval(interval);
}

function __log(e, data) {
  // log.innerHTML += "\n" + e + " " + (data || '');
  log.innerHTML = '\n' + e + ' ' + (data || '');
}
