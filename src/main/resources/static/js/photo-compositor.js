'use strict';

// Initialise vars
const noDisplayOnErrorElements = document.getElementsByClassName('noDisplayOnError');
const cameraViewElements = document.getElementsByClassName('cameraView');
const photoViewElements = document.getElementsByClassName('photoView');

const cameraView = document.getElementById('camera');
const photoCanvas = document.getElementById('canvas');
let photoCanvasRaw;

const OVERLAY = Object.freeze({"futurama": 0, "headless": 1});

const cameraIsSupported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
let isPhotoDisplayed = false;
let currentOverlay = OVERLAY.futurama;
let selfieCam = true;
let cameraX = 0;
let cameraY = 0;

// Initialise screen
if (cameraIsSupported) {
	showCameraView();
} else {
	console.error('Camera not supported');
	showElements(document.getElementById('camera-not-supported'));
	setVisibilityForElements(noDisplayOnErrorElements, false);
}
setOverlay(OVERLAY.futurama);

// Event Listeners
window.addEventListener("orientationchange", checkScreenOrientation, false);
window.addEventListener('visibilitychange', checkScreenIsVisible, false);


// Functions
function checkScreenOrientation() {
	const txtLandscapeNotSupported = document.getElementById('landscape-not-supported');
	// Check for both left and right tilt
	if (Math.abs(window.orientation) === 90) {
		setVisibilityForElements(noDisplayOnErrorElements, false);
		showElements(txtLandscapeNotSupported);
	} else if (cameraIsSupported) {
		if (isPhotoDisplayed) {
			setVisibilityForElements(photoViewElements, true);
		} else {
			setVisibilityForElements(cameraViewElements, true);
		}
		hideElements(txtLandscapeNotSupported);
	}
}

function checkScreenIsVisible() {
	if (document.hidden) {
		stopCameraStream();
	} else {
		startCameraStream();
	}
}

function takePhoto() {
	photoCanvas.getContext('2d').drawImage(cameraView, 0, 0, photoCanvas.width, photoCanvas.height);
	// Make a copy of the raw photo for upload purposes
	photoCanvasRaw = cloneCanvas(photoCanvas);
	drawCompositeOverlay();
	hideCameraView();
}

function hideCameraView() {
	stopCameraStream();
	setVisibilityForElements(cameraViewElements, false);
	setVisibilityForElements(photoViewElements, true);
	isPhotoDisplayed = true;
}

function showCameraView() {
	isPhotoDisplayed = false;
	hideElements(document.getElementById('txt-upload-success'));
	setVisibilityForElements(photoViewElements, false);
	setVisibilityForElements(cameraViewElements, true);
	setOverlay(currentOverlay);
	startCameraStream();
}

function downloadPhoto(){
	photoCanvas.toBlob(function(blob) {
		saveAs(blob, "riot-" + new Date() + ".png");
	});
}

function startCameraStream() {
	const txtCameraNoPermission = document.getElementById('camera-no-permission');
	hideElements(txtCameraNoPermission);

	// JS doesn't like using ternary to assign facingMode
	let cameraType = "environment";
	if (selfieCam) {
		cameraType = "user";
	}
	const constraints = {
		video: {
			facingMode: cameraType,
			focusMode: "continuous"
		},
		audio: false
	};

	// Attach the video stream to the video element and autoplay.
	navigator.mediaDevices.getUserMedia(constraints)
		.then((stream) => {
			cameraView.srcObject = stream;
			cameraX = stream.getVideoTracks()[0].getSettings().width;
			cameraY = stream.getVideoTracks()[0].getSettings().height;
			checkScreenOrientation();
		}).catch(function(e) {
			console.error('An error occurred trying to use camera stream', e);
			showElements(txtCameraNoPermission);
			setVisibilityForElements(noDisplayOnErrorElements, false);
			stopCameraStream();
		});
}

function stopCameraStream() {
	cameraView.srcObject.getVideoTracks().forEach(track => track.stop());
}

function toggleSelfieCam() {
	const btnToggleCamera = document.getElementById('btn-toggle-camera');
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
	const imgBackground = document.getElementById('img-background');
	const headlessPlaceholder = document.getElementById('img-headless-placeholders');
	headlessPlaceholder.style.display = "none";
	switch (overlay) {
		case OVERLAY.futurama:
			imgBackground.src = "images/composite-futurama.png";
			break;
		case OVERLAY.headless:
			imgBackground.src = "images/composite-headless.png";
			headlessPlaceholder.style.position = "fixed";
			headlessPlaceholder.style.top = (cameraView.getBoundingClientRect().top + 20).toString();
			headlessPlaceholder.style.left = (cameraView.getBoundingClientRect().left + 20).toString();
			headlessPlaceholder.style.display = "block";
			break;
		default:
			console.error('unsupported overlay');
	}
}

function drawCompositeOverlay() {
	switch (currentOverlay) {
		case OVERLAY.futurama:
			const imgFuturama = document.getElementById('img-futurama');
			photoCanvas.getContext('2d').drawImage(imgFuturama, 0, 400, imgFuturama.width, imgFuturama.height);
			break;
		case OVERLAY.headless:
			const imgHeadless = document.getElementById('img-headless');
			photoCanvas.getContext('2d').drawImage(imgHeadless, 0, 240, imgHeadless.width, imgHeadless.height);
			document.getElementById('img-headless-placeholders').style.display = "none";
	}
	const photoTitle = document.getElementById('img-photo-title');
	photoCanvas.getContext('2d').drawImage(photoTitle, 0, 20, photoTitle.width, photoTitle.height);
}

function uploadCompositePhoto() {
	hideElements(document.getElementById('btn-upload'));
	pushToServer(photoCanvasRaw, false);
	pushToServer(photoCanvas, true);
}

function pushToServer(canvas, displayResponse) {
	const xhr = new XMLHttpRequest();
	canvas.toBlob(function(imageBlob) {
		xhr.open('POST', "api/v1/saveimage", false);
		xhr.setRequestHeader("Content-Type", "image/png");
		xhr.send(imageBlob);
		if (displayResponse) {
			if (xhr.status === 200) {
				showElements(document.getElementById('txt-upload-success'));
			} else {
				alert("Upload failed :(");
				console.error("Error uploading image:" + xhr.responseText);
				showElements(document.getElementById('btn-upload'));
			}
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

function setVisibilityForElements(elements, visible) {
	for (let i = 0; i < elements.length; i++) {
		elements[i].style.display = (visible ? "block" : "none");
	}
}

function cloneCanvas(oldCanvas) {
	const newCanvas = document.createElement('canvas');
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;
	newCanvas.getContext('2d').drawImage(oldCanvas, 0, 0);
	return newCanvas;
}
