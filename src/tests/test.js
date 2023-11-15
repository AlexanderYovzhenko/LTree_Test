const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Folder API', () => {
  // Тест для создания новой папки
  it('should create a new folder', async () => {
    const res = await chai.request(app).post('/folders').send({ name: 'New Folder' });
    expect(res).to.have.status(201);
    expect(res.body).to.have.property('name').that.equals('New Folder');
  });

  // Тест для получения всех папок
  it('should get all folders', async () => {
    const res = await chai.request(app).get('/folders');
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
  });

  // Тест для получения папки по имени
  it('should get folder by name', async () => {
    const folderName = 'New Folder'; // Предполагаем, что эта папка существует
    const res = await chai.request(app).get('/folder').query({ name: folderName });
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('name').that.equals(folderName);
  });
});

setTimeout(() => {
  process.exit(1);
}, 1000);
