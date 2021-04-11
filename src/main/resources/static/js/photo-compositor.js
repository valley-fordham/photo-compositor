const supported = 'mediaDevices' in navigator;

const cameraView = document.getElementById('camera');
const photoCanvas = document.getElementById('canvas');
const context = photoCanvas.getContext('2d');
const imgFuturama = document.getElementById('img-futurama');
const imgHeadless = document.getElementById('img-headless');
const photoTitle = document.getElementById('img-photo-title');
const btnCapture = document.getElementById('btn-capture');
const btnChangeOverlay = document.getElementById('btn-change-overlay');
const imgSpeechBubble = document.getElementById('img-speech-bubble');
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
let cameraX = 0;
let cameraY = 0;


// Initialise screen
if (supported) {
	showCameraView();
} else {
	txtCameraNotSupported.style.display = "block";
}
setOverlay(OVERLAY.futurama);


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
		btnUpload.style.display = "none";
		btnChangeOverlay.style.display = "none";
		imgSpeechBubble.style.display = "none";
		txtLandscapeNotSupported.style.display = "block";
	} else if (supported) {
		if (isPhotoDisplayed) {
			photoCanvas.style.display = "block";
			btnDownload.style.display = "block";
			btnRetry.style.display = "block";
			btnUpload.style.display = "block";
		} else {
			cameraView.style.display = "block";
			btnCapture.style.display = "block";
			btnChangeOverlay.style.display = "block";
			imgSpeechBubble.style.display = "block";
		}
		txtLandscapeNotSupported.style.display = "none";
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
		cameraView.srcObject.getVideoTracks().forEach(track => track.stop());
	}
	cameraView.style.display = "none";
	imgBackground.style.display = "none";
	photoCanvas.style.display = "block";
	btnCapture.style.display = "none";
	btnChangeOverlay.style.display = "none";
	imgSpeechBubble.style.display = "none";
	btnRetry.style.display = "block";
	btnDownload.style.display = "block";
	btnUpload.style.display = "block";
	isPhotoDisplayed = true;
}

function showCameraView() {
	isPhotoDisplayed = false;
	photoCanvas.style.display = "none";
	btnRetry.style.display = "none";
	btnDownload.style.display = "none";
	btnUpload.style.display = "none";
	imgBackground.style.display = "block";

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
			btnChangeOverlay.style.display = "block";
			imgSpeechBubble.style.display = "block";
			btnUpload.disabled = false;
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
			console.log('unsupported overlay');
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
	btnUpload.style.display = "none";
	const xhr = new XMLHttpRequest();
	photoCanvas.toBlob(function(imageBlob) {
		xhr.open('POST', "api/v1/saveimage", false);
		xhr.setRequestHeader("Content-Type", "image/png");
		xhr.send(imageBlob);
		if (xhr.status === 200) {
			alert("Successfully uploaded photo!");
		} else {
			alert("Upload failed :(");
			console.log("Error uploading image:" + xhr.responseText);
		}
	})
}
