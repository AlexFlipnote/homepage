import archiver from "archiver"
import esbuild from "esbuild"
import fs from "fs"
import path from "path"
import { createWriteStream } from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const shared = {
  bundle: true,
  format: "iife",
  minify: true,
  sourcemap: false,
  target: ["es2017"]
}

const builds = [
  { entryPoints: ["src/index.js"], outfile: "assets/js/index.js" },
  { entryPoints: ["src/options.js"], outfile: "assets/js/options.js" },
]

const extras = ["index.html", "manifest.json"]

async function buildJS() {
  console.log("📦 Building JavaScript files...")
  await Promise.all(builds.map(cfg => esbuild.build({ ...shared, ...cfg })))
  console.log("📦 JS build complete")
}

async function createZip() {
  console.log("🗜️ Creating ZIP archive...")
  // Time to ZIP yes!
  if (!fs.existsSync(path.join(__dirname, "dist"))) {
    fs.mkdirSync(path.join(__dirname, "dist"))
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const zipName = `plugin_${timestamp}.zip`
  const zipPath = path.join(`${__dirname}/dist`, zipName)
  const output = createWriteStream(zipPath)

  const archive = archiver("zip", { zlib: { level: 9 } })
  archive.pipe(output)
  archive.directory("assets/")
  extras.forEach(f => { if (fs.existsSync(f)) archive.file(f, { name: f }) })

  await archive.finalize()

  console.log(`🗜️ Created ${zipName}`)
}

// Run with node build.js [zip] [js]
// Accept multiple arguments in any order
const args = process.argv.slice(2)
const doZip = args.includes("zip")
const doJS = args.includes("js")

if (doJS) await buildJS()
if (doZip) await createZip()

if (!args.length) {
  await buildJS()
  await createZip()
}

