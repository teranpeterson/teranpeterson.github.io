---
layout: post
title:  "Containerizing a .NET Service"
image: "https://picsum.photos/seed/docker/1200/500"
image-desc: "Placeholder header image"
description: "Packaging a small ASP.NET Core API into a lean container image with a multi-stage build."
author: "Teran"
tags:
  - Docker
  - .NET
  - DevOps
---

> This is a placeholder post used to preview the blog UI. Replace it with real content.

Shipping a .NET service as a container keeps deployments boring, which is exactly
what you want. A multi-stage build keeps the final image small by leaving the SDK
behind in the build stage.

## The Dockerfile

```bash
docker build -t my-api:latest .
docker run --rm -p 8080:8080 my-api:latest
```

A minimal health endpoint is enough to prove the container is alive:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();
```

## Keeping images small

Pin your base images, run as a non-root user, and `.dockerignore` everything you
don't need. Your future self reviewing the security report will thank you.
