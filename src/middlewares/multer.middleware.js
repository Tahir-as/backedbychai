import multer from "multer";

/* 1️⃣ Define a storage engine */
const storage = multer.diskStorage({
    // Where the uploaded file will be saved on disk
    destination: function (req, file, cb) {
        // `cb` = callback(error, destinationPath)
        cb(null, "./public/temp");   // store files in ./public/temp
    },

    // How the saved file will be named
    filename: function (req, file, cb) {
        // `file.originalname` is the name the client sent
        cb(null, file.originalname); // keep the original filename
    }
});

/* 2️⃣ Create the Multer middleware */
export const upload = multer({
    storage,               // use the custom storage defined above
    // you could also add limits, fileFilter, etc. here
});