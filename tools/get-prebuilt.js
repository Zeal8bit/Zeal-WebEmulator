const https = require("https");
const fs = require("fs");

const prebuilt_json_url = "https://zeal8bit.com/roms/index.json";

const getRom = async (rom, remote = null) => {
    // rename files to match "unique" name, to avoid conflicts
    const romPath = `roms/${rom.name}.img`

    if (fs.existsSync(romPath)) {
        console.log(`Exists ${romPath}`);
        rom.urls = romPath;
        return rom;
    }

    const url = remote ? remote : rom.urls;

    return new Promise((resolve, reject) => {
        process.stdout.write(`Downloading ${url} `);
        https.get(url, (res) => {
            // handle redirects
            if([301,302,307,308].includes(res.statusCode)) {
                process.stdout.write('->\n');
                resolve(getRom(rom, res.headers.location));
                return;
            }

            if(res.statusCode !== 200) {
                process.stdout.write(`... Failed ${res.statusCode}\n`);
                reject('file not found');
                return;
            }

            const content = [];
            res
                .on("data", (chunk) => {
                    content.push(chunk);
                })
                .on("end", () => {
                    const buffer = Buffer.concat(content);
                    fs.writeFileSync(romPath, buffer);
                    rom.urls = romPath;
                    process.stdout.write("... Done\n");
                    resolve(rom);
                })
                .on('error', (err) => {
                    reject(err);
                });
        }).on('error', (e) => {
            console.log(`An error occurred downloading ${url}`);
            reject(e);
        });
    });
};

const getAll = async () => {
    const data = await fetch(prebuilt_json_url).catch((err) => {
        console.log(`An error occurred downloading ${prebuilt_json_url}`);
        console.error(err);
        process.exit(1);
    });
    json = await data.json();

    const indexFile = {
        indexversion: json.indexversion,
        latest: null,
        nightly: [],
        stable: [],
    };

    // mkdir if not exists
    fs.mkdirSync('roms', {
        recursive: true,
    });

    console.log('\nLatest:');
    if (json.latest) {
        indexFile.latest = await getRom(json.latest).catch((err) => {
            return null;
        });
    }
    console.log('\nNightly:');
    if (json.nightly?.length > 0) {
        for (let i = 0; i < json.nightly.length; i++) {
            let rom = await getRom(json.nightly[i]).catch((err) => {
                return null;
            })
            if(rom) {
                indexFile.nightly.push(rom);
            }
        }
    }
    console.log('\nStable:');
    if (json.stable?.length > 0) {
        for (let i = 0; i < json.stable.length; i++) {
            let rom = await getRom(json.stable[i]).catch((err) => {
                return null;
            });
            if(rom) {
                indexFile.stable.push(rom);
            }
        }
    }

    console.log('\n\nWriting roms/index.json');
    fileString = JSON.stringify(indexFile, false, 2);
    fs.writeFileSync(`roms/index.json`, fileString);
};

(async () => {
    console.log("Getting Pre-built ROMs");
    await getAll();
})();

// TODO: reuse these functions
// module.exports = getAll;
// module.exports = getRom;
