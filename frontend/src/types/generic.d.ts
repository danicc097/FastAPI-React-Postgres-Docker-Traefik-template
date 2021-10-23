/**
 * Generic object ``{}`` type
 */
interface GenObjType<TValue> {
  [key: string]: TValue
}

/**
 * Returns the type of the elements in an array or tuple
 * @example ArrayElement<MyArrayType>
 */
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never
