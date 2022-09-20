package com.glenfordham.photocompositor;

import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.DefaultParser;
import org.apache.commons.cli.Options;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class PhotoCompositorApplication {

	private static String photoPath;

	private static final Logger logger = LogManager.getLogger();

	public static void main(String[] args) {

		Options options = new Options();
		options.addRequiredOption("photopath", "p", true, "Path where uploaded photos should be saved");
		CommandLine cmd = null;
		try {
			cmd = new DefaultParser().parse(options, args, false);
		} catch (Exception e) {
			logger.error("Error occurred when parsing arguments at startup", e);
		}
		if (cmd == null) {
			logger.error("Error occurred when parsing command line");
			System.exit(1);
		}
		photoPath = cmd.getOptionValue("photopath");

		File photoPathFile = new File(photoPath);
		logger.info("Using directory: {}", photoPathFile.getAbsolutePath());
		if (!photoPathFile.exists()) {
			logger.info("Directory does not exist. Creating directory..");
			if (!photoPathFile.mkdirs()) {
				logger.error("Unable to create directory.");
				System.exit(1);
			}
			logger.info("Created directory.");
		}
		if (!photoPathFile.canWrite()) {
			logger.error("Cannot write to directory.");
			System.exit(1);
		}

		System.setProperty("jdk.tls.client.protocols","TLSv1.2");
		SpringApplication.run(PhotoCompositorApplication.class, args);
	}

	public static String getPhotoPath() {
		return photoPath;
	}

}
