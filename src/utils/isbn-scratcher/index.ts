import * as puppeteer from 'puppeteer';
import { ApiGetIsbn } from '@/types/api/isbn';
import getScratchers from './scratchers';

export interface Scratcher {
    priority: number;
    scratch: (isbn: string, page: puppeteer.Page) => Promise<ApiGetIsbn>;
}

const scratchers = getScratchers();
let page: puppeteer.Page | null = null;

async function initPupetteer(): Promise<void> {
    const browser = await puppeteer.launch();
    page = await browser.newPage();
}

export async function getIsbnInfo(isbn: string, timeout: number = 10000): Promise<ApiGetIsbn | null> {
    let result: ApiGetIsbn | null = null;

    if (!page) {
        await initPupetteer();
    }

    const orderedScratchers = scratchers.sort((x, y) => x.priority - y.priority);

    for (const scratcher of orderedScratchers) {
        try {
            await Promise.race([
                (async () => { result = await scratcher.scratch(isbn, page) })(),
                new Promise<void>((_, reject) => { setTimeout(() => { reject(); }, timeout) })
            ]);
            break;
        }
        catch (error) {}
    }

    return result;
}