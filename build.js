import archiver from "archiver"
import esbuild from "esbuild"
import fs from "fs"
import path from "path"
import * as sass from "sass"
import { createWriteStream } from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function cleanUp() {
  console.log("🧹 Cleaning up build files...")
  const foldersDelete = ["out", "dist"]
  foldersDelete.forEach(folder => {
    fs.rmdir(path.join(__dirname, folder), { recursive: true }, (err) => {
      if (err) {
        // Ignore errors
      }
    })
  })
  console.log("🧹 Cleanup complete")
}

async function copyAssets() {
  console.log("📋 Copying asset files...")

  const files = fs.readdirSync(path.join(__dirname, "src"), { withFileTypes: true })
  files.forEach(file => {
    if (file.isFile() && (file.name.endsWith(".html") || file.name.endsWith(".json"))) {
      fs.copyFileSync(
        path.join(__dirname, "src", file.name),
        path.join(__dirname, "out", file.name)
      )
    }
  })

  const srcImages = path.join(__dirname, "src", "images")
  const outImages = path.join(__dirname, "out", "images")

  fs.cpSync(srcImages, outImages, { recursive: true })
  console.log("📋 Asset copy complete")
}

async function buildJS() {
  console.log("📦 Building JavaScript files...")

  const builds = [
    { entryPoints: ["src/js/index.js"], outfile: "out/js/index.js" },
    { entryPoints: ["src/js/options.js"], outfile: "out/js/options.js" },
  ]

  await Promise.all(
    builds.map(cfg => esbuild.build({
      bundle: true,
      format: "iife",
      minify: true,
      sourcemap: false,
      target: ["es2017"],
      ...cfg
    }))
  )
  console.log("📦 JS build complete")
}

async function buildSASS() {
  console.log("🎨 Building SASS files...")
  const result = sass.compile(path.join(__dirname, "src/sass/index.sass"), { style: "compressed" })
  const outputFile = path.join(__dirname, "out/css", "index.css");
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, result.css)
  console.log("🎨 SASS build complete")
}

async function createZip() {
  console.log("🗜️ Creating ZIP archive...")

  const timestamp = Math.floor(Date.now() / 1000)
  const zipPublic = `plugin_${timestamp}.zip`
  const zipSource = `source_${timestamp}.zip`

  const zipPath = path.join(`${__dirname}/dist`, zipPublic)
  const outputPublic = createWriteStream(zipPath)
  const archiveOut = archiver("zip", { zlib: { level: 9 } })
  archiveOut.pipe(outputPublic)
  archiveOut.directory(path.join(__dirname, "out/"), false)
  await archiveOut.finalize()

  // Firefox wants source if minified, so include source files too
  const zipSourcePath = path.join(`${__dirname}/dist`, zipSource)
  const outputSource = createWriteStream(zipSourcePath)
  const archiveSource = archiver("zip", { zlib: { level: 9 } })
  archiveSource.pipe(outputSource)
  archiveSource.directory(path.join(__dirname, "src/"), false)

  const extraFiles = ["build.js", "package.json"]
  extraFiles.forEach(file => {
    archiveSource.file(path.join(__dirname, file), { name: file })
  })

  await archiveSource.finalize()

  console.log(`🗜️ Created ${zipPublic} and ${zipSource}`)
}

// Run with node build.js [zip] [js]
// Accept multiple arguments in any order
const args = process.argv.slice(2)
const doZip = args.includes("zip")
const doJS = args.includes("js")
const doSASS = args.includes("css")
const assets = args.includes("assets")
const clean = args.includes("clean")

if (clean) {
  await cleanUp()
}

const build_folders = ["dist", "out"]

build_folders.forEach(folder => {
  if (!fs.existsSync(path.join(__dirname, folder))) {
    fs.mkdirSync(path.join(__dirname, folder), { recursive: true })
  }
})

if (!args.length) {
  await copyAssets()
  await buildJS()
  await buildSASS()
  await createZip()
} else {
  if (doJS) await buildJS()
  if (doSASS) await buildSASS()
  if (doZip) await createZip()
  if (assets) await copyAssets()
}

