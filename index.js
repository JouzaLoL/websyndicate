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
 * detect page crash and restart
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
		logStats(await statsPage.content());
	});

	statsPage.on('error', () => restart(browser));
	viewerPage.on('error', () => restart(browser));
}

async function restart(browser) {
	console.log('! Page crashed, restarting...');
	await browser.close();
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

var logStats = throttle(function (statsPageContent) {
	const stats = parseStatsPage(statsPageContent);
	const log_text = `Current page: ${stats.currentPage} | Site stats: day: ${stats.sitesDay} - week: ${stats.sitesWeek} - month: ${stats.sitesMonth}`;
	console.log(log_text);
});

function throttle(func, wait, options) {
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) options = {};
	var later = function () {
		previous = options.leading === false ? 0 : Date.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};
	return function () {
		var now = Date.now();
		if (!previous && options.leading === false) previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	};
};