import {definitions} from './definitions'
import {documents} from './documents'
import {blocks} from './blocks'

// Creating a new constant 'schemaTypes' which is a copy of the 'documents' array
export const schemaTypes = [...definitions, ...documents, ...blocks]

// Creating a new constant 'schemaNames' which is an array of the names extracted from the 'documents' array
export const schemaNames = [...documents.map((doc) => doc.name)]

// Defining a new type 'SchemaType' which is a union of all the types inthe 'schemaNames' array
export type SchemaType = (typeof schemaNames)[number]

// Exporting the 'schemaTypes' constant as the default export of this module
export default schemaTypes
