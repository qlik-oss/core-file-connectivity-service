const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

class MockWithLocalPassport {
  constructor(returnData, username, password) {
    this.returnData = returnData;
    this.username = username;
    this.password = password;
    this.auth = false;
    this.name = 'MockWithLocalPassport';
    this.uuid = '1234';

    const that = this;

    passport.use(new LocalStrategy((userName, pwd, done) => {
      if (userName === that.username && pwd === that.password) {
        that.auth = true;
        return done(null, {});
      }

      return done(null, false);
    }));
  }

  getData() {
    return this.returnData;
  }

  getName() {
    return this.name;
  }

  uuid() {
    return this.uuid;
  }

  authenticated() {
    return this.auth;
  }

  authentication() { // eslint-disable-line
    return passport.authenticate('local');
  }
}

module.exports = MockWithLocalPassport;
