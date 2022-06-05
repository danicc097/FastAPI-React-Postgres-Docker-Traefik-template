declare module '*.json' {
  const value: any
  export default value
}

declare type TimeLog = {
  Date: string
  Description: string
  Engineer: string
  FinishDate: string
  HoursSpent: number
  Ref: string
  Scope: string
  StartDate: string
  Status: string
  TaskType: string
  Title: string
  WeekNumber: string
}

declare type Closed = {
  AircraftProgram: string
  BudgetedHours: string
  CheckerID: string
  CloseDate: string
  CloseDateUTC: string
  ClosureComments: string
  Complexity: string
  ConsumedHours: string
  DID: string
  DeliveryDate: string
  DeliveryDateUTC: string
  DeliveryType: string
  Description: string
  InDate: string
  InDateLi: string
  InDateLiUTC: string
  InDateUTC: string
  InvoiceStatus: string
  KPIGroupingID: string
  Line: string
  Month: string
  NumberUFP: number
  OTD: string
  PerimeterCode: string
  PreparerID: string
  RFT: string
  Reference: string
  Status: string
  Support: string
  Tags: string
  TargetDate: string
  TargetDateTimeUTC: string
  UFP: string
  Year: string
}
