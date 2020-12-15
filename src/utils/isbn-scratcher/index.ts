import * as puppeteer from 'puppeteer';
import { ApiGetIsbn } from '@/types/api/isbn';
import getScratchers from './scratchers';

/**
 * A scratcher
 */
export interface Scratcher {
    /** The priority of the scratchers (they are executed in order of priority if the ones with higher priority failed) */
    priority: number;
    /** The scratcher, that given an isbn takes information */
    scratch: (isbn: string, page: puppeteer.Page) => Promise<ApiGetIsbn>;
}

const scratchers = getScratchers();
let page: puppeteer.Page | null = null;

/**
 * Initializes a puppeteer instance
 */
async function initPupetteer(): Promise<void> {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    page = await browser.newPage();
}

/**
 * Given an isbn, takes book information
 * @param isbn The isbn of the book
 * @param timeout A timeout in millis after which an error is thrown. Default 10 seconds.
 */
export async function getIsbnInfo(isbn: string, timeout = 10000): Promise<ApiGetIsbn | null> {
    let result: ApiGetIsbn | null = null;

    if (!page) {
        await initPupetteer();
    }

    const orderedScratchers = scratchers.sort((x, y) => x.priority - y.priority);

    for (const scratcher of orderedScratchers) {
        try {
            await Promise.race([
                (async () => {
                    result = await scratcher.scratch(isbn, page); 
                })(),
                new Promise<void>((_, reject) => {
                    setTimeout(() => {
                        reject(); 
                    }, timeout); 
                })
            ]);
            break;
        }
        catch (error) {
            throw new Error('Timeout exceeded');
        }
    }

    return result;
}