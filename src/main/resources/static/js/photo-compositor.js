'use strict';

const supported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

const cameraView = document.getElementById('camera');
const photoCanvas = document.getElementById('canvas');
const context = photoCanvas.getContext('2d');
const imgFuturama = document.getElementById('img-futurama');
const imgHeadless = document.getElementById('img-headless');
const photoTitle = document.getElementById('img-photo-title');
const btnCapture = document.getElementById('btn-capture');
const btnChangeOverlay = document.getElementById('btn-change-overlay');
const imgSpeechBubble = document.getElementById('img-speech-bubble');
const btnToggleCamera = document.getElementById('btn-toggle-camera');
const btnRetry = document.getElementById('btn-retry');
const btnDownload = document.getElementById('btn-download');
const btnUpload = document.getElementById('btn-upload');
const txtCameraNotSupported = document.getElementById('camera-not-supported');
const txtCameraNoPermission = document.getElementById('camera-no-permission');
const txtLandscapeNotSupported = document.getElementById('landscape-not-supported');
const imgBackground = document.getElementById('img-background');

const OVERLAY = Object.freeze({"futurama": 0, "headless": 1});

let isPhotoDisplayed = false;
let currentOverlay = OVERLAY.futurama;
let selfieCam = true;
let cameraX = 0;
let cameraY = 0;


// Initialise screen
if (supported) {
	showCameraView();
} else {
	console.error('Camera not supported');
	showElements(txtCameraNotSupported);
}
setOverlay(OVERLAY.futurama);


window.addEventListener("orientationchange", function() {
	checkOrientation();
}, false);

function checkOrientation() {
	// Check for both left and right tilt
	if (Math.abs(window.orientation) === 90) {
		hideElements(cameraView, btnCapture, photoCanvas, btnCapture, btnDownload, btnRetry, btnUpload,
			btnChangeOverlay, btnToggleCamera, imgSpeechBubble);
		showElements(txtLandscapeNotSupported);
	} else if (supported) {
		if (isPhotoDisplayed) {
			showElements(photoCanvas, btnDownload, btnRetry, btnUpload);
		} else {
			showElements(cameraView, btnCapture, btnChangeOverlay, btnToggleCamera, imgSpeechBubble);
		}
		hideElements(txtLandscapeNotSupported);
	}
}

function takePhoto()  {
	context.drawImage(cameraView, 0, 0, photoCanvas.width, photoCanvas.height);
	drawCompositeOverlay();
	context.drawImage(photoTitle, 0, 20, photoTitle.width, photoTitle.height);
	hideCameraView();
}

function hideCameraView() {
	// this is broken in current version of Chrome, may be able to bring it back later
	if (!(/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor))) {
		stopCameraStream();
	}
	hideElements(cameraView, imgBackground, btnCapture, btnToggleCamera, btnChangeOverlay, imgSpeechBubble)
	showElements(photoCanvas, btnRetry, btnDownload, btnUpload);
	isPhotoDisplayed = true;
}

function showCameraView() {
	isPhotoDisplayed = false;
	hideElements(photoCanvas, btnRetry, btnDownload, btnUpload);
	showElements(imgBackground);
	startCameraStream();
	showElements(cameraView, btnCapture, btnChangeOverlay, imgSpeechBubble);
}

function downloadPhoto(){
	photoCanvas.toBlob(function(blob) {
		saveAs(blob, "riot-" + new Date() + ".png");
	});
}

function startCameraStream() {
	hideElements(txtCameraNoPermission);

	let constraints;
	if (selfieCam) {
		constraints = {
			video: {
				facingMode: "user",
			},
			audio: false
		};
	} else {
		constraints = {
			video: {
				facingMode: "environment",
			},
			audio: false
		};
	}

	// Attach the video stream to the video element and autoplay.
	navigator.mediaDevices.getUserMedia(constraints)
		.then((stream) => {
			cameraView.srcObject = stream;
			cameraX = stream.getVideoTracks()[0].getSettings().width;
			cameraY = stream.getVideoTracks()[0].getSettings().height;
			checkOrientation();
		}).catch(function(e) {
			console.error('An error occurred trying to use camera stream', e);
			showElements(txtCameraNoPermission);
			hideElements(btnCapture);
		});
}

function stopCameraStream() {
	cameraView.srcObject.getVideoTracks().forEach(track => track.stop());
}

function toggleSelfieCam() {
	selfieCam = !selfieCam;
	if (selfieCam) {
		btnToggleCamera.classList.remove("toggle-camera-button-faceleft");
		btnToggleCamera.classList.add("toggle-camera-button-faceright");
	} else {
		btnToggleCamera.classList.add("toggle-camera-button-faceleft");
		btnToggleCamera.classList.remove("toggle-camera-button-faceright");
	}
	stopCameraStream();
	startCameraStream();
}

function changeOverlay() {
	currentOverlay++;
	// Wrap Overlay when cycling between options
	if (currentOverlay > OVERLAY.headless) {
		currentOverlay = OVERLAY.futurama;
	}
	setOverlay(currentOverlay);
}

function setOverlay(overlay) {
	switch (overlay) {
		case OVERLAY.futurama:
			imgBackground.src="images/composite-futurama.png";
			break;
		case OVERLAY.headless:
			imgBackground.src="images/composite-headless.png";
			break;
		default:
			console.error('unsupported overlay');
	}
}

function drawCompositeOverlay() {
	switch (currentOverlay) {
		case OVERLAY.futurama:
			context.drawImage(imgFuturama, 0, 400, imgFuturama.width, imgFuturama.height);
			break;
		case OVERLAY.headless:
			context.drawImage(imgHeadless, 0, 240, imgHeadless.width, imgHeadless.height);
	}
}

function uploadCompositePhoto() {
	hideElements(btnUpload);
	const xhr = new XMLHttpRequest();
	photoCanvas.toBlob(function(imageBlob) {
		xhr.open('POST', "api/v1/saveimage", false);
		xhr.setRequestHeader("Content-Type", "image/png");
		xhr.send(imageBlob);
		if (xhr.status === 200) {
			alert("Successfully uploaded photo!");
		} else {
			alert("Upload failed :(");
			console.error("Error uploading image:" + xhr.responseText);
			showElements(btnUpload);
		}
	})
}

function hideElements(/**/) {
	for (let i = 0; i < arguments.length; i++) {
		arguments[i].style.display = "none";
	}
}

function showElements(/**/) {
	for (let i = 0; i < arguments.length; i++) {
		arguments[i].style.display = "block";
	}
}
