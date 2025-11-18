import * as fsPromises from 'node:fs/promises';

const args: string[] = process.argv.slice(2);

async function cat(path: string) {
  try {
    console.log('reading', path);
    
    const data: string = await fsPromises.readFile(path, { encoding: 'utf8' });
    console.log(data);
  } catch (error) {
    console.error('error while attempting to read file:', error);
  }
}

if (args.length > 0) {
  cat(args[0]);
} else {
  console.error('please specify a filename');
}