---
layout: post
title:  "Getting Started with Flutter"
image: "https://picsum.photos/seed/flutter/1200/500"
image-desc: "Placeholder header image"
image_width: 1200
image_height: 500
description: "A quick tour of setting up your first Flutter app, from install to a running counter on a real device."
author: "Teran"
tags:
  - Flutter
  - Mobile
  - Tutorial
---

> This is a placeholder post used to preview the blog UI. Replace it with real content.

Flutter has become my go-to for shipping cross-platform apps without maintaining
two separate codebases. The tooling is fast, hot reload is genuinely magical, and
the widget model clicks once you stop fighting it.

## Installing the SDK

Grab the SDK and confirm everything is wired up correctly:

```bash
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"
flutter doctor
```

If `flutter doctor` shows all green checks, you're ready to go.

## A first widget

Every Flutter app is a tree of widgets. Here's the smallest counter you can write:

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: Text('Hello, Flutter'));
  }
}
```

## Where to go next

Once you're comfortable with stateless and stateful widgets, dig into layout,
navigation, and state management. That's where the real apps live.
