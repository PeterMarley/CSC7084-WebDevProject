/**
 * Express middlewear that will redirect to another route. If a POST request then redirection location is read from `req.body.redirect`,
 * if a GET request, then from `req.query.redirect`. If neither is provided request is routed to root '/'.
 */
function redirect(req, res, next) {
  // console.log(req.method);
  let redirectionLocation = '';

  switch (req.method) {
    case 'POST':
      redirectionLocation = req.body && req.body.redirect ? req.body.redirect : '/';
      break;
    case 'GET':
      redirectionLocation = req.query && req.query.redirect ? req.query.redirect : '/';
      break;
    default:
      redirectionLocation = '/'
  }
  res.redirect(redirectionLocation);
}

module.exports = redirect;