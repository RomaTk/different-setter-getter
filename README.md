# DataStore

This lib provides class to create **object with in and out interface and process functions** to follow that with **strong typisation**

Base example to show main functionality (lib has more functionality, look the API):

```typescript
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
const scale = dataStore.getData('scale') //will return {x: 2, y: 1}
const name = dataStore.getData('name') //will return 'el'
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/RomaTk/data-store.git
```

Go to the project directory

```bash
  cd data-store
```

Install dependencies

```bash
  yarn install
```

Start dev server for tests

```bash
  yarn run start
```

Linter

```bash
  yarn run lint
```

## API Reference

Here is simplified version of api, look `*.d.ts`

#### create DataStore

```typescript
const dataStore = new DataStore<StoreOut, StoreIn>(initData, preprocessingFunctions)
```

| Name                     | Type description               | Description                                  |
| :----------------------- | :----------------------------- | :------------------------------------------- |
| `StoreOut`               | `extends {}`                   | data type saved in the store and retured one |
| `StoreIn`                | `extends {}`                   | data type which is used in setting data      |
| `initData`               | `StoreOut`                     | initial data                                 |
| `preprocessingFunctions` | `{key: set and get functions}` | For set function if necessary should exist   |

#### getData

return data from store using **StoreOut** type

```typescript
dataStore.getData('scale')
```

#### setData

set data into store using **StoreIn** type

```typescript
dataStore.setData('scale', { x: 2 })
```

#### getProcessingFunctionsObj

return object with set and get preprocessing functions

```typescript
dataStore.getProcessingFunctionsObj('scale')
```

#### setProcessingFunctionsObj

setting object with set and get preprocessing functions

```typescript
dataStore.getProcessingFunctionsObj('scale'. {
    set: ()=>{
        return '{x:1, y:1}'
    }
    set: ()=>{
        return '{x:2, y:2}'
    }
})
```

#### getProcessingFunction

setting object with set and get preprocessing functions

```typescript
dataStore.getProcessingFunction('scale', 'set')
dataStore.getProcessingFunction('scale', 'get')
```

## Authors

-   [@RomaTk](https://github.com/RomaTk)
