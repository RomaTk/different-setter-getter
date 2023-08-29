const fs = require('fs')

function changeRegistry() {
    const data = fs.readFileSync('package.json', 'utf-8')
    const jsonData = JSON.parse(data)
    const wasPublishConfig = jsonData.publishConfig
    if (wasPublishConfig) {
        const indexRegistry = process.argv.indexOf('--registry')
        if (indexRegistry > -1) {
            jsonData.publishConfig = { ...wasPublishConfig, registry: process.argv[indexRegistry + 1] }
        }
    }
    fs.writeFileSync('package.json', JSON.stringify(jsonData, null, 2))
}

changeRegistry()
