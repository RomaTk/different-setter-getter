import {
    ProcessingFunctions,
    ProcessingFuncObjWithRequiredSet,
    GetFunction,
    IfAlsways,
    IfEquals,
    RequireAtLeastOne,
    SetFunction,
} from './constants/interfaces'

export default class DataStore<StoreOut extends {}, StoreIn extends {} = {}> {
    protected savedData: StoreOut
    protected preprocessingFunctions: ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>
    constructor(defaultValues: StoreOut, preprocessingFunctions: ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>) {
        this.savedData = defaultValues
        this.preprocessingFunctions = preprocessingFunctions
    }

    public getProcessingFunctionsObj<KEY extends keyof ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>>(
        key: KEY
    ): ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>[KEY] | undefined {
        if (key in this.preprocessingFunctions) {
            return this.preprocessingFunctions[key]
        }

        return undefined
    }

    public setProcessingFunctionsObj<
        KEY extends keyof StoreOut & keyof ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>,
        VALUE extends KEY extends keyof StoreIn & keyof StoreOut
            ? IfEquals<
                  StoreIn[KEY],
                  StoreOut[KEY],
                  RequireAtLeastOne<ProcessingFuncObjWithRequiredSet<StoreOut, StoreIn, KEY, DataStore<StoreOut, StoreIn>>> | undefined,
                  ProcessingFuncObjWithRequiredSet<StoreOut, StoreIn, KEY, DataStore<StoreOut, StoreIn>>
              >
            : RequireAtLeastOne<ProcessingFuncObjWithRequiredSet<StoreOut, StoreIn, KEY, DataStore<StoreOut, StoreIn>>> | undefined
    >(key: KEY, value: VALUE) {
        if (value) {
            const keyDefType = key as KEY & keyof ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>
            this.preprocessingFunctions[keyDefType] = value as ProcessingFunctions<
                StoreOut,
                StoreIn,
                DataStore<StoreOut, StoreIn>
            >[typeof keyDefType]
        } else {
            delete this.preprocessingFunctions[key as KEY & keyof ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>]
        }
    }

    public getProcessingFunction<
        KEY extends keyof ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>,
        TYPE extends 'set' | 'get'
    >(
        key: KEY,
        type: TYPE
    ): TYPE extends 'get'
        ? GetFunction<KEY & keyof StoreOut, StoreOut, DataStore<StoreOut, StoreIn>> | undefined
        : IfAlsways<
              StoreOut,
              StoreIn,
              KEY & keyof StoreOut,
              SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>,
              SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DataStore<StoreOut, StoreIn>> | undefined
          > {
        const object = this.getProcessingFunctionsObj(key)
        if (object?.[type]) {
            return object[type] as TYPE extends 'get'
                ? GetFunction<KEY & keyof StoreOut, StoreOut, DataStore<StoreOut, StoreIn>> | undefined
                : IfAlsways<
                      StoreOut,
                      StoreIn,
                      KEY & keyof StoreOut,
                      SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>,
                      SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DataStore<StoreOut, StoreIn>> | undefined
                  >
        }

        return undefined as TYPE extends 'get'
            ? GetFunction<KEY & keyof StoreOut, StoreOut, DataStore<StoreOut, StoreIn>> | undefined
            : IfAlsways<
                  StoreOut,
                  StoreIn,
                  KEY & keyof StoreOut,
                  SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>,
                  SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DataStore<StoreOut, StoreIn>> | undefined
              >
    }

    public setData<
        KEY extends keyof StoreOut & keyof ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>,
        DATA extends KEY extends keyof StoreIn ? StoreIn[KEY] : StoreOut[KEY]
    >(key: KEY, data: DATA) {
        let withSetFunction = false
        if (key in this.preprocessingFunctions) {
            const keyDefType = key
            const set = this.getProcessingFunction(keyDefType, 'set')
            if (set) {
                this.savedData[keyDefType] = set(
                    keyDefType,
                    data as Parameters<SetFunction<typeof keyDefType, StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>>[1],
                    this
                )
                withSetFunction = true
            }
        }
        if (!withSetFunction) {
            this.savedData[key] = data as StoreOut[KEY]
        }
    }

    public getData<KEY extends keyof StoreOut & keyof ProcessingFunctions<StoreOut, StoreIn, DataStore<StoreOut, StoreIn>>>(key: KEY) {
        if (key in this.preprocessingFunctions) {
            const keyDefType = key
            const get = this.getProcessingFunction(keyDefType, 'get')
            if (get) {
                return get(keyDefType, this.savedData[keyDefType], this)
            }
        }

        return this.savedData[key]
    }
}
