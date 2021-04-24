package com.glenfordham.photocompositor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class PhotoController {

	Logger logger = LoggerFactory.getLogger(PhotoController.class);

	@PostMapping(value = "/saveimage")
	public ResponseEntity<String> saveImage(@RequestBody byte[] image) {
		try {
			Files.write(Paths.get(PhotoCompositorApplication.getPhotoPath() + "//" + UUID.randomUUID() + "-" + LocalDateTime.now().toString().replace(":", "-")  + ".png"), image);
			logger.info("Successful upload");
		} catch (IOException e) {
			logger.error("Error with upload attempt", e);
			return ResponseEntity.badRequest().body("Error occurred saving image to disk");
		}
		return ResponseEntity.ok().build();
	}
}
