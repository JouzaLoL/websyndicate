const puppeteer = require('puppeteer');
const chalk = require('chalk');
const cheerio = require('cheerio');
const eventToPromise = require('event-to-promise');

const selectors = {
	startViewerLink: '#main_page_offline > div > div.config_line > div > div > a',
	startViewerDiv: 'div.titre_12'
};

const viewerURL = 'http://bit.ly/29briww';

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
	const viewerPage = await browser.newPage();
	await viewerPage.goto(viewerURL);
	await viewerPage.waitForSelector(selectors.startViewerDiv);
	await viewerPage.click(selectors.startViewerLink);
	await eventToPromise(browser, 'targetcreated');

	const pages = await browser.pages();
	const statsPage = pages[2];

	statsPage.on('response', async () => {
		const stats = parseStatsPage(await statsPage.content());
		const log_text = `Current page: ${stats.currentPage} | Site stats: day ${stats.sitesDay} - week: ${stats.sitesWeek} - month: ${stats.sitesMonth}`;
		console.log(log_text);
	});
}

function parseStatsPage(html) {
	const $ = cheerio.load(html);

	const currentPage = $('#last_site_url > a').text();

	const sitesDay = $('#user_cj').text();
	const sitesWeek = $('#user_cs').text();
	const sitesMonth = $('#user_cm').text();

	return {
		currentPage,
		sitesDay,
		sitesWeek,
		sitesMonth
	};
}