import {
    ProcessingFunctions,
    ProcessingFuncObjWithRequiredSet,
    GetFunction,
    IfAlsways,
    IfEquals,
    RequireAtLeastOne,
    SetFunction,
} from './constants/interfaces'

export default class DiffSetGet<StoreOut extends {}, StoreIn extends {} = {}> {
    private savedData: StoreOut
    private preprocessingFunctions: ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>
    constructor(defaultValues: StoreOut, preprocessingFunctions: ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>) {
        this.savedData = defaultValues
        this.preprocessingFunctions = preprocessingFunctions
    }

    public getProcessingFunctionsObj<KEY extends keyof ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>>(
        key: KEY
    ): ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>[KEY] | undefined {
        if (key in this.preprocessingFunctions) {
            return this.preprocessingFunctions[key]
        }

        return undefined
    }

    public setProcessingFunctionsObj<
        KEY extends keyof StoreOut & keyof ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>,
        VALUE extends KEY extends keyof StoreIn & keyof StoreOut
            ? IfEquals<
                  StoreIn[KEY],
                  StoreOut[KEY],
                  RequireAtLeastOne<ProcessingFuncObjWithRequiredSet<StoreOut, StoreIn, KEY, DiffSetGet<StoreOut, StoreIn>>> | undefined,
                  ProcessingFuncObjWithRequiredSet<StoreOut, StoreIn, KEY, DiffSetGet<StoreOut, StoreIn>>
              >
            : RequireAtLeastOne<ProcessingFuncObjWithRequiredSet<StoreOut, StoreIn, KEY, DiffSetGet<StoreOut, StoreIn>>> | undefined
    >(key: KEY, value: VALUE) {
        if (value) {
            const keyDefType = key as KEY & keyof ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>
            this.preprocessingFunctions[keyDefType] = value as ProcessingFunctions<
                StoreOut,
                StoreIn,
                DiffSetGet<StoreOut, StoreIn>
            >[typeof keyDefType]
        } else {
            delete this.preprocessingFunctions[key as KEY & keyof ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>]
        }
    }

    public getProcessingFunction<
        KEY extends keyof ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>,
        TYPE extends 'set' | 'get'
    >(
        key: KEY,
        type: TYPE
    ): TYPE extends 'get'
        ? GetFunction<KEY & keyof StoreOut, StoreOut, DiffSetGet<StoreOut, StoreIn>> | undefined
        : IfAlsways<
              StoreOut,
              StoreIn,
              KEY & keyof StoreOut,
              SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>,
              SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>> | undefined
          > {
        const object = this.getProcessingFunctionsObj(key)
        if (object?.[type]) {
            return object[type] as TYPE extends 'get'
                ? GetFunction<KEY & keyof StoreOut, StoreOut, DiffSetGet<StoreOut, StoreIn>> | undefined
                : IfAlsways<
                      StoreOut,
                      StoreIn,
                      KEY & keyof StoreOut,
                      SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>,
                      SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>> | undefined
                  >
        }

        return undefined as TYPE extends 'get'
            ? GetFunction<KEY & keyof StoreOut, StoreOut, DiffSetGet<StoreOut, StoreIn>> | undefined
            : IfAlsways<
                  StoreOut,
                  StoreIn,
                  KEY & keyof StoreOut,
                  SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>,
                  SetFunction<KEY & keyof StoreOut, StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>> | undefined
              >
    }

    public setData<
        KEY extends keyof StoreOut & keyof ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>,
        DATA extends KEY extends keyof StoreIn ? StoreIn[KEY] : StoreOut[KEY]
    >(key: KEY, data: DATA) {
        let withSetFunction = false
        if (key in this.preprocessingFunctions) {
            const keyDefType = key
            const set = this.getProcessingFunction(keyDefType, 'set')
            if (set) {
                this.savedData[keyDefType] = set(
                    keyDefType,
                    data as Parameters<SetFunction<typeof keyDefType, StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>>[1],
                    this
                )
                withSetFunction = true
            }
        }
        if (!withSetFunction) {
            this.savedData[key] = data as StoreOut[KEY]
        }
    }

    public getData<KEY extends keyof StoreOut & keyof ProcessingFunctions<StoreOut, StoreIn, DiffSetGet<StoreOut, StoreIn>>>(key: KEY) {
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
