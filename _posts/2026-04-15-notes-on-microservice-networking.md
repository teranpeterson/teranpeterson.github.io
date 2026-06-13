---
layout: post
title:  "Notes on Microservice Networking"
image: "https://picsum.photos/seed/networking/1200/500"
image-desc: "Placeholder header image"
description: "Hard-won lessons on service discovery, retries, and timeouts in a distributed system."
author: "Teran"
tags:
  - Networking
  - Architecture
---

> This is a placeholder post used to preview the blog UI. Replace it with real content.

The first time a microservice system fails in production, it's rarely the code.
It's the network between the services — the timeouts that were never set, the
retries that amplified a small blip into an outage, the service discovery that
pointed at a dead instance for thirty seconds too long.

## Set timeouts everywhere

A request with no timeout is a request that can hang forever. Every hop should
have a budget, and the budgets should add up to less than the timeout of the call
that started the chain. Otherwise you get cascading failures that are miserable to
debug.

## Retries need backoff and jitter

Naive retries are how you turn a brief hiccup into a thundering herd. Exponential
backoff with jitter spreads the load out so your recovering service isn't
immediately knocked over again.

## Make failure visible

Dashboards for latency percentiles, error rates, and saturation will tell you more
than any amount of log spelunking after the fact. Instrument first, debug second.
