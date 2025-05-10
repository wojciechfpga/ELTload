require('dotenv').config();

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const port = 10000;

// Konfiguracja Multer – zapis lokalny
const upload = multer({ dest: 'uploads/' });

// Twoje ID folderu w Google Drive
const FOLDER_ID = "1MCmgo1f-XaAwYGimzvpUPNs7NMJvyfis";

// Autoryzacja Google Drive
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

// Upload pliku i zapis do folderu
app.post('/', upload.single('file'), async (req, res) => {
  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: [FOLDER_ID],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Usuń plik lokalny po wysłaniu do Drive
    fs.unlinkSync(req.file.path);

    res.json({ fileId: file.data.id });
  } catch (error) {
    console.error('Błąd przy uploadzie:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint GET zwracający HTML
app.get('/', (req, res) => {
  res.send('<h1>Lasowski Wojciech - WSEI - 2025</h1>');
});

app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});