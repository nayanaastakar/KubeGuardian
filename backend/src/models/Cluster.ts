import mongoose, { Schema, Document } from 'mongoose'

export interface ICluster extends Document {
  name: string
  apiUrl: string
  token: string
  status: 'healthy' | 'warning' | 'error' | 'disconnected'
  version?: string
  nodeCount?: number
  podCount?: number
  cpuUsage?: number
  memoryUsage?: number
  lastSync?: Date
  createdBy: mongoose.Types.ObjectId
}

const ClusterSchema: Schema = new Schema({
  name: { type: String, required: true },
  apiUrl: { type: String, required: true },
  token: { type: String, required: true },
  status: { type: String, enum: ['healthy', 'warning', 'error', 'disconnected'], default: 'disconnected' },
  version: { type: String },
  nodeCount: { type: Number, default: 0 },
  podCount: { type: Number, default: 0 },
  cpuUsage: { type: Number, default: 0 },
  memoryUsage: { type: Number, default: 0 },
  lastSync: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
})

export const Cluster = mongoose.model<ICluster>('Cluster', ClusterSchema)
