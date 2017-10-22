const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const chalk = require('chalk');

const selectors = {
	startViewerLink: '#main_page_offline > div > div.config_line > div > div > a',
	startViewerDiv: 'div.titre_12'
};

const url = 'http://bit.ly/29briww';

main();

/**
 * TODO:
 * Okay, tor might not be the best solution here. Maybe use different heroku dynos?
 * 
 * Error handling:
 * detect IP banned, timeout and other network errors, and restart the slave with a new IP
 */

async function main() {
	console.log(chalk.green('Welcome to Websyndicate!'));
	const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	const page = await browser.newPage();
	await page.goto(url);
	await page.waitForSelector(selectors.startViewerDiv);
	await page.click(selectors.startViewerLink);

	// //Stats
	// setInterval(async () => {
	// 	let stats = extractStats(await page.content());
	// 	console.log(`Stats: ${stats.creditsInBank} ${stats.sitesVisitedToday}`);
	// }, 5000);

	page.on('load', async () => {
		console.log(chalk.white('Current page: ' + await page.url()));
	});
}

function extractStats(html) {
	let $ = cheerio.load(html);
	let creditsInBank = $('div#user_credits').text();

	let sitesVisitedToday = $('div#user_cj').text();

	return {
		creditsInBank,
		sitesVisitedToday
	};
}