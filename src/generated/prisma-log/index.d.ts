
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ProfileChangeLog
 * Append-only consumer-written archive of profile changes (one row per event).
 */
export type ProfileChangeLog = $Result.DefaultSelection<Prisma.$ProfileChangeLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const EmployeeRole: {
  employee: 'employee',
  hrd: 'hrd'
};

export type EmployeeRole = (typeof EmployeeRole)[keyof typeof EmployeeRole]

}

export type EmployeeRole = $Enums.EmployeeRole

export const EmployeeRole: typeof $Enums.EmployeeRole

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ProfileChangeLogs
 * const profileChangeLogs = await prisma.profileChangeLog.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ProfileChangeLogs
   * const profileChangeLogs = await prisma.profileChangeLog.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.profileChangeLog`: Exposes CRUD operations for the **ProfileChangeLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProfileChangeLogs
    * const profileChangeLogs = await prisma.profileChangeLog.findMany()
    * ```
    */
  get profileChangeLog(): Prisma.ProfileChangeLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.12.0
   * Query Engine version: 8047c96bbd92db98a2abc7c9323ce77c02c89dbc
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ProfileChangeLog: 'ProfileChangeLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "profileChangeLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ProfileChangeLog: {
        payload: Prisma.$ProfileChangeLogPayload<ExtArgs>
        fields: Prisma.ProfileChangeLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProfileChangeLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProfileChangeLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>
          }
          findFirst: {
            args: Prisma.ProfileChangeLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProfileChangeLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>
          }
          findMany: {
            args: Prisma.ProfileChangeLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>[]
          }
          create: {
            args: Prisma.ProfileChangeLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>
          }
          createMany: {
            args: Prisma.ProfileChangeLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProfileChangeLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>[]
          }
          delete: {
            args: Prisma.ProfileChangeLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>
          }
          update: {
            args: Prisma.ProfileChangeLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>
          }
          deleteMany: {
            args: Prisma.ProfileChangeLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProfileChangeLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProfileChangeLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>[]
          }
          upsert: {
            args: Prisma.ProfileChangeLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProfileChangeLogPayload>
          }
          aggregate: {
            args: Prisma.ProfileChangeLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProfileChangeLog>
          }
          groupBy: {
            args: Prisma.ProfileChangeLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProfileChangeLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProfileChangeLogCountArgs<ExtArgs>
            result: $Utils.Optional<ProfileChangeLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    profileChangeLog?: ProfileChangeLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model ProfileChangeLog
   */

  export type AggregateProfileChangeLog = {
    _count: ProfileChangeLogCountAggregateOutputType | null
    _min: ProfileChangeLogMinAggregateOutputType | null
    _max: ProfileChangeLogMaxAggregateOutputType | null
  }

  export type ProfileChangeLogMinAggregateOutputType = {
    id: string | null
    eventId: string | null
    employeeId: string | null
    employeeEmail: string | null
    employeeName: string | null
    actorId: string | null
    actorRole: $Enums.EmployeeRole | null
    occurredAt: Date | null
    ingestedAt: Date | null
  }

  export type ProfileChangeLogMaxAggregateOutputType = {
    id: string | null
    eventId: string | null
    employeeId: string | null
    employeeEmail: string | null
    employeeName: string | null
    actorId: string | null
    actorRole: $Enums.EmployeeRole | null
    occurredAt: Date | null
    ingestedAt: Date | null
  }

  export type ProfileChangeLogCountAggregateOutputType = {
    id: number
    eventId: number
    employeeId: number
    employeeEmail: number
    employeeName: number
    actorId: number
    actorRole: number
    changedFields: number
    beforeValues: number
    afterValues: number
    occurredAt: number
    ingestedAt: number
    _all: number
  }


  export type ProfileChangeLogMinAggregateInputType = {
    id?: true
    eventId?: true
    employeeId?: true
    employeeEmail?: true
    employeeName?: true
    actorId?: true
    actorRole?: true
    occurredAt?: true
    ingestedAt?: true
  }

  export type ProfileChangeLogMaxAggregateInputType = {
    id?: true
    eventId?: true
    employeeId?: true
    employeeEmail?: true
    employeeName?: true
    actorId?: true
    actorRole?: true
    occurredAt?: true
    ingestedAt?: true
  }

  export type ProfileChangeLogCountAggregateInputType = {
    id?: true
    eventId?: true
    employeeId?: true
    employeeEmail?: true
    employeeName?: true
    actorId?: true
    actorRole?: true
    changedFields?: true
    beforeValues?: true
    afterValues?: true
    occurredAt?: true
    ingestedAt?: true
    _all?: true
  }

  export type ProfileChangeLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProfileChangeLog to aggregate.
     */
    where?: ProfileChangeLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileChangeLogs to fetch.
     */
    orderBy?: ProfileChangeLogOrderByWithRelationInput | ProfileChangeLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProfileChangeLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileChangeLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileChangeLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProfileChangeLogs
    **/
    _count?: true | ProfileChangeLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProfileChangeLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProfileChangeLogMaxAggregateInputType
  }

  export type GetProfileChangeLogAggregateType<T extends ProfileChangeLogAggregateArgs> = {
        [P in keyof T & keyof AggregateProfileChangeLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProfileChangeLog[P]>
      : GetScalarType<T[P], AggregateProfileChangeLog[P]>
  }




  export type ProfileChangeLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProfileChangeLogWhereInput
    orderBy?: ProfileChangeLogOrderByWithAggregationInput | ProfileChangeLogOrderByWithAggregationInput[]
    by: ProfileChangeLogScalarFieldEnum[] | ProfileChangeLogScalarFieldEnum
    having?: ProfileChangeLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProfileChangeLogCountAggregateInputType | true
    _min?: ProfileChangeLogMinAggregateInputType
    _max?: ProfileChangeLogMaxAggregateInputType
  }

  export type ProfileChangeLogGroupByOutputType = {
    id: string
    eventId: string
    employeeId: string
    employeeEmail: string
    employeeName: string
    actorId: string
    actorRole: $Enums.EmployeeRole
    changedFields: string[]
    beforeValues: JsonValue | null
    afterValues: JsonValue | null
    occurredAt: Date
    ingestedAt: Date
    _count: ProfileChangeLogCountAggregateOutputType | null
    _min: ProfileChangeLogMinAggregateOutputType | null
    _max: ProfileChangeLogMaxAggregateOutputType | null
  }

  type GetProfileChangeLogGroupByPayload<T extends ProfileChangeLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProfileChangeLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProfileChangeLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProfileChangeLogGroupByOutputType[P]>
            : GetScalarType<T[P], ProfileChangeLogGroupByOutputType[P]>
        }
      >
    >


  export type ProfileChangeLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    employeeId?: boolean
    employeeEmail?: boolean
    employeeName?: boolean
    actorId?: boolean
    actorRole?: boolean
    changedFields?: boolean
    beforeValues?: boolean
    afterValues?: boolean
    occurredAt?: boolean
    ingestedAt?: boolean
  }, ExtArgs["result"]["profileChangeLog"]>

  export type ProfileChangeLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    employeeId?: boolean
    employeeEmail?: boolean
    employeeName?: boolean
    actorId?: boolean
    actorRole?: boolean
    changedFields?: boolean
    beforeValues?: boolean
    afterValues?: boolean
    occurredAt?: boolean
    ingestedAt?: boolean
  }, ExtArgs["result"]["profileChangeLog"]>

  export type ProfileChangeLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    eventId?: boolean
    employeeId?: boolean
    employeeEmail?: boolean
    employeeName?: boolean
    actorId?: boolean
    actorRole?: boolean
    changedFields?: boolean
    beforeValues?: boolean
    afterValues?: boolean
    occurredAt?: boolean
    ingestedAt?: boolean
  }, ExtArgs["result"]["profileChangeLog"]>

  export type ProfileChangeLogSelectScalar = {
    id?: boolean
    eventId?: boolean
    employeeId?: boolean
    employeeEmail?: boolean
    employeeName?: boolean
    actorId?: boolean
    actorRole?: boolean
    changedFields?: boolean
    beforeValues?: boolean
    afterValues?: boolean
    occurredAt?: boolean
    ingestedAt?: boolean
  }

  export type ProfileChangeLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "eventId" | "employeeId" | "employeeEmail" | "employeeName" | "actorId" | "actorRole" | "changedFields" | "beforeValues" | "afterValues" | "occurredAt" | "ingestedAt", ExtArgs["result"]["profileChangeLog"]>

  export type $ProfileChangeLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProfileChangeLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      eventId: string
      employeeId: string
      employeeEmail: string
      employeeName: string
      actorId: string
      actorRole: $Enums.EmployeeRole
      changedFields: string[]
      beforeValues: Prisma.JsonValue | null
      afterValues: Prisma.JsonValue | null
      occurredAt: Date
      ingestedAt: Date
    }, ExtArgs["result"]["profileChangeLog"]>
    composites: {}
  }

  type ProfileChangeLogGetPayload<S extends boolean | null | undefined | ProfileChangeLogDefaultArgs> = $Result.GetResult<Prisma.$ProfileChangeLogPayload, S>

  type ProfileChangeLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProfileChangeLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProfileChangeLogCountAggregateInputType | true
    }

  export interface ProfileChangeLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProfileChangeLog'], meta: { name: 'ProfileChangeLog' } }
    /**
     * Find zero or one ProfileChangeLog that matches the filter.
     * @param {ProfileChangeLogFindUniqueArgs} args - Arguments to find a ProfileChangeLog
     * @example
     * // Get one ProfileChangeLog
     * const profileChangeLog = await prisma.profileChangeLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProfileChangeLogFindUniqueArgs>(args: SelectSubset<T, ProfileChangeLogFindUniqueArgs<ExtArgs>>): Prisma__ProfileChangeLogClient<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ProfileChangeLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProfileChangeLogFindUniqueOrThrowArgs} args - Arguments to find a ProfileChangeLog
     * @example
     * // Get one ProfileChangeLog
     * const profileChangeLog = await prisma.profileChangeLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProfileChangeLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ProfileChangeLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProfileChangeLogClient<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProfileChangeLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileChangeLogFindFirstArgs} args - Arguments to find a ProfileChangeLog
     * @example
     * // Get one ProfileChangeLog
     * const profileChangeLog = await prisma.profileChangeLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProfileChangeLogFindFirstArgs>(args?: SelectSubset<T, ProfileChangeLogFindFirstArgs<ExtArgs>>): Prisma__ProfileChangeLogClient<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ProfileChangeLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileChangeLogFindFirstOrThrowArgs} args - Arguments to find a ProfileChangeLog
     * @example
     * // Get one ProfileChangeLog
     * const profileChangeLog = await prisma.profileChangeLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProfileChangeLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ProfileChangeLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProfileChangeLogClient<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ProfileChangeLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileChangeLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProfileChangeLogs
     * const profileChangeLogs = await prisma.profileChangeLog.findMany()
     * 
     * // Get first 10 ProfileChangeLogs
     * const profileChangeLogs = await prisma.profileChangeLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const profileChangeLogWithIdOnly = await prisma.profileChangeLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProfileChangeLogFindManyArgs>(args?: SelectSubset<T, ProfileChangeLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ProfileChangeLog.
     * @param {ProfileChangeLogCreateArgs} args - Arguments to create a ProfileChangeLog.
     * @example
     * // Create one ProfileChangeLog
     * const ProfileChangeLog = await prisma.profileChangeLog.create({
     *   data: {
     *     // ... data to create a ProfileChangeLog
     *   }
     * })
     * 
     */
    create<T extends ProfileChangeLogCreateArgs>(args: SelectSubset<T, ProfileChangeLogCreateArgs<ExtArgs>>): Prisma__ProfileChangeLogClient<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ProfileChangeLogs.
     * @param {ProfileChangeLogCreateManyArgs} args - Arguments to create many ProfileChangeLogs.
     * @example
     * // Create many ProfileChangeLogs
     * const profileChangeLog = await prisma.profileChangeLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProfileChangeLogCreateManyArgs>(args?: SelectSubset<T, ProfileChangeLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ProfileChangeLogs and returns the data saved in the database.
     * @param {ProfileChangeLogCreateManyAndReturnArgs} args - Arguments to create many ProfileChangeLogs.
     * @example
     * // Create many ProfileChangeLogs
     * const profileChangeLog = await prisma.profileChangeLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ProfileChangeLogs and only return the `id`
     * const profileChangeLogWithIdOnly = await prisma.profileChangeLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProfileChangeLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ProfileChangeLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ProfileChangeLog.
     * @param {ProfileChangeLogDeleteArgs} args - Arguments to delete one ProfileChangeLog.
     * @example
     * // Delete one ProfileChangeLog
     * const ProfileChangeLog = await prisma.profileChangeLog.delete({
     *   where: {
     *     // ... filter to delete one ProfileChangeLog
     *   }
     * })
     * 
     */
    delete<T extends ProfileChangeLogDeleteArgs>(args: SelectSubset<T, ProfileChangeLogDeleteArgs<ExtArgs>>): Prisma__ProfileChangeLogClient<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ProfileChangeLog.
     * @param {ProfileChangeLogUpdateArgs} args - Arguments to update one ProfileChangeLog.
     * @example
     * // Update one ProfileChangeLog
     * const profileChangeLog = await prisma.profileChangeLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProfileChangeLogUpdateArgs>(args: SelectSubset<T, ProfileChangeLogUpdateArgs<ExtArgs>>): Prisma__ProfileChangeLogClient<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ProfileChangeLogs.
     * @param {ProfileChangeLogDeleteManyArgs} args - Arguments to filter ProfileChangeLogs to delete.
     * @example
     * // Delete a few ProfileChangeLogs
     * const { count } = await prisma.profileChangeLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProfileChangeLogDeleteManyArgs>(args?: SelectSubset<T, ProfileChangeLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProfileChangeLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileChangeLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProfileChangeLogs
     * const profileChangeLog = await prisma.profileChangeLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProfileChangeLogUpdateManyArgs>(args: SelectSubset<T, ProfileChangeLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProfileChangeLogs and returns the data updated in the database.
     * @param {ProfileChangeLogUpdateManyAndReturnArgs} args - Arguments to update many ProfileChangeLogs.
     * @example
     * // Update many ProfileChangeLogs
     * const profileChangeLog = await prisma.profileChangeLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ProfileChangeLogs and only return the `id`
     * const profileChangeLogWithIdOnly = await prisma.profileChangeLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProfileChangeLogUpdateManyAndReturnArgs>(args: SelectSubset<T, ProfileChangeLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ProfileChangeLog.
     * @param {ProfileChangeLogUpsertArgs} args - Arguments to update or create a ProfileChangeLog.
     * @example
     * // Update or create a ProfileChangeLog
     * const profileChangeLog = await prisma.profileChangeLog.upsert({
     *   create: {
     *     // ... data to create a ProfileChangeLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProfileChangeLog we want to update
     *   }
     * })
     */
    upsert<T extends ProfileChangeLogUpsertArgs>(args: SelectSubset<T, ProfileChangeLogUpsertArgs<ExtArgs>>): Prisma__ProfileChangeLogClient<$Result.GetResult<Prisma.$ProfileChangeLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ProfileChangeLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileChangeLogCountArgs} args - Arguments to filter ProfileChangeLogs to count.
     * @example
     * // Count the number of ProfileChangeLogs
     * const count = await prisma.profileChangeLog.count({
     *   where: {
     *     // ... the filter for the ProfileChangeLogs we want to count
     *   }
     * })
    **/
    count<T extends ProfileChangeLogCountArgs>(
      args?: Subset<T, ProfileChangeLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProfileChangeLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProfileChangeLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileChangeLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProfileChangeLogAggregateArgs>(args: Subset<T, ProfileChangeLogAggregateArgs>): Prisma.PrismaPromise<GetProfileChangeLogAggregateType<T>>

    /**
     * Group by ProfileChangeLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProfileChangeLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProfileChangeLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProfileChangeLogGroupByArgs['orderBy'] }
        : { orderBy?: ProfileChangeLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProfileChangeLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProfileChangeLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProfileChangeLog model
   */
  readonly fields: ProfileChangeLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProfileChangeLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProfileChangeLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ProfileChangeLog model
   */
  interface ProfileChangeLogFieldRefs {
    readonly id: FieldRef<"ProfileChangeLog", 'String'>
    readonly eventId: FieldRef<"ProfileChangeLog", 'String'>
    readonly employeeId: FieldRef<"ProfileChangeLog", 'String'>
    readonly employeeEmail: FieldRef<"ProfileChangeLog", 'String'>
    readonly employeeName: FieldRef<"ProfileChangeLog", 'String'>
    readonly actorId: FieldRef<"ProfileChangeLog", 'String'>
    readonly actorRole: FieldRef<"ProfileChangeLog", 'EmployeeRole'>
    readonly changedFields: FieldRef<"ProfileChangeLog", 'String[]'>
    readonly beforeValues: FieldRef<"ProfileChangeLog", 'Json'>
    readonly afterValues: FieldRef<"ProfileChangeLog", 'Json'>
    readonly occurredAt: FieldRef<"ProfileChangeLog", 'DateTime'>
    readonly ingestedAt: FieldRef<"ProfileChangeLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProfileChangeLog findUnique
   */
  export type ProfileChangeLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * Filter, which ProfileChangeLog to fetch.
     */
    where: ProfileChangeLogWhereUniqueInput
  }

  /**
   * ProfileChangeLog findUniqueOrThrow
   */
  export type ProfileChangeLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * Filter, which ProfileChangeLog to fetch.
     */
    where: ProfileChangeLogWhereUniqueInput
  }

  /**
   * ProfileChangeLog findFirst
   */
  export type ProfileChangeLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * Filter, which ProfileChangeLog to fetch.
     */
    where?: ProfileChangeLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileChangeLogs to fetch.
     */
    orderBy?: ProfileChangeLogOrderByWithRelationInput | ProfileChangeLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProfileChangeLogs.
     */
    cursor?: ProfileChangeLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileChangeLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileChangeLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProfileChangeLogs.
     */
    distinct?: ProfileChangeLogScalarFieldEnum | ProfileChangeLogScalarFieldEnum[]
  }

  /**
   * ProfileChangeLog findFirstOrThrow
   */
  export type ProfileChangeLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * Filter, which ProfileChangeLog to fetch.
     */
    where?: ProfileChangeLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileChangeLogs to fetch.
     */
    orderBy?: ProfileChangeLogOrderByWithRelationInput | ProfileChangeLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProfileChangeLogs.
     */
    cursor?: ProfileChangeLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileChangeLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileChangeLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProfileChangeLogs.
     */
    distinct?: ProfileChangeLogScalarFieldEnum | ProfileChangeLogScalarFieldEnum[]
  }

  /**
   * ProfileChangeLog findMany
   */
  export type ProfileChangeLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * Filter, which ProfileChangeLogs to fetch.
     */
    where?: ProfileChangeLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProfileChangeLogs to fetch.
     */
    orderBy?: ProfileChangeLogOrderByWithRelationInput | ProfileChangeLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProfileChangeLogs.
     */
    cursor?: ProfileChangeLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProfileChangeLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProfileChangeLogs.
     */
    skip?: number
    distinct?: ProfileChangeLogScalarFieldEnum | ProfileChangeLogScalarFieldEnum[]
  }

  /**
   * ProfileChangeLog create
   */
  export type ProfileChangeLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * The data needed to create a ProfileChangeLog.
     */
    data: XOR<ProfileChangeLogCreateInput, ProfileChangeLogUncheckedCreateInput>
  }

  /**
   * ProfileChangeLog createMany
   */
  export type ProfileChangeLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProfileChangeLogs.
     */
    data: ProfileChangeLogCreateManyInput | ProfileChangeLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProfileChangeLog createManyAndReturn
   */
  export type ProfileChangeLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * The data used to create many ProfileChangeLogs.
     */
    data: ProfileChangeLogCreateManyInput | ProfileChangeLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProfileChangeLog update
   */
  export type ProfileChangeLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * The data needed to update a ProfileChangeLog.
     */
    data: XOR<ProfileChangeLogUpdateInput, ProfileChangeLogUncheckedUpdateInput>
    /**
     * Choose, which ProfileChangeLog to update.
     */
    where: ProfileChangeLogWhereUniqueInput
  }

  /**
   * ProfileChangeLog updateMany
   */
  export type ProfileChangeLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProfileChangeLogs.
     */
    data: XOR<ProfileChangeLogUpdateManyMutationInput, ProfileChangeLogUncheckedUpdateManyInput>
    /**
     * Filter which ProfileChangeLogs to update
     */
    where?: ProfileChangeLogWhereInput
    /**
     * Limit how many ProfileChangeLogs to update.
     */
    limit?: number
  }

  /**
   * ProfileChangeLog updateManyAndReturn
   */
  export type ProfileChangeLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * The data used to update ProfileChangeLogs.
     */
    data: XOR<ProfileChangeLogUpdateManyMutationInput, ProfileChangeLogUncheckedUpdateManyInput>
    /**
     * Filter which ProfileChangeLogs to update
     */
    where?: ProfileChangeLogWhereInput
    /**
     * Limit how many ProfileChangeLogs to update.
     */
    limit?: number
  }

  /**
   * ProfileChangeLog upsert
   */
  export type ProfileChangeLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * The filter to search for the ProfileChangeLog to update in case it exists.
     */
    where: ProfileChangeLogWhereUniqueInput
    /**
     * In case the ProfileChangeLog found by the `where` argument doesn't exist, create a new ProfileChangeLog with this data.
     */
    create: XOR<ProfileChangeLogCreateInput, ProfileChangeLogUncheckedCreateInput>
    /**
     * In case the ProfileChangeLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProfileChangeLogUpdateInput, ProfileChangeLogUncheckedUpdateInput>
  }

  /**
   * ProfileChangeLog delete
   */
  export type ProfileChangeLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
    /**
     * Filter which ProfileChangeLog to delete.
     */
    where: ProfileChangeLogWhereUniqueInput
  }

  /**
   * ProfileChangeLog deleteMany
   */
  export type ProfileChangeLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProfileChangeLogs to delete
     */
    where?: ProfileChangeLogWhereInput
    /**
     * Limit how many ProfileChangeLogs to delete.
     */
    limit?: number
  }

  /**
   * ProfileChangeLog without action
   */
  export type ProfileChangeLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProfileChangeLog
     */
    select?: ProfileChangeLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ProfileChangeLog
     */
    omit?: ProfileChangeLogOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ProfileChangeLogScalarFieldEnum: {
    id: 'id',
    eventId: 'eventId',
    employeeId: 'employeeId',
    employeeEmail: 'employeeEmail',
    employeeName: 'employeeName',
    actorId: 'actorId',
    actorRole: 'actorRole',
    changedFields: 'changedFields',
    beforeValues: 'beforeValues',
    afterValues: 'afterValues',
    occurredAt: 'occurredAt',
    ingestedAt: 'ingestedAt'
  };

  export type ProfileChangeLogScalarFieldEnum = (typeof ProfileChangeLogScalarFieldEnum)[keyof typeof ProfileChangeLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'EmployeeRole'
   */
  export type EnumEmployeeRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EmployeeRole'>
    


  /**
   * Reference to a field of type 'EmployeeRole[]'
   */
  export type ListEnumEmployeeRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EmployeeRole[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type ProfileChangeLogWhereInput = {
    AND?: ProfileChangeLogWhereInput | ProfileChangeLogWhereInput[]
    OR?: ProfileChangeLogWhereInput[]
    NOT?: ProfileChangeLogWhereInput | ProfileChangeLogWhereInput[]
    id?: UuidFilter<"ProfileChangeLog"> | string
    eventId?: UuidFilter<"ProfileChangeLog"> | string
    employeeId?: UuidFilter<"ProfileChangeLog"> | string
    employeeEmail?: StringFilter<"ProfileChangeLog"> | string
    employeeName?: StringFilter<"ProfileChangeLog"> | string
    actorId?: UuidFilter<"ProfileChangeLog"> | string
    actorRole?: EnumEmployeeRoleFilter<"ProfileChangeLog"> | $Enums.EmployeeRole
    changedFields?: StringNullableListFilter<"ProfileChangeLog">
    beforeValues?: JsonNullableFilter<"ProfileChangeLog">
    afterValues?: JsonNullableFilter<"ProfileChangeLog">
    occurredAt?: DateTimeFilter<"ProfileChangeLog"> | Date | string
    ingestedAt?: DateTimeFilter<"ProfileChangeLog"> | Date | string
  }

  export type ProfileChangeLogOrderByWithRelationInput = {
    id?: SortOrder
    eventId?: SortOrder
    employeeId?: SortOrder
    employeeEmail?: SortOrder
    employeeName?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    changedFields?: SortOrder
    beforeValues?: SortOrderInput | SortOrder
    afterValues?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    ingestedAt?: SortOrder
  }

  export type ProfileChangeLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    eventId?: string
    AND?: ProfileChangeLogWhereInput | ProfileChangeLogWhereInput[]
    OR?: ProfileChangeLogWhereInput[]
    NOT?: ProfileChangeLogWhereInput | ProfileChangeLogWhereInput[]
    employeeId?: UuidFilter<"ProfileChangeLog"> | string
    employeeEmail?: StringFilter<"ProfileChangeLog"> | string
    employeeName?: StringFilter<"ProfileChangeLog"> | string
    actorId?: UuidFilter<"ProfileChangeLog"> | string
    actorRole?: EnumEmployeeRoleFilter<"ProfileChangeLog"> | $Enums.EmployeeRole
    changedFields?: StringNullableListFilter<"ProfileChangeLog">
    beforeValues?: JsonNullableFilter<"ProfileChangeLog">
    afterValues?: JsonNullableFilter<"ProfileChangeLog">
    occurredAt?: DateTimeFilter<"ProfileChangeLog"> | Date | string
    ingestedAt?: DateTimeFilter<"ProfileChangeLog"> | Date | string
  }, "id" | "eventId">

  export type ProfileChangeLogOrderByWithAggregationInput = {
    id?: SortOrder
    eventId?: SortOrder
    employeeId?: SortOrder
    employeeEmail?: SortOrder
    employeeName?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    changedFields?: SortOrder
    beforeValues?: SortOrderInput | SortOrder
    afterValues?: SortOrderInput | SortOrder
    occurredAt?: SortOrder
    ingestedAt?: SortOrder
    _count?: ProfileChangeLogCountOrderByAggregateInput
    _max?: ProfileChangeLogMaxOrderByAggregateInput
    _min?: ProfileChangeLogMinOrderByAggregateInput
  }

  export type ProfileChangeLogScalarWhereWithAggregatesInput = {
    AND?: ProfileChangeLogScalarWhereWithAggregatesInput | ProfileChangeLogScalarWhereWithAggregatesInput[]
    OR?: ProfileChangeLogScalarWhereWithAggregatesInput[]
    NOT?: ProfileChangeLogScalarWhereWithAggregatesInput | ProfileChangeLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ProfileChangeLog"> | string
    eventId?: UuidWithAggregatesFilter<"ProfileChangeLog"> | string
    employeeId?: UuidWithAggregatesFilter<"ProfileChangeLog"> | string
    employeeEmail?: StringWithAggregatesFilter<"ProfileChangeLog"> | string
    employeeName?: StringWithAggregatesFilter<"ProfileChangeLog"> | string
    actorId?: UuidWithAggregatesFilter<"ProfileChangeLog"> | string
    actorRole?: EnumEmployeeRoleWithAggregatesFilter<"ProfileChangeLog"> | $Enums.EmployeeRole
    changedFields?: StringNullableListFilter<"ProfileChangeLog">
    beforeValues?: JsonNullableWithAggregatesFilter<"ProfileChangeLog">
    afterValues?: JsonNullableWithAggregatesFilter<"ProfileChangeLog">
    occurredAt?: DateTimeWithAggregatesFilter<"ProfileChangeLog"> | Date | string
    ingestedAt?: DateTimeWithAggregatesFilter<"ProfileChangeLog"> | Date | string
  }

  export type ProfileChangeLogCreateInput = {
    id?: string
    eventId: string
    employeeId: string
    employeeEmail: string
    employeeName: string
    actorId: string
    actorRole: $Enums.EmployeeRole
    changedFields?: ProfileChangeLogCreatechangedFieldsInput | string[]
    beforeValues?: NullableJsonNullValueInput | InputJsonValue
    afterValues?: NullableJsonNullValueInput | InputJsonValue
    occurredAt: Date | string
    ingestedAt?: Date | string
  }

  export type ProfileChangeLogUncheckedCreateInput = {
    id?: string
    eventId: string
    employeeId: string
    employeeEmail: string
    employeeName: string
    actorId: string
    actorRole: $Enums.EmployeeRole
    changedFields?: ProfileChangeLogCreatechangedFieldsInput | string[]
    beforeValues?: NullableJsonNullValueInput | InputJsonValue
    afterValues?: NullableJsonNullValueInput | InputJsonValue
    occurredAt: Date | string
    ingestedAt?: Date | string
  }

  export type ProfileChangeLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    employeeEmail?: StringFieldUpdateOperationsInput | string
    employeeName?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    actorRole?: EnumEmployeeRoleFieldUpdateOperationsInput | $Enums.EmployeeRole
    changedFields?: ProfileChangeLogUpdatechangedFieldsInput | string[]
    beforeValues?: NullableJsonNullValueInput | InputJsonValue
    afterValues?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileChangeLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    employeeEmail?: StringFieldUpdateOperationsInput | string
    employeeName?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    actorRole?: EnumEmployeeRoleFieldUpdateOperationsInput | $Enums.EmployeeRole
    changedFields?: ProfileChangeLogUpdatechangedFieldsInput | string[]
    beforeValues?: NullableJsonNullValueInput | InputJsonValue
    afterValues?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileChangeLogCreateManyInput = {
    id?: string
    eventId: string
    employeeId: string
    employeeEmail: string
    employeeName: string
    actorId: string
    actorRole: $Enums.EmployeeRole
    changedFields?: ProfileChangeLogCreatechangedFieldsInput | string[]
    beforeValues?: NullableJsonNullValueInput | InputJsonValue
    afterValues?: NullableJsonNullValueInput | InputJsonValue
    occurredAt: Date | string
    ingestedAt?: Date | string
  }

  export type ProfileChangeLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    employeeEmail?: StringFieldUpdateOperationsInput | string
    employeeName?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    actorRole?: EnumEmployeeRoleFieldUpdateOperationsInput | $Enums.EmployeeRole
    changedFields?: ProfileChangeLogUpdatechangedFieldsInput | string[]
    beforeValues?: NullableJsonNullValueInput | InputJsonValue
    afterValues?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProfileChangeLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    eventId?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    employeeEmail?: StringFieldUpdateOperationsInput | string
    employeeName?: StringFieldUpdateOperationsInput | string
    actorId?: StringFieldUpdateOperationsInput | string
    actorRole?: EnumEmployeeRoleFieldUpdateOperationsInput | $Enums.EmployeeRole
    changedFields?: ProfileChangeLogUpdatechangedFieldsInput | string[]
    beforeValues?: NullableJsonNullValueInput | InputJsonValue
    afterValues?: NullableJsonNullValueInput | InputJsonValue
    occurredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumEmployeeRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.EmployeeRole | EnumEmployeeRoleFieldRefInput<$PrismaModel>
    in?: $Enums.EmployeeRole[] | ListEnumEmployeeRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmployeeRole[] | ListEnumEmployeeRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumEmployeeRoleFilter<$PrismaModel> | $Enums.EmployeeRole
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProfileChangeLogCountOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    employeeId?: SortOrder
    employeeEmail?: SortOrder
    employeeName?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    changedFields?: SortOrder
    beforeValues?: SortOrder
    afterValues?: SortOrder
    occurredAt?: SortOrder
    ingestedAt?: SortOrder
  }

  export type ProfileChangeLogMaxOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    employeeId?: SortOrder
    employeeEmail?: SortOrder
    employeeName?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    occurredAt?: SortOrder
    ingestedAt?: SortOrder
  }

  export type ProfileChangeLogMinOrderByAggregateInput = {
    id?: SortOrder
    eventId?: SortOrder
    employeeId?: SortOrder
    employeeEmail?: SortOrder
    employeeName?: SortOrder
    actorId?: SortOrder
    actorRole?: SortOrder
    occurredAt?: SortOrder
    ingestedAt?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumEmployeeRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EmployeeRole | EnumEmployeeRoleFieldRefInput<$PrismaModel>
    in?: $Enums.EmployeeRole[] | ListEnumEmployeeRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmployeeRole[] | ListEnumEmployeeRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumEmployeeRoleWithAggregatesFilter<$PrismaModel> | $Enums.EmployeeRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEmployeeRoleFilter<$PrismaModel>
    _max?: NestedEnumEmployeeRoleFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type ProfileChangeLogCreatechangedFieldsInput = {
    set: string[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumEmployeeRoleFieldUpdateOperationsInput = {
    set?: $Enums.EmployeeRole
  }

  export type ProfileChangeLogUpdatechangedFieldsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumEmployeeRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.EmployeeRole | EnumEmployeeRoleFieldRefInput<$PrismaModel>
    in?: $Enums.EmployeeRole[] | ListEnumEmployeeRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmployeeRole[] | ListEnumEmployeeRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumEmployeeRoleFilter<$PrismaModel> | $Enums.EmployeeRole
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumEmployeeRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EmployeeRole | EnumEmployeeRoleFieldRefInput<$PrismaModel>
    in?: $Enums.EmployeeRole[] | ListEnumEmployeeRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmployeeRole[] | ListEnumEmployeeRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumEmployeeRoleWithAggregatesFilter<$PrismaModel> | $Enums.EmployeeRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEmployeeRoleFilter<$PrismaModel>
    _max?: NestedEnumEmployeeRoleFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}