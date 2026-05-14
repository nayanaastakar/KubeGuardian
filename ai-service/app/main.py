from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import logging
from datetime import datetime
import json
import asyncio
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    role: str = "assistant"
    content: str
    timestamp: str
    confidence: float
    user_id: Optional[str] = None

class LogAnalysisRequest(BaseModel):
    logs: str
    log_type: Optional[str] = "application"
    cluster_id: Optional[str] = None

class LogAnalysisResponse(BaseModel):
    summary: str
    root_cause: str
    recommendations: List[str]
    confidence: float
    analyzed_at: str
    cluster_id: Optional[str] = None
    log_type: str
    severity: str

class SecurityAnalysisRequest(BaseModel):
    cluster_id: str
    scan_results: Optional[Dict[str, int]] = None

class SecurityAnalysisResponse(BaseModel):
    cluster_id: str
    risk_score: int
    critical_issues: int
    high_issues: int
    medium_issues: int
    low_issues: int
    recommendations: List[str]
    analyzed_at: str

class AIInsightsRequest(BaseModel):
    cluster_id: Optional[str] = None
    time_range: Optional[str] = "24h"

class AIInsightsResponse(BaseModel):
    cluster_id: Optional[str]
    time_range: str
    anomalies: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    generated_at: str

# AI Service functions
async def analyze_logs_with_ai(logs: str, log_type: str = "application") -> Dict[str, Any]:
    """Mock AI log analysis - would integrate with OpenAI/LLM in production"""
    await asyncio.sleep(0.1)  # Simulate AI processing
    
    # Mock analysis based on log content
    if "error" in logs.lower() or "failed" in logs.lower():
        return {
            "summary": "Critical errors detected in application logs",
            "root_cause": "Database connection failures and memory leaks",
            "recommendations": [
                "Increase database connection pool size",
                "Add connection timeout configuration",
                "Implement retry logic for failed connections",
                "Investigate memory leak in pod xyz-123",
                "Consider adding memory limits to prevent OOM kills"
            ],
            "confidence": 0.92,
            "severity": "high"
        }
    elif "warning" in logs.lower():
        return {
            "summary": "Performance warnings detected",
            "root_cause": "Resource contention and slow queries",
            "recommendations": [
                "Optimize database queries",
                "Add caching layer",
                "Scale resources appropriately"
            ],
            "confidence": 0.78,
            "severity": "medium"
        }
    else:
        return {
            "summary": "System operating normally",
            "root_cause": "No issues detected",
            "recommendations": [
                "Continue monitoring",
                "Maintain current configuration"
            ],
            "confidence": 0.85,
            "severity": "low"
        }

async def chat_with_ai(message: str, context: Optional[Dict] = None) -> Dict[str, Any]:
    """Mock AI chat response - simulating a Senior DevSecOps Engineer"""
    await asyncio.sleep(0.5)  # Simulate deeper AI processing
    
    msg = message.lower()
    
    # Generate contextual response based on message content
    if "kubernetes" in msg or "k8s" in msg:
        response = """I've analyzed your request regarding Kubernetes. For optimal cluster stability and security, you should follow these engineering steps:

1. **Resource Quotas:** Implement 'ResourceQuotas' and 'LimitRanges' in each namespace to prevent noisy neighbor issues.
2. **Network Segmentation:** Use 'NetworkPolicies' to enforce a default-deny ingress/egress policy, allowing only required traffic.
3. **Control Plane Security:** Ensure 'RBAC' is strictly configured and the API server is not publicly exposed without a VPN or Cloud Armor.

Would you like me to generate a baseline security manifest for your cluster?"""
    elif "security" in msg or "vulnerability" in msg or "cve" in msg:
        response = """Regarding security and CVE remediation: 

My current analysis shows that 40% of your container images are using 'latest' tags, which is a high-risk practice.

**Engineering Fixes:**
- **Pinned Versions:** Switch to SHA256 digests or specific version tags in your manifests.
- **Scanning:** Integrate 'Trivy' or 'Grype' into your CI/CD pipeline to block builds with critical vulnerabilities.
- **Runtime:** Enable 'eBPF' based runtime monitoring to detect suspicious syscalls that might exploit unknown zero-days.

I can help you prioritize your current backlog of 15 critical vulnerabilities. Where should we start?"""
    elif "deploy" in msg or "ci/cd" in msg:
        response = """For your CI/CD workflow, I recommend moving towards a GitOps model using ArgoCD or Flux.

**DevSecOps Pipeline Enhancements:**
- **SAST:** Add 'Semgrep' for static analysis of your Go/Python/TS code.
- **SCA:** Use 'Snyk' or 'GitHub Advanced Security' for dependency checking.
- **Attestation:** Implement 'Cosign' to sign your images and verify them at admission time in Kubernetes.

I've detected that your current Jenkins pipeline lacks a 'Vulnerability Gate'. Shall I provide the script to add one?"""
    else:
        response = f"""As your AI DevSecOps Engineer, I've analyzed your query: '{message}'.

To provide the best engineering solution, I'd recommend reviewing your cluster's 'Kube-Audit' logs and 'Prometheus' metrics. Based on the patterns I see, there's a potential for optimizing your pod anti-affinity rules to improve high availability during node maintenance.

Is there a particular service or infrastructure component you're concerned about?"""
    
    return {
        "content": response,
        "confidence": 0.98
    }

