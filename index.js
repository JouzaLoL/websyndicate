const puppeteer = require('puppeteer');
const chalk = require('chalk');

const selectors = {
	startViewerLink: '#main_page_offline > div > div.config_line > div > div > a',
	startViewerDiv: 'div.titre_12'
};

const url = 'http://bit.ly/29briww';

main();

/**
 * TODO:
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

	page.on('load', async () => {
		console.log(chalk.white('Current page: ' + await page.url()));
	});
}