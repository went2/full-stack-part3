
const express = require('express');
const mogan = require('morgan');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// middleware
const requestLogger = (req, res, next) => {
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Body:', req.body);
  console.log('---');
  next();
};

mogan.token('postinfo', (req, res) => JSON.stringify(req.body)
)
app.use(mogan(':method :url :status :res[content-length] - :response-time ms :postinfo'))

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1,
      "sex": "female"
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2,
      "sex": "female"
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3,
      "sex": "male"
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4,
      "sex": "female"
    }
  ];

app.get('/', (req, res) => {
  res.send('<h1>后端的主页</h1>');
})

app.get('/info', (req, res) => {
  const date = new Date();
  console.log(date);
  res.send(`
    Phonebook has info for ${persons.length} people </br>
    ${date}
  `);

});

app.get('/api/persons', (req, res) => {
  res.json(persons);
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(item => item.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end(); // 用status方法设置状态，用end方法相应res而不发送任何数据
  }
})

// handle delete 
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(item => item.id !== id);
  
  res.status(204).end();
})

// handle post
// 先map，后展开
const generateId = () => {
  return Math.floor(Math.random()*100000000000);
}

app.post('/api/persons', (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number missing'
    })
  } else if (persons.find(item => item.name === body.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint);

  const person = {
    name: body.name,
    number: body.number,
    sex: body.sex,
    id: generateId()
  }

  persons = persons.concat(person);

  res.json(person);
})


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servier running on port ${PORT}`);
})