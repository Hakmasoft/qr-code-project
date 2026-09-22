# Soul Hub

Soul Hub places relatable, non-religious messages on everyday physical surfaces — cups, hotel rooms, cards — each paired with a QR code. Scanning the code opens a short video clip matched to the surface text, followed by a warm invitation to a current Phaneroo event, followed by a simple next-step form. Form submissions are handed off to Phaneroo's Follow Up department.

The core design principle: **the surface determines the response.** Everything downstream depends on whether one printed line makes someone stop and scan.

## How It Works

```
Physical Surface (text + QR)
        |
        v
Short Link  ->  scan.<domain>/c/[slug]
        |
        v
Redirect Service (looks up slug, logs scan event)
        |
        v
Hub  ->  matched clip  ->  season ad  ->  next-step form
        |
        v
Follow Up (handoff via webhook or manual import)
```

The QR code never encodes the final Hub URL. It encodes a short link on a domain we control, so printed material stays valid when the Hub changes.
