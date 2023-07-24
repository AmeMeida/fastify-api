import { z, ZodTypeAny } from "zod"
import {Type} from "@sinclair/typebox"

const schema = Type.Union([
  Type.String({
    minLength: 3,
  }),
  Type.Number(),
  Type.Literal("hi")
])

console.log(schema)