async def generate_security_insights(cluster_id: str, scan_results: Optional[Dict] = None) -> Dict[str, Any]:
    """Generate AI-powered security insights"""
    await asyncio.sleep(0.1)  # Simulate AI processing
    
    # Mock risk assessment
    critical_issues = scan_results.get("critical", 2) if scan_results else 2
    high_issues = scan_results.get("high", 8) if scan_results else 8
    medium_issues = scan_results.get("medium", 15) if scan_results else 15
    low_issues = scan_results.get("low", 23) if scan_results else 23
    
    risk_score = min(100, (critical_issues * 10 + high_issues * 5 + medium_issues * 2 + low_issues * 1))
    
    return {
        "risk_score": risk_score,
        "critical_issues": critical_issues,
        "high_issues": high_issues,
        "medium_issues": medium_issues,
        "low_issues": low_issues,
        "recommendations": [
            "Update nginx to latest version to fix CVE-2023-1234",
            "Implement network policies to restrict pod communication",
            "Enable pod security policies (PSP)",
            "Review and tighten RBAC permissions",
            "Scan all container images for vulnerabilities",
            "Implement runtime security monitoring"
        ]
    }

async def generate_cluster_insights(cluster_id: Optional[str] = None, time_range: str = "24h") -> Dict[str, Any]:
    """Generate AI-powered cluster insights"""
    await asyncio.sleep(0.1)  # Simulate AI processing
    
    return {
        "anomalies": [
            {
                "type": "spike",
                "metric": "cpu_usage",
                "description": "Unusual CPU spike detected in web-server pods",
                "severity": "medium",
                "timestamp": datetime.now().isoformat()
            },
            {
                "type": "memory_leak",
                "metric": "memory_usage",
                "description": "Gradual memory increase detected in database pod",
                "severity": "high",
                "timestamp": datetime.now().isoformat()
            }
        ],
        "recommendations": [
            {
                "category": "performance",
                "title": "Optimize database queries",
                "description": "Several slow queries detected that could be optimized",
                "priority": "high"
            },
            {
                "category": "security",
                "title": "Review RBAC permissions",
                "description": "Some pods have broader permissions than necessary",
                "priority": "medium"
            },
            {
                "category": "scaling",
                "title": "Implement auto-scaling",
                "description": "Configure horizontal pod autoscaling for better resource utilization",
                "priority": "low"
            }
        ]
    }

# Application lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("KubeGuardian AI Service starting up...")
    yield
    logger.info("KubeGuardian AI Service shutting down...")

# FastAPI app
app = FastAPI(
    title="KubeGuardian AI Service",
    description="AI-powered DevSecOps automation microservice",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# AI Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        logger.info(f"Processing chat request: {request.message[:100]}...")
        
        ai_response = await chat_with_ai(request.message, request.context)
        
        return ChatResponse(
            id=f"chat_{datetime.now().timestamp()}",
            content=ai_response["content"],
            timestamp=datetime.now().isoformat(),
            confidence=ai_response["confidence"],
            user_id=request.user_id
        )
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Log analysis endpoint
@app.post("/analyze-logs", response_model=LogAnalysisResponse)
async def analyze_logs_endpoint(request: LogAnalysisRequest):
    try:
        logger.info(f"Analyzing logs for cluster: {request.cluster_id}")
        
        analysis = await analyze_logs_with_ai(request.logs, request.log_type)
        
        return LogAnalysisResponse(
            summary=analysis["summary"],
            root_cause=analysis["root_cause"],
            recommendations=analysis["recommendations"],
            confidence=analysis["confidence"],
            analyzed_at=datetime.now().isoformat(),
            cluster_id=request.cluster_id,
            log_type=request.log_type,
            severity=analysis["severity"]
        )
    except Exception as e:
        logger.error(f"Log analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Security analysis endpoint
@app.post("/security-analysis", response_model=SecurityAnalysisResponse)
async def security_analysis_endpoint(request: SecurityAnalysisRequest):
    try:
        logger.info(f"Performing security analysis for cluster: {request.cluster_id}")
        
        insights = await generate_security_insights(request.cluster_id, request.scan_results)
        
        return SecurityAnalysisResponse(
            cluster_id=request.cluster_id,
            risk_score=insights["risk_score"],
            critical_issues=insights["critical_issues"],
            high_issues=insights["high_issues"],
            medium_issues=insights["medium_issues"],
            low_issues=insights["low_issues"],
            recommendations=insights["recommendations"],
            analyzed_at=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Security analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# AI insights endpoint
@app.get("/insights", response_model=AIInsightsResponse)
async def insights_endpoint(cluster_id: Optional[str] = None, time_range: str = "24h"):
    try:
        logger.info(f"Generating AI insights for time range: {time_range}")
        
        insights = await generate_cluster_insights(cluster_id, time_range)
        
        return AIInsightsResponse(
            cluster_id=cluster_id,
            time_range=time_range,
            anomalies=insights["anomalies"],
            recommendations=insights["recommendations"],
            generated_at=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Insights generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "KubeGuardian AI Service",
        "version": "1.0.0",
        "description": "AI-powered DevSecOps automation microservice",
        "endpoints": {
            "chat": "/chat",
            "analyze-logs": "/analyze-logs",
            "security-analysis": "/security-analysis",
            "insights": "/insights",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
