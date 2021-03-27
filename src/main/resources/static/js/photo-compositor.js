const supported = 'mediaDevices' in navigator;

const cameraView = document.getElementById('camera');
const photoCanvas = document.getElementById('canvas');
const context = photoCanvas.getContext('2d');
const imgRiot = document.getElementById('img-riot');
const btnCapture = document.getElementById('btn-capture');
const btnRetry = document.getElementById('btn-retry');
const cameraWarning = document.getElementById('camera-warning');
let cameraX = 0;
let cameraY = 0;

if (supported) {
	showCameraView();
} else {
	cameraWarning.style.display = "block";
}

function takePhoto()  {
	context.drawImage(cameraView, 0, 0, photoCanvas.width, photoCanvas.height);
	context.drawImage(imgRiot, 0, 400, imgRiot.width, imgRiot.height);
	hideCameraView();
}

function hideCameraView() {
	// this is broken in current version of Chrome, may be able to bring it back later
	// cameraView.srcObject.getVideoTracks().forEach(track => track.stop());
	cameraView.style.display = "none";
	photoCanvas.style.display = "block";
	btnCapture.style.display = "none";
	btnRetry.style.display = "block";
}

function showCameraView() {
	photoCanvas.style.display = "none";
	cameraView.style.display = "block";
	btnRetry.style.display = "none";
	
	const constraints = {
		video: true,
	};
	
	// Attach the video stream to the video element and autoplay.
	navigator.mediaDevices.getUserMedia(constraints)
		.then((stream) => {
			cameraView.srcObject = stream;
			cameraX = stream.getVideoTracks()[0].getSettings().width;
			cameraY = stream.getVideoTracks()[0].getSettings().height;
			console.log(cameraX);
			console.log(cameraY);
			document.getElementById('btn-capture').style.display = "block";
		}).catch(function() {
			cameraWarning.style.display = "block";
	});
}
