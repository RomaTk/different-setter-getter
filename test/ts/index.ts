import { DiffSetGet } from '../../src'
import tester from './tester'

//JUST FOR CHECKING TYPISATION
;() => {
    new DiffSetGet<{ a: number; b: string }>({ a: 1, b: 'ac' }, {})
    //@ts-expect-error
    new DiffSetGet<{ a: number; b: string }, { b: number }>({ a: 1, b: 'ac' }, {})
    const dataobj = new DiffSetGet<{ a: number; b: string }, { b: number }>(
        { a: 1, b: 'ac' },
        {
            b: {
                set: () => {
                    return '1'
                },
            },
        }
    )
    dataobj.getData('a') === 1
    dataobj.setData('a', 1)
    //@ts-expect-error
    dataobj.getData('a') === '1'
    //@ts-expect-error
    dataobj.setData('a', '1')

    dataobj.getData('b') === '1'
    dataobj.setData('b', 1)
    //@ts-expect-error
    dataobj.getData('b') === 1
    //@ts-expect-error
    dataobj.setData('b', '1')

    dataobj.setProcessingFunctionsObj('a', {
        get: (name, prop) => {
            return prop + 2
        },
        set: dataobj.getProcessingFunction('a', 'set'),
    })
    // @ts-expect-error
    dataobj.setProcessingFunctionsObj('b', {
        get: (name, prop) => {
            return prop + 2
        },
    })
    // @ts-expect-error
    dataobj.setProcessingFunctionsObj('a', {})
    // @ts-expect-error
    dataobj.setProcessingFunctionsObj('b', {})
    new DiffSetGet<{ a: number; b: string }, { b: number }>(
        { a: 1, b: 'ac' },
        {
            //@ts-expect-error
            b: {
                get: () => {
                    return '1'
                },
            },
        }
    )
    new DiffSetGet<{ a: number; b: string }, { b: number | string }>(
        { a: 1, b: 'ac' },
        {
            a: {
                // @ts-expect-error
                get: () => {
                    return '1'
                },
            },
            b: {
                set: () => {
                    return '1'
                },
            },
        }
    )
    new DiffSetGet<{ a: number; b: string }, { b: number | string }>(
        { a: 1, b: 'ac' },
        {
            a: {
                get: () => {
                    return 1
                },
            },
            b: {
                set: () => {
                    return '1'
                },
            },
        }
    )
}

tester([
    {
        name: 'Get and set functions (without preprocessing functions)',
        func: () => {
            const shouldBeResult = '110acfd'
            let realResult = ''
            const dataobj = new DiffSetGet<{ a: number; b: string }>({ a: 1, b: 'ac' }, {})
            realResult += String(dataobj.getData('a'))
            dataobj.setData('a', 10)
            realResult += String(dataobj.getData('a'))
            realResult += String(dataobj.getData('b'))
            dataobj.setData('b', 'fd')
            realResult += String(dataobj.getData('b'))

            return new Promise((resolve, reject) => {
                if (shouldBeResult === realResult) {
                    resolve('true')
                } else {
                    reject(`value is ${realResult}, should be ${shouldBeResult}`)
                }
            })
        },
    },
    {
        name: 'Get and set functions (with preprocessing functions)',
        func: () => {
            const shouldBeResult = '110acafda'
            let realResult = ''
            const dataobj = new DiffSetGet<{ a: number; b: string }, { b: { realValue: string } }>(
                { a: 1, b: 'ac' },
                {
                    b: {
                        set: (name, prop) => {
                            return prop.realValue
                        },
                        get: (name, prop) => {
                            return prop + 'a'
                        },
                    },
                }
            )
            realResult += String(dataobj.getData('a'))
            dataobj.setData('a', 10)
            realResult += String(dataobj.getData('a'))
            realResult += String(dataobj.getData('b'))
            dataobj.setData('b', { realValue: 'fd' })
            realResult += String(dataobj.getData('b'))

            return new Promise((resolve, reject) => {
                if (shouldBeResult === realResult) {
                    resolve('true')
                } else {
                    reject(`value is ${realResult}, should be ${shouldBeResult}`)
                }
            })
        },
    },
    {
        name: 'Change processing functions',
        func: () => {
            const shouldBeResult = '1377acaacaoika'
            let realResult = ''
            const dataobj = new DiffSetGet<{ a: number; b: string }, { b: { realValue: string } }>(
                { a: 1, b: 'ac' },
                {
                    b: {
                        set: (name, prop) => {
                            return prop.realValue
                        },
                        get: (name, prop) => {
                            return prop + 'a'
                        },
                    },
                }
            )
            realResult += dataobj.getData('a')
            dataobj.setProcessingFunctionsObj('a', {
                get: (name, prop) => {
                    return prop + 2
                },
                set: dataobj.getProcessingFunction('a', 'set'),
            })

            realResult += dataobj.getData('a')
            dataobj.setData('a', 5)
            realResult += dataobj.getData('a')
            dataobj.setProcessingFunctionsObj('a', dataobj.getProcessingFunctionsObj('a'))
            realResult += dataobj.getData('a')
            realResult += dataobj.getData('b')
            const wasSetFunc = dataobj.getProcessingFunction('b', 'set')
            dataobj.setProcessingFunctionsObj('b', {
                get: dataobj.getProcessingFunction('b', 'get'),
                set: (name, prop, thisdataobj) => {
                    return wasSetFunc(name, prop, thisdataobj) + 'k'
                },
            })
            realResult += dataobj.getData('b')
            dataobj.setData('b', { realValue: 'oi' })
            realResult += dataobj.getData('b')

            return new Promise((resolve, reject) => {
                if (shouldBeResult === realResult) {
                    resolve('true')
                } else {
                    reject(`value is ${realResult}, should be ${shouldBeResult}`)
                }
            })
        },
    },
    {
        name: 'Example',
        func: () => {
            const dataobj = new DiffSetGet<
                { scale: { x: number; y: number }; id: string; name: string },
                {
                    scale:
                        | {
                              x?: number
                              y?: number
                          }
                        | number
                }
            >(
                {
                    scale: {
                        x: 1,
                        y: 1,
                    },
                    name: 'el',
                    id: 'el_1',
                },
                {
                    scale: {
                        set: (key, value, thisDataobj) => {
                            if (typeof value === 'number') {
                                return { x: value, y: value }
                            } else {
                                const object = thisDataobj.getData('scale')
                                if (value.x) {
                                    object.x = value.x
                                }
                                if (value.y) {
                                    object.y = value.y
                                }

                                return object
                            }
                        },
                        get: (key, value) => {
                            return { ...value }
                        },
                    },
                }
            )
            dataobj.setData('scale', { x: 2 })
            const scale = dataobj.getData('scale')
            const name = dataobj.getData('name')
            let result = false
            if (scale.x === 2 && scale.y === 1 && name === 'el') {
                result = true
            }

            return new Promise((resolve, reject) => {
                if (result) {
                    resolve('true')
                } else {
                    reject('incorrect result')
                }
            })
        },
    },
])
