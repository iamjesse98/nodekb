const express = require(`express`)
const path = require(`path`)
const bodyParser = require(`body-parser`)
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')

const mongoose = require(`mongoose`)
mongoose.connect('mongodb://iamjesse:123456@ds155631.mlab.com:55631/nodekb')
let db = mongoose.connection

// check connection
db.once(`open`, () => {
	console.log('connected to mongo')
})

// check for db errors
db.on('error', (err) => {
	console.log(err)
})

// init app
const app = express()

// Bring the models
let Article = require('./models/articles')

// load view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// set public folder
app.use(express.static(path.join(__dirname, 'public')))

// Express session middleware
app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}))

// Express messages middleware
app.use(require('connect-flash')())
app.use( (req, res, next) => {
	res.locals.messages = require('express-messages')(req, res)
	next()
})

// Express validator Middleware
app.use(expressValidator({
	errorFormatter: (param, msg, value) => {
		let namespace = param.split('.'),
		    root = namespace.shift(),
		    formParam = root

		    while(namespace.length) formParam += `[${namespace.shift()}]`

		    return {
		    	param: formParam,
		    	msg: msg,
		    	value: value
		    }
	}
}))

// home page
app.get('/', (req, res) => {
	Article.find({}, (err, articles) => {
		err && console.log(err)
		res.render('index', {
				title: 'articles',
				articles: articles
		})
	})
})

// route files
let articles = require('./routes/articles')
app.use('/articles', articles)

let users = require('./routes/users')
app.use('/users', users)

// start server
app.listen(1444, () => {
	console.log('Project is running at port 1444...')
})