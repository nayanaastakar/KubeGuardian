import mongoose, { Document, Schema } from 'mongoose'

export interface IAlert extends Document {
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'active' | 'acknowledged' | 'resolved'
  clusterId: string
  namespace?: string
  source: string
  labels: Record<string, string>
  createdAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  createdBy?: string
}

const AlertSchema = new Schema<IAlert>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  clusterId: {
    type: Schema.Types.ObjectId as any,
    ref: 'Cluster',
    required: true
  },
  namespace: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  labels: {
    type: Map,
    of: String,
    default: new Map()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId as any,
    ref: 'User'
  }
}, {
  timestamps: true
})

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema)
