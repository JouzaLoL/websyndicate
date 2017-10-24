const URL = 'https://api.heroku.com/apps/websyndicate/dynos';

const Heroku = require('heroku-client');
const heroku = new Heroku({ token: process.env.TOKEN });

restart();

function restart() {
	heroku
		.delete(URL)
		.then(app => { console.log('! Dynos restarted succesfully'); })
		.catch(err => console.log(err));
}

module.exports = restart;