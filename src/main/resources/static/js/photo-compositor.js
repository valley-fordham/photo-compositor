const supported = 'mediaDevices' in navigator;

const cameraView = document.getElementById('camera');
const photoCanvas = document.getElementById('canvas');
const context = photoCanvas.getContext('2d');
const imgRiot = document.getElementById('img-riot');
const photoTitle = document.getElementById('img-photo-title');
const btnCapture = document.getElementById('btn-capture');
const btnRetry = document.getElementById('btn-retry');
const btnDownload = document.getElementById('btn-download');
const txtCameraNotSupported = document.getElementById('camera-not-supported');
const txtCameraNoPermission = document.getElementById('camera-no-permission');
const txtLandscapeNotSupported = document.getElementById('landscape-not-supported');
let isPhotoDisplayed = false;
let cameraX = 0;
let cameraY = 0;

window.addEventListener("orientationchange", function() {
	checkOrientation();
}, false);

function checkOrientation() {
	if (window.orientation === 90) {
		cameraView.style.display = "none";
		btnCapture.style.display = "none";
		photoCanvas.style.display = "none";
		btnCapture.style.display = "none";
		btnDownload.style.display = "none";
		btnRetry.style.display = "none";
		txtLandscapeNotSupported.style.display = "block";
	} else if (supported) {
		if (isPhotoDisplayed) {
			photoCanvas.style.display = "block";
			btnDownload.style.display = "block";
			btnRetry.style.display = "block";
		} else {
			cameraView.style.display = "block";
			btnCapture.style.display = "block";
		}
		txtLandscapeNotSupported.style.display = "none";
	}
}

if (supported) {
	showCameraView();
} else {
	txtCameraNotSupported.style.display = "block";
}

function takePhoto()  {	
	context.drawImage(cameraView, 0, 0, photoCanvas.width, photoCanvas.height);
	context.drawImage(imgRiot, 0, 400, imgRiot.width, imgRiot.height);
	context.drawImage(photoTitle, 0, 20, photoTitle.width, photoTitle.height);
	hideCameraView();
}

function hideCameraView() {
	// this is broken in current version of Chrome, may be able to bring it back later
	if (!(/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor))) {
		cameraView.srcObject.getVideoTracks().forEach(track => track.stop());
	}
	cameraView.style.display = "none";
	photoCanvas.style.display = "block";
	btnCapture.style.display = "none";
	btnRetry.style.display = "block";
	btnDownload.style.display = "block";
	isPhotoDisplayed = true;
}

function showCameraView() {
	isPhotoDisplayed = false;
	photoCanvas.style.display = "none";
	btnRetry.style.display = "none";
	btnDownload.style.display = "none";
	
	const constraints = {
		video: true,
		audio: false
	};
	
	// Attach the video stream to the video element and autoplay.
	navigator.mediaDevices.getUserMedia(constraints)
		.then((stream) => {
			cameraView.srcObject = stream;
			cameraX = stream.getVideoTracks()[0].getSettings().width;
			cameraY = stream.getVideoTracks()[0].getSettings().height;
			cameraView.style.display = "block";
			btnCapture.style.display = "block";
			checkOrientation();
		}).catch(function() {
			txtCameraNoPermission.style.display = "block";
			btnCapture.style.display = "none";
	});
}

function downloadPhoto(){
	photoCanvas.toBlob(function(blob) {
		saveAs(blob, "riot-" + new Date() + ".png");
	});
}
