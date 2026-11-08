import mongoose, { Document, Schema } from 'mongoose'

export type RemediationAction = 
  | 'restart_pod' 
  | 'rollout_restart' 
  | 'apply_network_policy' 
  | 'patch_security_context' 
  | 'scale_replicas' 
  | 'patch_resource_limits' 
  | 'update_image'

export type RemediationRisk = 'low' | 'medium' | 'high' | 'critical'
export type RemediationStatus = 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'failed' | 'rolled_back'

export interface IRemediation extends Document {
  remediationId: string
  title: string
  description: string
  targetNamespace: string
  targetResource: string
  targetKind: 'Pod' | 'Deployment' | 'NetworkPolicy' | 'Role' | 'RoleBinding' | 'ServiceAccount'
  action: RemediationAction
  riskLevel: RemediationRisk
  status: RemediationStatus
  dryRunDiff: string
  rollbackPlan: string
  requestedBy: string
  approvedBy?: string
  rejectedReason?: string
  executionResult?: string
  alertId?: string
  vulnerabilityId?: string
  executedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const RemediationSchema = new Schema<IRemediation>({
  remediationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  targetNamespace: {
    type: String,
    required: true,
    default: 'default'
  },
  targetResource: {
    type: String,
    required: true
  },
  targetKind: {
    type: String,
    enum: ['Pod', 'Deployment', 'NetworkPolicy', 'Role', 'RoleBinding', 'ServiceAccount'],
    required: true
  },
  action: {
    type: String,
    enum: [
      'restart_pod',
      'rollout_restart',
      'apply_network_policy',
      'patch_security_context',
      'scale_replicas',
      'patch_resource_limits',
      'update_image'
    ],
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending_approval', 'approved', 'rejected', 'executed', 'failed', 'rolled_back'],
    default: 'pending_approval'
  },
  dryRunDiff: {
    type: String,
    default: ''
  },
  rollbackPlan: {
    type: String,
    default: ''
  },
  requestedBy: {
    type: String,
    default: 'KubeGuardian AI Engine'
  },
  approvedBy: {
    type: String
  },
  rejectedReason: {
    type: String
  },
  executionResult: {
    type: String
  },
  alertId: {
    type: String
  },
  vulnerabilityId: {
    type: String
  },
  executedAt: {
    type: Date
  }
}, {
  timestamps: true
})

export const Remediation = mongoose.model<IRemediation>('Remediation', RemediationSchema)
