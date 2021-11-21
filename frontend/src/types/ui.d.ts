/**
 * Generic error object for all forms in the application.
 */
type FormErrors<Form> = Partial<
  {
    [key in keyof Form]: string | boolean
  } & {
    form: string
  }
>
