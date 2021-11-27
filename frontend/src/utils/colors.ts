import { schema } from 'src/types/schema_override'

const LIGHT_BLUE = 'rgb(78, 197, 241)'
const LIGHT_GREEN = 'rgb(13, 242, 200)'
const LIGHT_ORANGE = 'rgb(192, 114, 218)'
const LIGHT_GREY = 'rgb(186, 181, 181)'

type RoleColors = {
  [key in schema['Role']]: string
}

export const ROLE_COLORS: RoleColors = {
  user: LIGHT_BLUE,
  manager: LIGHT_GREEN,
  admin: LIGHT_ORANGE,
}

export const getColorForRole = (role: schema['Role']) => {
  return ROLE_COLORS[role]
}
