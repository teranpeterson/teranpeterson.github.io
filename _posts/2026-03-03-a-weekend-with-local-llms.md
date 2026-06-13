---
layout: post
title:  "A Weekend with Local LLMs"
image: "https://picsum.photos/seed/llm/1200/500"
image-desc: "Placeholder header image"
image_width: 1200
image_height: 500
description: "Running an open-weight language model on my own machine — setup, performance, and surprises."
author: "Teran"
tags:
  - AI
  - Linux
---

> This is a placeholder post used to preview the blog UI. Replace it with real content.

I spent a Saturday seeing how far I could get running a language model entirely on
my own hardware. No API keys, no rate limits, just my GPU and a lot of fans.

## Pulling a model

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama run llama3
```

That's genuinely the whole setup. Within a couple of minutes I had a model
answering prompts in my terminal.

## Was it worth it?

For quick, offline experimentation — absolutely. For anything latency-sensitive or
needing the largest frontier models, the hosted options still win. But owning the
whole stack, even briefly, taught me more than a month of reading docs.
