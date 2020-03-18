// Note the filter object has entries for value, values and range. this is purely for JSON persistance purposes
// ideally this would be a discriminated union. Only one is intended to be used per filter. Unused entries should
// be left undefined
export interface FilterDescriptor2 {
  value: any
  values: any[],
  range: RangeData<any>
  field: string,
}

export interface RangeData<TType> {
  from: TType,
  to: TType
}