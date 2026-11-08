@echo off
echo ==================================================================
echo   KubeGuardian AI - Cloud Native DevSecOps Automation Platform
echo ==================================================================
echo.
echo [1/2] Starting Backend Server (Express + TypeScript + K8s)...
echo [2/2] Starting Frontend Client (React + Vite + Tailwind)...
echo.
echo Running workspaces concurrently...
npm run dev
pause
