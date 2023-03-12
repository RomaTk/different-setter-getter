import { DataStore } from '../../src'
import tester from './tester'

//JUST FOR CHECKING TYPISATION
;() => {
    new DataStore<{ a: number; b: string }>({ a: 1, b: 'ac' }, {})
    //@ts-expect-error
    new DataStore<{ a: number; b: string }, { b: number }>({ a: 1, b: 'ac' }, {})
    const dataobj = new DataStore<{ a: number; b: string }, { b: number }>(
        { a: 1, b: 'ac' },
        {
            b: {
                set: (name, prop) => {
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
    new DataStore<{ a: number; b: string }, { b: number }>(
        { a: 1, b: 'ac' },
        {
            //@ts-expect-error
            b: {
                get: (name, prop) => {
                    return '1'
                },
            },
        }
    )
    new DataStore<{ a: number; b: string }, { b: number | string }>(
        { a: 1, b: 'ac' },
        {
            a: {
                // @ts-expect-error
                get: () => {
                    return '1'
                },
            },
            b: {
                set: (name, prop) => {
                    return '1'
                },
            },
        }
    )
    new DataStore<{ a: number; b: string }, { b: number | string }>(
        { a: 1, b: 'ac' },
        {
            a: {
                get: () => {
                    return 1
                },
            },
            b: {
                set: (name, prop) => {
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
            const dataStore = new DataStore<{ a: number; b: string }>({ a: 1, b: 'ac' }, {})
            realResult += String(dataStore.getData('a'))
            dataStore.setData('a', 10)
            realResult += String(dataStore.getData('a'))
            realResult += String(dataStore.getData('b'))
            dataStore.setData('b', 'fd')
            realResult += String(dataStore.getData('b'))
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
            const dataStore = new DataStore<{ a: number; b: string }, { b: { realValue: string } }>(
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
            realResult += String(dataStore.getData('a'))
            dataStore.setData('a', 10)
            realResult += String(dataStore.getData('a'))
            realResult += String(dataStore.getData('b'))
            dataStore.setData('b', { realValue: 'fd' })
            realResult += String(dataStore.getData('b'))
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
            const dataStore = new DataStore<{ a: number; b: string }, { b: { realValue: string } }>(
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
            realResult += dataStore.getData('a')
            dataStore.setProcessingFunctionsObj('a', {
                get: (name, prop) => {
                    return prop + 2
                },
                set: dataStore.getProcessingFunction('a', 'set'),
            })

            realResult += dataStore.getData('a')
            dataStore.setData('a', 5)
            realResult += dataStore.getData('a')
            dataStore.setProcessingFunctionsObj('a', dataStore.getProcessingFunctionsObj('a'))
            realResult += dataStore.getData('a')
            realResult += dataStore.getData('b')
            const wasSetFunc = dataStore.getProcessingFunction('b', 'set')
            dataStore.setProcessingFunctionsObj('b', {
                get: dataStore.getProcessingFunction('b', 'get'),
                set: (name, prop, thisDataStore) => {
                    return wasSetFunc(name, prop, thisDataStore) + 'k'
                },
            })
            realResult += dataStore.getData('b')
            dataStore.setData('b', { realValue: 'oi' })
            realResult += dataStore.getData('b')
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
            const dataStore = new DataStore<
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
                        set: (key, value, thisDataStore) => {
                            if (typeof value === 'number') {
                                return { x: value, y: value }
                            } else {
                                const object = thisDataStore.getData('scale')
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
            dataStore.setData('scale', { x: 2 })
            const scale = dataStore.getData('scale')
            const name = dataStore.getData('name')
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
