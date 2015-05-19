var AccountController = (function() {
	var models = require('../models/Account.js');

	var Account = models.AccountModule;
	
	return {
		loginPage: function(req, res) {
    		res.render('login');
		},
		
		signupPage: function(req, res) {
    		res.render('signup');
		},
		
		logout: function(req, res) {
    		req.session.destroy();
    		res.redirect('/');
		},

		login: function(req, res) {

    		var username = req.body.username;
    		var password = req.body.pass;

    		if(!username || !password) {
        		return res.status(400).json({error: "All fields are required"});
    		}

    		Account.AccountModel.authenticate(username, password, function(err, account) {
        		if(err || !account) {
            		return res.status(401).json({error: "Wrong username or password"});
        		}
        
        		req.session.account = account.toAPI();
        
        		res.redirect('/pileon');
    		});

		},

		signup: function(req, res) {

    		if(!req.body.username || !req.body.pass || !req.body.pass2) {
        		return res.status(400).json({error: "All fields are required"});
    		}

    		if(req.body.pass !== req.body.pass2) {
        		return res.status(400).json({error: "Passwords do not match"});
    		}
	
			Account.AccountModel.generateHash(req.body.pass, function(salt, hash) {

				var accountData = {
					username: req.body.username,
					salt: salt,
					password: hash
				};
		
				var newAccount = new Account.AccountModel(accountData);
		
				newAccount.save(function(err) {
					if(err) {
						console.log(err);
						return res.status(400).json({error:'An error occurred'}); 
					}

            		req.session.account = newAccount.toAPI();
            
					res.redirect('/pileon');
				});
			});
		}
	};
})();

module.exports = AccountController;