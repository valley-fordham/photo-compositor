const supported = 'mediaDevices' in navigator;

const cameraView = document.getElementById('camera');
const photoCanvas = document.getElementById('canvas');
const context = photoCanvas.getContext('2d');
const imgRiot = document.getElementById('img-riot');
const btnCapture = document.getElementById('btn-capture');
const btnRetry = document.getElementById('btn-retry');

if (supported) {
	showCameraView();
} else {
	console.log('camera not supported');
}

function takePhoto()  {
	context.drawImage(cameraView, 0, 0, photoCanvas.width, photoCanvas.height);
	context.drawImage(imgRiot, 0, 160, imgRiot.width, imgRiot.height);
	hideCameraView();
}

function hideCameraView() {
	cameraView.srcObject.getVideoTracks().forEach(track => track.stop());
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
			document.getElementById('btn-capture').style.display = "block";
		});
}
