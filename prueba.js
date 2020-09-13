const express = require('express');
const app = express();
var http = require('http').createServer(app)

const morgan = require('morgan');
const cors = require('cors');
const router = express.Router();


app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))     //application/x-www-form-urlencoded
app.use('/api', router)

app.set('puerto', process.env.PORT || 3000);

http.listen(app.get('puerto'), function () {
    console.log('App listening on port: '+ app.get('puerto')+' In environment: +process.env.NODE_ENV');
});

router.post('/prueba', async(req, res) => {

    a = req.body.a
    b = req.body.b
    console.log(a)
    suma = a + b
    console.log(suma)
    res.send(suma.toString())

})

