import { Scratcher } from '../..';

export const scratcher: Scratcher = {
    priority: 1,
    async scratch(isbn, page) {
        await page.goto(`https://www.justbooks.co.uk/search/?isbn=${isbn}&mode=isbn&st=sr&ac=qr`);
        await page.waitForSelector('span[itemprop="name"]');
        await page.waitForSelector('span[itemprop="author"]');
        await page.waitForSelector('span[itemprop="publisher"]');
        await page.waitForSelector('img#coverImage');

        const titleElement = await page.$('span[itemprop="name"]');
        const title = await page.evaluate(el =>  el?.textContent, titleElement);

        const authorsElement = await page.$('span[itemprop="author"]');
        const authorsRaw = await page.evaluate(el =>  el?.textContent, authorsElement);
        const authors = authorsRaw.split(';').map(a => a.split(', ').reverse().join(' '));

        const publisherElement = await page.$('span[itemprop="publisher"]');
        const publisherRaw = await page.evaluate(el =>  el?.textContent, publisherElement);
        const [publisher, publicationYear] = publisherRaw.split(', ');

        const pictureElement = await page.$('img#coverImage');
        const picture = await page.evaluate(el =>  el?.src, pictureElement);

        return {title, authors, publisher, publicationYear, picture};
    }
};