var URL = require('url')
var authenticClient = require('authentic-client')

var auth = authenticClient({
  server: 'http://localhost:1337',
  authToken: window.localStorage.authToken
})

init()

function init () {
  addStyles()

  var main = document.createElement('div')
  document.body.appendChild(main)

  var links = document.createElement('div')
  links.style.marginTop = '20px'
  links.innerHTML = [
    '<a href="#/login">Log In</a>',
    '<a href="#/signup">Sign Up</a>',
    '<a href="#/logout">Log Out</a>'
  ].join(' | ')
  document.body.appendChild(links)

  window.addEventListener('hashchange', function () { runRoutes(main) })

  runRoutes(main)
}

function runRoutes (el) {
  var appState = location.hash.replace('#/', '')
  el.innerHTML = ''

  if (appState === 'signup') return signupRoute(el)
  if (appState === 'confirm') return confirmRoute(el)
  if (appState === 'login') return loginRoute(el)
  if (appState === 'logout') return logoutRoute(el)

  if (!auth.authToken) return loginRoute(el)

  return protectedRoute(el)
}

function protectedRoute (el) {
  el.innerHTML = [
    'You made it!',
    'authToken',
    '<textarea class="topcoat-textarea" rows="8" cols="128">'+auth.authToken+'</textarea>'
  ].join('<br/><br/>')
}

function signupRoute (el) {
  var form = createForm('Sign Up', ['email', 'password'], function (err, data) {
    if (err) return console.error(err)

    data.confirmUrl = window.location.origin + '/#/confirm'
    auth.signup(data, function (err, resp) {
      if (err) return el.innerHTML = 'Error: ' + err.message

      el.innerHTML = resp.message
    })
  })

  el.appendChild(form)
}

function confirmRoute (el) {
  var urlObj = URL.parse(window.location.href, true)
  var data = urlObj.query
  auth.confirm(data, function (err, resp) {
    if (err) return el.innerHTML = 'Error: ' + err.message

    el.innerHTML = resp.message + '. Redirecting in two seconds...'
    setTimeout(function () { window.location.hash = '/' }, 2000)
  })
}

function loginRoute (el) {
  var form = createForm('Log In', ['email', 'password'], function (err, data) {
    if (err) return console.error(err)

    auth.login(data, function (err, resp) {
      if (err) return el.innerHTML = 'Error: ' + err.message

      window.localStorage.authToken = auth.authToken
      window.location.hash = '/'
    })
  })

  el.appendChild(form)
}

function logoutRoute (el) {
  auth.authToken = ''
  window.localStorage.authToken = ''
  window.location.hash = '/'
}

function createForm (action, fields, onSubmit) {
  var formState = {}
  var form = document.createElement('div')

  fields.forEach(function (field) {
    var input = document.createElement('input')
    if (field === 'password') input.type = 'password'
    input.placeholder = field
    input.classList.add('topcoat-text-input--large')
    input.style.marginBottom = '10px'
    input.addEventListener('keyup', function (evt) {
      formState[field] = input.value
    })
    form.appendChild(input)
    form.appendChild(document.createElement('br'))
  })

  var submit = document.createElement('button')
  submit.classList.add('topcoat-button--large--cta')
  submit.innerHTML = action
  submit.addEventListener('click', function () { onSubmit(null, formState) })
  form.appendChild(submit)

  return form
}

function addStyles () {
  var url = '//cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/css/topcoat-desktop-light.min.css'
  document.head.innerHTML += "<link href='" + url + "' rel='stylesheet' type='text/css'>"
  document.head.innerHTML += '<style>a{color: #288edf; text-decoration: none}</style>'
  document.body.style.textAlign = 'center'
  document.body.style.padding = '10%'
  document.body.style.color = '#222'
}
