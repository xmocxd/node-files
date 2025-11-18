import axios from 'axios';
import * as fsPromises from 'node:fs/promises';

const args: string[] = process.argv.slice(2);

async function cat(path: string) {
    const isURL: RegExp = /^https?:\/\//

    // if path is a filename, get local file
    // if path is a url, get remote file
    const data = isURL.test(path) ? await getRemote(path) : await getLocal(path);
    console.log(data);
}

async function getLocal(path: string): Promise<string> { 
    try {
        console.log('reading file', path);
        return await fsPromises.readFile(path, { encoding: 'utf8' });
    } catch (error) {
        console.error('error while attempting to read file:', error);
        return Promise.resolve('');
    }
}

async function getRemote(url: string): Promise<string> {
    try {
        console.log('reading url', url);
        return (await axios.get(url)).data;
    } catch (error) {
        console.error('error while attempting to read file:', error);
        return Promise.resolve('');
    }
}

if (args.length > 0) {
    cat(args[0]);
} else {
    console.error('please specify a filename');
}