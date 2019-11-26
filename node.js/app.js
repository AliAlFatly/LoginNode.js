const express = require('express');
const Joi = require('joi');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')

app.use(session({
    secret: "a",
    proxy: true,
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());
app.listen(process.env.PORT || 3000)
const companyName = "company"
const viewsPath = __dirname + '/views';
const imageFolder = viewsPath + '/public';
app.use("/assets", express.static(imageFolder));
var urlencodedParser = bodyParser.urlencoded({ extended: false })
let date_ob = new Date();

class UsersTable {
    constructor(amount) {
        this.users = [];
        this.lastId = 9999999;
        if (amount == undefined || amount !== number || amount == null) {
            amount = 10;
        }

        for (let i = 0; i < amount; i++) {
            this.lastId += 1;
            this.users.push({
                id: this.lastId,
                username: `user${i}`,
                password: `password${i}`,
                firstLetters: `A`,
                lastName: `lastname ${i}`,
                street: `street${i}`,
                huisNumber: i,
                place: `groningen`,
                postalCode: `9718AT`,
                BSN: 1111111110,
                mobileNumber: 1234567890,
                birthdate: "1/1/2000",
                email: `user${i}@company.nl`,
                sess: undefined
            })
        }
    }

    addUsers(user) {
        this.id += 1;
        user.setId(this.id);
        this.users.push(user);
    }


    updateUser(id, changedUser) {
        var user = this.users.find(e => e.id === id);
        //let index = this.users.map(x => x.id).indexOf(id);
        //console.log(index)

        if (!user) return `The user with the id ${id} was not found.`;

        user.firstLetters = changedUser.firstLetters;
        user.lastName = changedUser.lastName;
        user.street = changedUser.street;
        user.huisNumber = changedUser.huisNumber;
        user.place = changedUser.place;
        user.postalCode = changedUser.postalCode;
        user.BSN = changedUser.BSN;
        user.mobileNumber = changedUser.mobileNumber;
        user.birthdate = changedUser.birthdate
        user.email = changedUser.email;

        //console.log(this.users[index])
        return user;
    }

    getUser(id) {
        //console.log(this.users.find(e => e.id === id));
        return this.users.find(e => e.id === id);
    }

    getUsers() {
        return this.users;
    }

    login(username, password) {
        let response = {
            username: undefined,
            id: undefined,
            message: "username was not found"
        }
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].username === username) {
                if (this.users[i].password === password) {
                    response.username = this.users[i].username;
                    response.id = this.users[i].id;
                    response.message = "successfuly logged in";
                    return response;
                }
                response.message = "username and password do not match";
            }
        }

        return response;
    }

    static validateUser(user) {
        const schema = {
            id: Joi.number().integer().required(),
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string(),
            firstLetters: Joi.string().min(1).max(30).required(),
            lastName: Joi.string().min(3).max(30).required(),
            street: Joi.string(),
            huisNumber: Joi.number().integer(),
            place: Joi.string(),
            postalCode: Joi.string(),
            BSN: Joi.number().integer().min(10).max(10),
            mobileNumber: Joi.number().integer().min(7).max(10),
            birthyear: Joi.number().integer().min(1900).max(2017),
            birthmonth: Joi.number().integer().min(1).max(12),
            birthday: Joi.number().integer().min(1).max(31),
            email: Joi.string().email({ minDomainAtoms: 2 })
        }

        return Joi.validate(user, schema);
    }
}

var db = new UsersTable();

app.get("/", (req, res) => {
    res.sendFile(viewsPath + '/index.html', (err) => { if (err) console.log(err) })
})

app.get("/session", (req, res) => {
    res.json(req.session);
})

app.get("/CompanyName", (req, res) => {
    res.send(companyName);
})

app.get("/login", (req, res) => {
    res.sendFile(viewsPath + '/login.html', (err) => { if (err) console.log(err) })
})

app.get("/users/information", (req, res) => {
    res.sendFile(viewsPath + "/userdetails.html", (err) => { if (err) console.log(err) })
})

app.post("/loginCommit", urlencodedParser, (req, res) => {
    let re = db.login(req.body.username, req.body.password)
    req.session.username = re.username
    req.session.userId = re.id;
    req.session.returnMessage = re.message;
    req.session.currentUser = db.getUser(re.id)
    res.json(req.session);
})

app.get("/logout", (req, res) => {
    // req.session.destroy()
    // console.log(req.session.id)
    // let day = date_ob.getDate();
    // let year = date_ob.getFullYear;
    // let month = date_ob.getMonth;
    // let hour = date_ob.getHours;
    // let minute = date_ob.getMinutes;
    // req.session.lastLogin = `${day}/${month}/${year}, ${hour}:${minute}`;
    // res.json("success")
    res.clearCookie('connect.sid', { path: '/' }).status(200).send('Ok.');
})

app.put("/users/update/", (req, res) => {
    let id = req.body.id;
    const user = db.getUser(parseInt(id));
    if (!user) return res.status(404).send(`user with the given ID was not found, ID: ${parseInt(id)}`);
    let respond = db.updateUser(req.body.id, req.body);
    res.status(200).send('Ok.');
})

app.get("/api/users", (req, res) => {
    res.json(db.getUsers());
})

app.get("/api/users/:id", (req, res) => {
    res.json(db.getUser(req.body.id));
})