const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

class MockWithLocalPassport {
    constructor(returnData, username, password) {
        this.returnData = returnData;
        this.username = username;
        this.password = password;
        this.auth = false;

        let that = this;

        passport.use(new LocalStrategy((username, password, done) => {
            if( username === that.username && password === that.password){
                that.auth = true;
                return done(null, {});
            }
            else{
                return done(null, false);
            }
        }));
    }

    getData() {
        return this.returnData;
    }

    authenticated() {
        return this.auth;
    }

    authentication() {
        return passport.authenticate('local');
    }
}

module.exports = MockWithLocalPassport;