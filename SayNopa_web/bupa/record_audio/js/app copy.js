//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
uploadButton.addEventListener("click", uploadAudio);

var audioBlob;

function startRecording() {
	console.log("startRecording() called");

	/*
		Simple constraints object, for more advanced features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false }

    /*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		__log("getUserMedia() success, stream created, initializing WebAudioRecorder...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		//update the format 
		document.getElementById("formats").innerHTML="Format: 2 channel "+encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value+" @ "+audioContext.sampleRate/1000+"kHz"

		//assign to gumStream for later use
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);
		
		//stop the input from playing back through the speakers
		//input.connect(audioContext.destination)

		//get the encoding 
		encodingType = encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value;
		
		//disable the encoding selector
		encodingTypeSelect.disabled = true;

		recorder = new WebAudioRecorder(input, {
		  workerDir: "js/", // must end with slash
		  encoding: encodingType,
		  numChannels:2, //2 is the default, mp3 encoding supports only 2
		  onEncoderLoading: function(recorder, encoding) {
		    // show "loading encoder..." display
		    __log("Loading "+encoding+" encoder...");
		  },
		  onEncoderLoaded: function(recorder, encoding) {
		    // hide "loading encoder..." display
		    __log(encoding+" encoder loaded");

			__log('录音中...')
		  }
		});

		recorder.onComplete = function(recorder, blob) { 
			__log("Encoding complete");
			
			audioBlob = blob;
			
			createDownloadLink(blob,recorder.encoding);
			encodingTypeSelect.disabled = false;
			// upload.style.visibility = "visible";
		}

		recorder.setOptions({
		  timeLimit:120,
		  encodeAfterRecord:encodeAfterRecord,
	      ogg: {quality: 0.5},
	      mp3: {bitRate: 160}
	    });

		//start the recording process
		recorder.startRecording();

		 __log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUSerMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;

	});

	//disable the record button
    recordButton.disabled = true;
    stopButton.disabled = false;
}

function stopRecording() {
	console.log("stopRecording() called");
	
	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//disable the stop button
	stopButton.disabled = true;
	recordButton.disabled = false;
	
	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
	recorder.finishRecording();

	__log('Recording stopped');
}

function createDownloadLink(blob,encoding) {
	// recordingList.removeChild()

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//link the a element to the blob
	link.href = url;
	link.download = new Date().toISOString() + '.'+encoding;
	link.innerHTML = link.download;

	//add the new audio and a elements to the li element
	li.appendChild(au);
	li.appendChild(link);

	//add the li element to the ordered list
	uploadButton.style.display = 'block';
	recordingsList.style.display = 'block'
	if (recordingsList.childNodes.length == 0) {
		recordingsList.appendChild(li);
	} else {
		recordingsList.replaceChild(li, recordingsList.childNodes[0]);
	}
}


function uploadAudio() {
		// var blob = new Blob(chunks, {type: ''})
		var encoding = 'mp3'
		if (!audioBlob) {
			alert('尚未录制音频，无法上传。')
			return
		}

		recordingsList.style.display = 'none'
		uploadButton.style.display = 'none'

		console.log('blob', audioBlob)
		var file = new File(
			[audioBlob], 
			'audio-' + new Date().toISOString().replace(/:|\./g, '-') + '.' + encoding, 
			{type: 'audio/mpeg-3'}
		);
		var formData = new FormData()
		formData.append('file', file)
		__log('音频上传中')
		var request = new XMLHttpRequest();
		request.open("POST", "http://www.yueming.top:8010/file_save/test");
		request.onload = async function(evt) {
			// alert("loaded!");
			
			console.log('save done: ', evt)
			const res = JSON.parse(evt.currentTarget.responseText )
			console.log('res:', res)

			if (res.status === 'success') {
				__log('音频上传成功');
				document.getElementById('fileId').textContent = res.file_id
				request = null
				await perform_diagnose_speech()

			}
		};
		request.upload.addEventListener("progress", uploadProgress, false);
		request.addEventListener("error", uploadFailed, false);
		request.send(formData);
}

function uploadProgress(evt) {
	if (evt.lengthComputable) {
		var percentComplete = Math.round(evt.loaded * 100 / evt.total);
		// document.getElementById('fileId').innerHTML = percentComplete.toString() + '%';
		__log('上传进度： '+percentComplete.toString() + '%')
	}
	else {
		// document.getElementById('fileId').innerHTML = 'unable to compute';
		__log('unable to compute')
	}
}

function uploadFailed(evt) {
	alert("There was an error attempting to upload the file.");
}


async function perform_diagnose_speech() {
	const url = 'http://www.yueming.top:8010/diagnose_speech'
	const fileId = parseInt( document.getElementById('fileId').textContent )
	__log('诊断中...')
	const res = await fetch(url, {
		method: 'POST', 
		headers: {'Content-Type': 'application/json'}, 
		body: JSON.stringify( {file_id: fileId})
	})
	const data = await res.text()
	console.log('diagnose result: ', data)
	// document.getElementById('resultIframe').style.display= "block";
	// document.getElementById('resultIframe').src = "data:text/html;charset=utf-8," + escape(data);
	checkResult.style.disaplay = 'block';
	document.getElementById('checkResult').value = data; // JSON.stringify(data, null, 2);
	__log('声音检测完成');
	const json = JSON.parse(data)
	if (json['status'] == 'success' ) {
		__log('诊断完成, 有' + Math.round(json['PD']*100) + '%患病风险')
	}
}


//helper function
function __log(e, data) {
	// log.innerHTML += "\n" + e + " " + (data || '');
	log.innerHTML = "\n" + e + " " + (data || '');
}