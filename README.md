# different-setter-getter

This lib is to make object with **different getter and setters**.
For example, you would like to set scale as just number, but in result you always have scale defined as `{x: number, y: number}`. This is not easy to do in **typescript**, so this lib resolves this problem.

With **strong typing** in this lib controlles when preprocessing function should be setted to convert setter to type in getter, when not. So this util is good to use in many cases to avoid additional checking process in project to follow **strong typing**.

Base example to show main functionality (lib has more functionality, look the API):

```typescript
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
const scale = dataobj.getData('scale') //will return {x: 2, y: 1}
const name = dataobj.getData('name') //will return 'el'
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

#### create some object

```typescript
const dataobj = new DiffSetGet<StoreOut, StoreIn>(initData, preprocessingFunctions)
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
dataobj.getData('scale')
```

#### setData

set data into store using **StoreIn** type

```typescript
dataobj.setData('scale', { x: 2 })
```

#### getProcessingFunctionsObj

return object with set and get preprocessing functions

```typescript
dataobj.getProcessingFunctionsObj('scale')
```

#### setProcessingFunctionsObj

setting object with set and get preprocessing functions

```typescript
dataobj.getProcessingFunctionsObj('scale'. {
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
dataobj.getProcessingFunction('scale', 'set')
dataobj.getProcessingFunction('scale', 'get')
```

## Authors

-   [@RomaTk](https://github.com/RomaTk)
