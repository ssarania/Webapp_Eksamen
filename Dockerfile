# Multi-stage Dockerfile for ASP.NET Core + React app

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/web

# Copy package files
COPY web/package.json web/package-lock.json* ./
RUN npm ci

# Copy frontend source
COPY web/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build the ASP.NET Core backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app

# Copy csproj and restore dependencies
COPY BasicProject/*.csproj ./BasicProject/
RUN dotnet restore ./BasicProject/BasicProject.csproj

# Copy the rest of the backend code
COPY BasicProject/ ./BasicProject/

# Copy the built frontend into wwwroot
COPY --from=frontend-build /app/web/dist ./BasicProject/wwwroot

# Build the backend
WORKDIR /app/BasicProject
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install necessary tools
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=backend-build /app/publish .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the application
ENTRYPOINT ["dotnet", "BasicProject.dll"]
