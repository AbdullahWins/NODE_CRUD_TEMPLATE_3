const fs = require("fs").promises; // Using the promises version of fs
const path = require("path");
const { UniqueNaam } = require("uniquenaam/uniquenaam");
const getServerBaseUrl = require("../urlHandlers/HandleBaseUrl");

const handleFileUpload = async ({ req, files, folderName }) => {
  try {
    // Define the destination directory
    const destinationDir = path.join(__dirname, "../../../uploads", folderName);
    const baseUrl = getServerBaseUrl(req);

    // Create the destination directory if it doesn't exist
    await fs.mkdir(destinationDir, { recursive: true });

    const uploadedUrls = [];
    for (const file of files) {
      const uniqueFilename = UniqueNaam(file?.originalname);
      const source = file.path;
      const destination = path.join(destinationDir, uniqueFilename);

      // Ensure the source file exists before moving
      try {
        await fs.access(source, fs.constants.F_OK);
        await fs.rename(source, destination);

        // Construct the file URL
        const fileUrl = `${baseUrl}/uploads/${folderName}/${uniqueFilename}`;
        uploadedUrls.push(fileUrl);
      } catch (error) {
        console.error(`Error moving file: ${error}`);
      }
    }
    return uploadedUrls;
  } catch (error) {
    throw error;
  }
};

module.exports = { handleFileUpload };
