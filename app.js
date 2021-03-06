const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('./config/passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const app = express();

// Load routes
const ideaRouter = require('./routes/ideaRouter');
const userRouter = require('./routes/userRouter');

// Connect to mongoose
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// console.log(mongoose.connection);

// Handlebars Middleware
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Index route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {title});
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// User routes
app.use('/ideas', ideaRouter);
app.use('/users', userRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});