const express = require('express');
const bodyParser = require('body-parser');
const DirectoryRepository = require('./repository/repository');

const app = express();
const port = 3000;

const directoryRepository = new DirectoryRepository();

app.use(bodyParser.json());

app.post('/directories', async (req, res) => {
  try {
    const directory = req.body;

    console.log(directory);

    const newDirectory = await directoryRepository.createDirectory(directory);
    res.status(201);
    res.json(newDirectory);
  } catch (error) {
    console.error('Error retrieving directories', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/directory', async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Id parameter is required' });
    }

    const directory = await directoryRepository.getDescendantsDirectoryById(id);
    res.status(200);
    res.json(directory);
  } catch (error) {
    console.error('Error retrieving directories', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/directories', async (req, res) => {
  try {
    const { id, permission } = req.body;

    const updatePermission = await directoryRepository.updatePermissionAllDescendants(id, permission);
    res.status(201);
    res.json(updatePermission);
  } catch (error) {
    console.error('Error retrieving directories', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

module.exports = app;
