var express = require('express');
var exphbs = require('express-handlebars');
var port = process.env.PORT || 3000
var app_url = process.env.NODE_ENV === 'production' ?
    'https://gcameto-mp-commerce-nodejs.herokuapp.com/' : 'http://localhost:3000/'
var bodyParser = require('body-parser')

// SDK de Mercado Pago
const mercadopago = require('mercadopago');
mercadopago.configure({
    access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004'
});

const preference = {
    "items": [],
    "payer": {
        "name": "Lalo",
        "surname": "Landa",
        "email": "test_user_63274575@testuser.com",
        "phone": {
            "area_code": "11",
            "number": 22223333
        },
        "identification": {
            "type": "DNI",
            "number": "471923173"
        },
        "address": {
            "street_name": "Falsa",
            "street_number": 123,
            "zip_code": "1111"
        }
    },
    "back_urls": {
        "success": app_url + "pago_exitoso",
        "failure": app_url + "pago_rechazado",
        "pending": app_url + "pago_pendiente"
    },
    "auto_return": "approved",
    "payment_methods": {
        "excluded_payment_methods": [
            {
                "id": "amex"
            }
        ],
        "excluded_payment_types": [
            {
                "id": "atm"
            }
        ],
        "installments": 6
    },
    "notification_url": app_url + "ipn",
    "statement_descriptor": "MINEGOCIO",
    "external_reference": "gonzalocameto@gmail.com"
};

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home', { view: 'home' });
});

app.get('/detail', function (req, res) {

    res.render('detail', { ...req.query, view: 'item' })
});

app.get('/pagar', function (req, res) {
    let { img, title, price, unit } = req.query;
    img = img.replace('./', '');

    console.log(req.query)
    const item = {
        id: "1234",
        title: title,
        picture_url: app_url + img,
        description: "Dispositivo móvil de Tienda e-commerce",
        category_id: "art",
        quantity: parseInt(unit),
        unit_price: parseFloat(price)
    }

    preference.items = [item];

    mercadopago.preferences.create(preference)
        .then(function (preference) {
            res.redirect(preference.body.init_point)
        }).catch(function (error) {
            console.log(error);
        });
})


app.get('/pago_exitoso', function (req, res) {
    res.render('pago_exitoso', req.query);
});

app.get('/pago_rechazado', function (req, res) {
    res.render('pago_rechazado', req.query);
});
app.get('/pago_pendiente', function (req, res) {
    res.render('pago_pendiente', req.query);
});

let ipn = [];
app.get('/ipn', function (req, res) {
    res.send(ipn);
});
app.post('/ipn', function (req, res) {
    ipn.push(req.body)
    res.send(ipn);
});

app.listen(port);