const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const selectors = {
	startViewerLink: '#main_page_offline > div > div.config_line > div > div > a',
	startViewerDiv: 'div.titre_12'
};

const url = 'http://bit.ly/29briww';


main();

async function main() {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	await page.goto(url);
	await page.waitForSelector(selectors.startViewerDiv);
	await page.click(selectors.startViewerLink);
	setInterval(async () => {
		let stats = extractStats(await page.content());
		console.log(`Stats: ${stats.creditsInBank} ${stats.sitesVisitedToday}`);
	}, 5000);
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