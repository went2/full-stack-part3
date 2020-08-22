const mongoose = require('mongoose');

if (process.argv.length<3) {
  console.log('Please provide the password as an argument: node mongo.js <password>');
  process.exit(1);
}

const password = process.argv[2];
const personName = process.argv[3];
const personNumber = process.argv[4];
const personSex = process.argv[5];

const url = 
  `mongodb+srv://fullstack:${password}@cluster0.j0ypd.mongodb.net/phonebook-app?retryWrites=true&w=majority`;

// 连接数据库
mongoose
  .connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });

// 定义数据的 schema 和 model
const personSchema = new mongoose.Schema({
  name: String,
  number: Number,
  sex: String,
});

const Person = mongoose.model('Person', personSchema);

// 从 process.argv 变量中获取参数，生成新的 person 数据
const newPerson = new Person({
  name: personName,
  number: personNumber,
  sex: personSex,
});

// 添加到数据库
if (process.argv.length === 6) {
  newPerson
    .save()
    .then(result => {
      console.log(`added ${result.name} ${result.number} ${result.sex} to phonebook.`);
      mongoose.connection.close();
    })
}

if (process.argv.length === 3) {
  Person
    .find({})
    .then(result => {
      console.log(`phonebook contains:`);
      result.forEach(person => {console.log(`${person.name} ${person.number}`)});
      mongoose.connection.close();
    })
}