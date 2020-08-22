require('dotenv').config();
const express = require('express');
const mogan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('build'));


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


app.get('/', (req, res) => {
  res.send('<h1>后端的主页</h1>');
})

app.get('/info', (req, res) => {
  date = new Date();
  Person.find({})
    .then(result => {
      //console.log(result.length);
      res.send(`Phonebook had infor ${result.length} people </br> request received at: </br> ${date}`)
    });
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => { res.json(result) })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error))
})

// handle DELETE 
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      console.log('delete person');
      res.status(204).end();
    })
    .catch(error => { next(error) });
})

// handle POST
app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    sex: body.sex
  });
  
  person
    .save()
    .then(savedPerson => {
      console.log('person saved:', body.name);
      res.json(savedPerson);
    })
    .catch(error => { next(error) })
})

// handle PUT
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
    sex: body.sex
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(error => { next(error) });
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint);

// 错误处理函数
const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if(error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error);
}
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servier running on port ${PORT}`);
})