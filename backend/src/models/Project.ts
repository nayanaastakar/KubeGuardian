import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  name: string
  description?: string
  environment: 'production' | 'staging' | 'development' | 'testing'
  status: 'active' | 'inactive' | 'archived'
  repository?: string
  team?: string
  tags: string[]
  securityScore?: number
  totalVulnerabilities?: number
  criticalVulnerabilities?: number
  complianceScore?: number
  clusterCount?: number
  createdBy: mongoose.Types.ObjectId
  lastScanned?: Date
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    environment: {
      type: String,
      enum: ['production', 'staging', 'development', 'testing'],
      default: 'development',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    repository: { type: String, trim: true },
    team: { type: String, trim: true },
    tags: [{ type: String }],
    securityScore: { type: Number, default: 0 },
    totalVulnerabilities: { type: Number, default: 0 },
    criticalVulnerabilities: { type: Number, default: 0 },
    complianceScore: { type: Number, default: 0 },
    clusterCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastScanned: { type: Date },
  },
  { timestamps: true }
)

export const Project = mongoose.model<IProject>('Project', ProjectSchema)
