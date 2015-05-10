Promise = require "native-or-bluebird"

passport = require "passport"


module.exports = (config) ->
  return new Promise (resolve, reject) ->
    if config.serializeUser?
      passport.serializeUser = config.serializeUser
    if config.deserializeUser
      passport.deserializeUser = config.deserializeUser

    return resolve {
      deps:
        "passport-session": ["session", "passport"]
        "/auth/logout": ["passport-session"]
      modules:
        "passport": passport.initialize()
        "passport-session": passport.session()
        "passport-logout": (req, res, next) ->
          req.logout()
          return req.redirect(config.logoutPath)
        "passport-login-success": (req, res, next) ->
          return res.redirect(config.loginSuccess)
      routes:
        "get":
          "/auth/logout": ["passport-logout"]
    }


module.exports.createStrategy = (name, strategy, config, callback) ->
  return new Promise (resolve, reject) ->
    passport.use new strategy config, callback

    authName = "passport-authenticate-#{name}"
    getName = "/auth/#{name}"
    callbackName = "/auth/#{name}/callback"


    results =
      deps: {}
      modules: {}
      routes:
        get: {}
    
    results.deps[authName] = ["passport-session"]
    results.modules[authName] = passport.authenticate(name)
    results.routes.get[getName] = [authName]
    results.routes.get[callbackName] = [authName, "passport-login-success"]
    return resolve(results)
