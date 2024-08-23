const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Usage: node mongo.js <password> [<name> <number>]");
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://fullstack:${password}@cluster0.v89z3.mongodb.net/persons?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number,
});

const Person = mongoose.model("Person", personSchema);

const randomId = () => Math.floor(Math.random() * 100);

if (process.argv.length === 3) {
  Person.find({})
    .then((result) => {
      console.log("Phonebook:");
      result.forEach((person) => {
        console.log(`${person.name} ${person.number}`);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    })
    .finally(() => {
      mongoose.connection.close();
    });
} else if (process.argv.length === 5) {
  const person = new Person({
    name: name,
    number: number,
    id: randomId(),
  });

  person
    .save()
    .then(() => {
      console.log(`Added ${person.name} number ${person.number} to phonebook`);
    })
    .catch((error) => {
      console.error("Error saving data:", error);
    })
    .finally(() => {
      mongoose.connection.close();
    });
} else {
  console.log("Usage: node mongo.js <password> [<name> <number>]");
  mongoose.connection.close();
}
