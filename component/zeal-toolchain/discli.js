const fs = require('fs').promises;
var program = require("commander");
var dismain = require("../disassembler/disassembler");

const disassembler = new dismain.Disassembler();


program
    .option('-f, --file <file>', 'Input file')
    .option('-s, --save <string>', 'File name to save');

program.parse();

var pargs = program.opts();

// console.log('Options: ', program.opts());

var file = pargs.file;
var save = pargs.save;

async function readFile() {
    let data = await fs.readFile(file);
    let array = new Uint8Array(data);
    return array;
}

async function main() {
    if (!file) {
        console.log("Please select a file");
        return;
    }
    var data = await readFile();
    let res = disassembler.disassemble(data, data.length, 0);
    let instr;
    console.log("Disassemble result:\n");
    for (var i=0; i<res.length; i++){
        instr = res[i].instruction;
        console.log(instr);
        if (save) {
            instr = instr.trim();
            instr += "\n";
            fs.appendFile(save, instr);
        }
    }
}

main();
