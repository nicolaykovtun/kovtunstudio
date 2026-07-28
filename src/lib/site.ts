import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const dataPath = path.resolve('./src/data/site.yaml');
const site = yaml.load(fs.readFileSync(dataPath, 'utf8')) as any;

export default site;
