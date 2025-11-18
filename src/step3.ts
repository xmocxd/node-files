import axios from 'axios';
import * as fsPromises from 'node:fs/promises';

const args: string[] = process.argv.slice(2);

interface parsedArgs {
    path: string;
    outFile?: string;
}

async function getData(path: string): Promise<string> {
    const isURL: RegExp = /^https?:\/\//
    
    // if path is a filename, get local file
    // if path is a url, get remote file
    return isURL.test(path) ? await getRemote(path) : await getLocal(path);
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

function setOutFile(arg: string) { return { outFile: arg }; }

function parseCliArgs(cliArgs: string[]): parsedArgs {
    const isOption: RegExp = /^--/;
    
    type optionsObject = {
        [key: string]: (...args: any[]) => any;
    };
    
    const options: optionsObject = {
        out: setOutFile
    };
    
    let option: string = '';
    
    let parsedCliArgs: parsedArgs = {
        path: ''
    }
    
    if (args.length > 0) {
        for (let arg of cliArgs) {
            // set an option if detected
            if (isOption.test(arg)) {
                option = arg.slice(2);
                continue; // continue to process next argument as arg for this option
            }
            
            // attempt to process option flag against current arg, if applicable
            if (option.length > 0) {
                // if there is an option set
                if (option in options) {
                    // check if valid option
                    const newArgs = options[option](arg);
                    parsedCliArgs = {...parsedCliArgs, ...newArgs};
                } else {
                    throw new Error(`Unknown option: --${option}`);
                }
                
                option = ''; // clear option for processing next arg
            } else {
                // no option specified, so current arg is the input file path
                parsedCliArgs.path = arg;
            }
            
        }
    } else {
        throw new Error('please specify a file');
    }
    
    return parsedCliArgs;
}

async function catToFile(dataPromise: Promise<string>, out: string) {
    try {
        const data = await dataPromise;
        await fsPromises.writeFile(out, data, { encoding: 'utf8' });
        
        console.log(`Wrote output to ${out}`);
    } catch (error) {
        console.log(`Error writing to ${out}`)
        throw error;
    }
}

async function main() {
    let pargs: parsedArgs;
    
    try {
        pargs = parseCliArgs(args);
        
        // if outfile is provided, write to file. otherwise, cat
        pargs.outFile === undefined ? console.log(await getData(pargs.path)) : catToFile(getData(pargs.path), pargs.outFile);
    } catch (error) {
        console.error('error processing arguments:', error);
        return;
    }
}

main();