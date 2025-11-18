"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fsPromises = __importStar(require("node:fs/promises"));
const args = process.argv.slice(2);
async function getData(path) {
    const isURL = /^https?:\/\//;
    // if path is a filename, get local file
    // if path is a url, get remote file
    return isURL.test(path) ? await getRemote(path) : await getLocal(path);
}
async function getLocal(path) {
    try {
        console.log('reading file', path);
        return await fsPromises.readFile(path, { encoding: 'utf8' });
    }
    catch (error) {
        console.error('error while attempting to read file:', error);
        return Promise.resolve('');
    }
}
async function getRemote(url) {
    try {
        console.log('reading url', url);
        return (await axios_1.default.get(url)).data;
    }
    catch (error) {
        console.error('error while attempting to read file:', error);
        return Promise.resolve('');
    }
}
function setOutFile(arg) { return { outFile: arg }; }
function parseCliArgs(cliArgs) {
    const isOption = /^--/;
    const options = {
        out: setOutFile
    };
    let option = '';
    let parsedCliArgs = {
        path: ''
    };
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
                    parsedCliArgs = { ...parsedCliArgs, ...newArgs };
                }
                else {
                    throw new Error(`Unknown option: --${option}`);
                }
                option = ''; // clear option for processing next arg
            }
            else {
                // no option specified, so current arg is the input file path
                parsedCliArgs.path = arg;
            }
        }
    }
    else {
        throw new Error('please specify a file');
    }
    return parsedCliArgs;
}
async function catToFile(dataPromise, out) {
    try {
        const data = await dataPromise;
        await fsPromises.writeFile(out, data, { encoding: 'utf8' });
        console.log(`Wrote output to ${out}`);
    }
    catch (error) {
        console.log(`Error writing to ${out}`);
        throw error;
    }
}
async function main() {
    let pargs;
    try {
        pargs = parseCliArgs(args);
        // if outfile is provided, write to file. otherwise, cat
        pargs.outFile === undefined ? console.log(await getData(pargs.path)) : catToFile(getData(pargs.path), pargs.outFile);
    }
    catch (error) {
        console.error('error processing arguments:', error);
        return;
    }
}
main();
