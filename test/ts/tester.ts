export default (tests: Array<{ name: string; func: () => Promise<number | string> }>) => {
    const testsLength = tests.length
    const numberTestSpan = document.getElementById('number-tests')
    const doneNowTestsSpan = document.getElementById('done-now-tests')
    let doneNowTests = 0
    if (numberTestSpan && doneNowTestsSpan) {
        numberTestSpan.innerText = String(testsLength)
        doneNowTestsSpan.innerText = String(doneNowTests)
        for (let i = 0; i < testsLength; i += 1) {
            try {
                const startTime = performance.now()
                tests[i]
                    .func()
                    .then((result) => {
                        const div = document.createElement('div')
                        div.classList.add('good', 'border-general')
                        const divName = document.createElement('div')
                        divName.innerText = `#${i} Name: ${tests[i].name}`
                        divName.classList.add('name')
                        const divExplanation = document.createElement('div')
                        divExplanation.innerText = `Result: ${result}`
                        const timeDiv = document.createElement('div')
                        timeDiv.innerText = `Time: ${performance.now() - startTime}s`
                        div.appendChild(divName)
                        div.appendChild(divExplanation)
                        div.appendChild(timeDiv)
                        document.body.appendChild(div)
                    })
                    .catch((result) => {
                        const div = document.createElement('div')
                        div.classList.add('bad', 'border-general')
                        const divName = document.createElement('div')
                        divName.innerText = `#${i} Name: ${tests[i].name}`
                        divName.classList.add('name')
                        const divExplanation = document.createElement('div')
                        divExplanation.innerText = `Result: ${result}`
                        const timeDiv = document.createElement('div')
                        timeDiv.innerText = `Time: ${performance.now() - startTime}s`
                        div.appendChild(divName)
                        div.appendChild(divExplanation)
                        div.appendChild(timeDiv)
                        document.body.appendChild(div)
                    })
                    .finally(() => {
                        doneNowTests += 1
                        doneNowTestsSpan.innerText = String(doneNowTests)
                    })
            } catch (error) {
                console.log(`ERROR IN TEST: #${i}`)
                console.error(error)
                doneNowTests += 1
                doneNowTestsSpan.innerText = String(doneNowTests)
            }
        }
    }
}
