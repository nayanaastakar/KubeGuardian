import mongoose, { Document, Schema } from 'mongoose'

export interface IAuditLog extends Document {
  action: string
  category: 'security' | 'remediation' | 'rbac' | 'system' | 'auth'
  actor: string
  target: string
  details: Record<string, any>
  status: 'success' | 'failure' | 'warning'
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['security', 'remediation', 'rbac', 'system', 'auth'],
    required: true
  },
  actor: {
    type: String,
    required: true,
    default: 'system'
  },
  target: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
})

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
