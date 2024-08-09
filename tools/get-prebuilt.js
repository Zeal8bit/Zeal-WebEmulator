const https = require("https");
const fs = require("fs");

console.log("Getting Pre-built roms");

const prebuilt_json_url = "https://zeal8bit.com/roms/index.json";

const getRom = async (rom) => {
  const fileName = rom.urls.split("/").slice(-1)[0];
  const romPath = `roms/${fileName}`

  if (fs.existsSync(`roms/${fileName}`)) {
    console.log(`Exists roms/${fileName}`);
    rom.urls = romPath;
    return rom;
  }

  return new Promise((resolve, reject) => {
    https.get(rom.urls, (res) => {
      process.stdout.write(`Downloading ${rom.urls} `);
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
        }).on('error', (err) => {
          reject(err);
        });
    });
  });
};

(async () => {
  const data = await fetch(prebuilt_json_url);
  json = await data.json();

  const indexFile = {
    indexversion: json.indexversion,
    latest: null,
    nightly: [],
    stable: [],
  };

  if (json.latest) {
    indexFile.latest = await getRom(json.latest).catch((err) => {
      return json.latest;
    });
  }
  if (json.nightly?.length > 0) {
    for (let i = 0; i < json.nightly.length; i++) {
      indexFile.nightly.push(await getRom(json.nightly[i]).catch((err) => {
        return json.nightly[i];
      }));
    }
  }
  if (json.stable?.length > 0) {
    for (let i = 0; i < json.stable.length; i++) {
      indexFile.stable.push(await getRom(json.stable[i]).catch((err) => {
        return json.stable[i];
      }));
    }
  }

  fs.writeFileSync(`roms/index.json`, JSON.stringify(indexFile, false, 2));
})();
