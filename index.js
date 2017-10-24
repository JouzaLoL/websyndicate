const puppeteer = require('puppeteer');
const chalk = require('chalk');
const cheerio = require('cheerio');
const eventToPromise = require('event-to-promise');

const selectors = {
	startViewerLink: '#main_page_offline > div > div.config_line > div > div > a',
	startViewerDiv: 'div.titre_12'
};
const viewerURL = 'http://bit.ly/29briww';

var browser;
var lastPage;


main();

async function main() {
	console.log(chalk.green('Welcome to Websyndicate!'));
	browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
		ignoreHTTPSErrors: true
	});
	const viewerPage = await browser.newPage();

	try {
		await viewerPage.goto(viewerURL);
		await viewerPage.waitForSelector(selectors.startViewerDiv);
		await viewerPage.click(selectors.startViewerLink);
		// wait for stats page to load
		await eventToPromise(browser, 'targetcreated');
	} catch (error) {
		restart(browser);
	}

	const pages = await browser.pages();
	const statsPage = pages[2];

	statsPage.on('response', async () => {
		const stats = parseStatsPage(await statsPage.content());
		// only log once for one page
		if (stats.currentPage === lastPage) {
			return;
		}
		lastPage = stats.currentPage;
		const log_text = `Current page: ${stats.currentPage} | Site stats: day: ${stats.sitesDay} - week: ${stats.sitesWeek} - month: ${stats.sitesMonth}`;
		console.log(log_text);
	});

	statsPage.on('error', () => restart(browser));
	viewerPage.on('error', () => restart(browser));
}

async function restart() {
	console.log('! Page crashed, restarting...');
	await browser.pages[1].close();
	await browser.pages[2].close();
	main();
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

var logStats = function (statsPageContent) {
	const stats = parseStatsPage(statsPageContent);
	const log_text = `Current page: ${stats.currentPage} | Site stats: day: ${stats.sitesDay} - week: ${stats.sitesWeek} - month: ${stats.sitesMonth}`;
	console.log(log_text);
};