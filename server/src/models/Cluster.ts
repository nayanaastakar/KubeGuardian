import mongoose, { Document, Schema } from 'mongoose'

export interface ICluster extends Document {
  name: string
  endpoint: string
  version: string
  status: 'healthy' | 'unhealthy' | 'connecting' | 'disconnected'
  nodeCount: number
  namespaceCount: number
  podCount: number
  kubeconfig?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const ClusterSchema = new Schema<ICluster>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  endpoint: {
    type: String,
    required: true,
    trim: true
  },
  version: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['healthy', 'unhealthy', 'connecting', 'disconnected'],
    default: 'disconnected'
  },
  nodeCount: {
    type: Number,
    default: 0
  },
  namespaceCount: {
    type: Number,
    default: 0
  },
  podCount: {
    type: Number,
    default: 0
  },
  kubeconfig: {
    type: String,
    select: false // Don't return sensitive data by default
  },
  createdBy: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export const Cluster = mongoose.model<ICluster>('Cluster', ClusterSchema)
