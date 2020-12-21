const z = require('zzz')
const markdown = require('.')

const darkOne = require('./dark-one')

const readme = require('fs').readFileSync(__dirname + '/README.md', 'utf8')

z.mount(z(() => markdown`.${darkOne}`(readme)))
