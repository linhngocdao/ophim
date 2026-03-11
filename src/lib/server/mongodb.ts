import { Db, MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'ULTIMATE_store'

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable')
}

type MongoGlobal = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

const globalForMongo = globalThis as MongoGlobal

const mongoClientPromise =
  globalForMongo._mongoClientPromise ?? new MongoClient(MONGODB_URI).connect()

if (process.env.NODE_ENV !== 'production') {
  globalForMongo._mongoClientPromise = mongoClientPromise
}

export async function getMongoDb(): Promise<Db> {
  const client = await mongoClientPromise
  return client.db(MONGODB_DB_NAME)
}
