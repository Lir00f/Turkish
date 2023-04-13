const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();
const ejs = require("ejs");
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "wtpfhm123",
  database: "pos_db",
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Database connected");
  }
});

db.query(
  `CREATE TABLE IF NOT EXISTS apartments (
  id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  year int NOT NULL,
  price INT NOT NULL,
  bedrooms varchar(255) NOT NULL,
  bathrooms INT NOT NULL,
  size INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) NOT NULL, 
  PRIMARY KEY (id)
)`,
  (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Apartments table created");
    }
  }
);


db.query(`
  CREATE TABLE IF NOT EXISTS apartmentsforrent (
    id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    price INT NOT NULL,
    bedrooms VARCHAR(255) NOT NULL,
    bathrooms INT NOT NULL,
    size INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  )`,
  (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Apartments for rent table created");
    }
  }
);


// Обработка вебхука от amoCRM
app.post("/webhook", (req, res) => {
  const body = req.body;

  // Проверка, что вебхук содержит информацию о смене статуса с нужным ID
  if (
    body.leads &&
    body.leads.status &&
    body.leads.status.length > 0 &&
    body.leads.status[0].status_id === 56476654
  ) {
    // Получение ID квартиры из поля "name"
    const apartmentId = parseInt(
      body.leads.status[0].name.replace("Квартира", "")
    );

    // Удаление квартиры из базы данных
    connection.query(
      "DELETE FROM apartments WHERE id = ?",
      [apartmentId],
      (error, results, fields) => {
        if (error) throw error;
        console.log(
          `Apartment ${apartmentId} has been deleted from the database!`
        );
      }
    );
  }

  // Отправка ответа на запрос вебхука
  res.status(200).send("OK");
});

app.get("/second", (req, res) => {
  db.query("SELECT * FROM apartments", (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving apartments");
    } else {
      res.render("second", { apartments: results });
    }
  });
});

app.get("/second2", (req, res) => {
  db.query("SELECT * FROM apartmentsforrent", (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving apartments");
    } else {
      res.render("second2", { apartmentsforrent: results });
    }
  });
});

app.get('/second2', (req, res) => {
  res.render('second2'); // Здесь "second2" - это имя вашего шаблона EJS
});

app.get("/", function (req, res) {
  res.redirect("/second");
});

app.get("/second", function (req, res) {
  // ...код для обработки запросов на маршрут /second
});

app.get("/apartments", (req, res) => {
  const filter = [];
  if (req.query.bedrooms) {
    filter.push(`bedrooms = ${req.query.bedrooms}`);
  }
  if (req.query.bathrooms) {
    filter.push(`bathrooms = ${req.query.bathrooms}`);
  }
  if (req.query.price) {
    filter.push(`price <= ${req.query.price}`);
  }
  if (req.query.location) {
    filter.push(`location = '${req.query.location}'`);
  }

  let sql = "SELECT * FROM apartments";
  if (filter.length > 0) {
    sql += ` WHERE ${filter.join(" AND ")}`;
  }

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving apartments");
    } else {
      res.json(result);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
