const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: '/data', // Use persistent volume mount path
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    },
});

// Middleware
app.use('/data', express.static('/data'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/upload', (req, res) => {
    res.render('upload');
});

app.post('/upload', upload.array('photos', 10000), (req, res) => {
    if (!req.files) {
        return res.status(400).send('No files uploaded.');
    }
    res.redirect('/view');
});

app.get('/view', (req, res) => {
    const uploadsDir = '/data';
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan uploads directory.');
        }
        res.render('view', { images: files });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
