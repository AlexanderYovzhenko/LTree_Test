const express = require('express');
const FolderRepository = require('./repository/folderRepository');

const app = express();
const port = 3000;

const folderRepository = new FolderRepository();

app.post('/folders', async (req, res) => {
  try {
    const newFolder = await folderRepository.createFolder('New Folder');
    res.status(201);
    res.json(newFolder);
  } catch (error) {
    console.error('Error retrieving folders', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/folder', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    const folder = await folderRepository.getFolderByName(name);
    res.status(200);
    res.json(folder);
  } catch (error) {
    console.error('Error retrieving folders', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/folders', async (req, res) => {
  try {
    const folders = await folderRepository.getAllFolders();
    res.status(200);
    res.json(folders);
  } catch (error) {
    console.error('Error retrieving folders', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

module.exports = app;
