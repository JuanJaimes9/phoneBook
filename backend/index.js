require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (
    error.name === "ValidationError" ||
    error.number === "ValidationError"
  ) {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const mongoose = require("mongoose");
const Person = require("./models/person");

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("dist"));

morgan.token("body", (req) => JSON.stringify(req.body));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({})
    .then((persons) => response.json(persons))
    .catch((error) =>
      response.status(500).json({ error: "Database query failed" })
    );
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const generateId = () => Math.floor(Math.random() * 100);

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({ error: "Name or number missing" });
  }

  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        return response.status(406).json({ error: "Name must be unique" });
      }

      const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
      });

      return person.save();
    })
    .then((savedPerson) => response.json(savedPerson))
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then(() => response.status(204).end())
    .catch((error) =>
      response.status(500).json({ error: "Failed to delete person" })
    );
});

app.get("/info", (req, resp) => {
  Person.countDocuments({})
    .then((count) => {
      const date = new Date();
      resp.send(`<h2>Phonebook has info for ${count} people</h2>
      <br/>
      <p>${date}</p>`);
    })
    .catch(() => resp.status(500).json({ error: "Failed to count documents" }));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
