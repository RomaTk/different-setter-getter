import DataStore from '../../diff-set-get'

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
    }[Keys]

export type IfEquals<T, U, Y = true, N = false> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U ? 1 : 2 ? Y : N

export type IfAlsways<
    ObjectOut extends {},
    ObjectIn extends {},
    key extends keyof ObjectOut,
    T = true,
    F = false
> = key extends keyof ObjectIn ? IfEquals<ObjectIn[key], ObjectOut[key], F, T> : F

export type SetFunction<
    Key extends keyof ObjectOut,
    ObjectOut extends {},
    ObjectIn extends {},
    ThisDataStore extends DataStore<any, any>
> = <KEY extends Key, DATA extends KEY extends keyof ObjectIn ? ObjectIn[KEY] : ObjectOut[KEY]>(
    key: KEY,
    data: DATA,
    thisDataStore: ThisDataStore
) => ObjectOut[KEY]

export type GetFunction<Key extends keyof ObjectOut, ObjectOut extends {}, ThisDataStore extends DataStore<any, any>> = <KEY extends Key>(
    key: KEY,
    data: ObjectOut[KEY],
    thisDataStore: ThisDataStore
) => ObjectOut[KEY]

export type ProcessingFuncObjWithRequiredSet<
    StoreOut extends {},
    StoreIn extends {},
    Key extends keyof StoreOut,
    ThisDataStore extends DataStore<any, any>
> = ReturnType<
    () => {
        set: SetFunction<Key, StoreOut, StoreIn, ThisDataStore>
        get?: GetFunction<Key, StoreOut, ThisDataStore>
    }
>

export type WithRequieredSet<StoreOut extends {}, StoreIn extends {}, ThisDataStore extends DataStore<any, any>> = {
    [Key in keyof StoreOut as IfAlsways<StoreOut, StoreIn, Key, Key, never>]: ProcessingFuncObjWithRequiredSet<
        StoreOut,
        StoreIn,
        Key,
        ThisDataStore
    >
}

export type ProcessingFunctions<StoreOut extends {}, StoreIn extends {}, ThisDataStore extends DataStore<any, any>> = WithRequieredSet<
    StoreOut,
    StoreIn,
    ThisDataStore
> &
    Omit<
        {
            [Key in keyof StoreOut]?: RequireAtLeastOne<
                ProcessingFuncObjWithRequiredSet<
                    StoreOut,
                    StoreIn,
                    Key & keyof ProcessingFunctions<StoreOut, StoreIn, ThisDataStore>,
                    ThisDataStore
                >
            >
        },
        keyof WithRequieredSet<StoreOut, StoreIn, ThisDataStore>
    >
