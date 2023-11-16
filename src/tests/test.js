const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;

const mockDirectory = {
  title: "Title Directory",
  permission: 1,
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('Directory API', () => {
  // Тест для создания каталогов
  it('should create a new directories', async () => {
    for (let i = 0; i < 200; i++) {

      if (i <= 5) {
        const res = await chai.request(app).post('/directories').send({
          ...mockDirectory,
        });
        expect(res).to.have.status(201);
      } else if (i <= 10) {
        const res = await chai.request(app).post('/directories').send({
          ...mockDirectory,
          parent_id: i, 
        });
        expect(res).to.have.status(201);
      } else if (i <= 20) {
        const res = await chai.request(app).post('/directories').send({
          ...mockDirectory,
          parent_id: getRandomNumber(1, 10), 
        });
        expect(res).to.have.status(201);
      } else if (i <= 50) {
        const res = await chai.request(app).post('/directories').send({
          ...mockDirectory,
          parent_id: getRandomNumber(1, 20), 
        });
        expect(res).to.have.status(201);
      } else {
        const res = await chai.request(app).post('/directories').send({
          ...mockDirectory,
          parent_id: getRandomNumber(1, 50), 
        });
        expect(res).to.have.status(201);
      }
    }
  });

  // Тест для обновления вложеностей каталога
  it('should update all descendants', async () => {
    const res = await chai.request(app).put('/directories').send({
      id: 21, 
      permission: 5,
    });

    console.log(res.body);
    expect(res).to.have.status(201);
  });

  // Тест для получения всех потомков по id каталога
  it('should get directory by id', async () => {
    const res = await chai.request(app).get('/directory').query({ id: 21 });
    console.log(res.body);
    expect(res).to.have.status(200);
  });
});

setTimeout(() => {
  process.exit(1);
}, 3000);
