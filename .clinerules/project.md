# Sushi Ordering Platform — Brand Brief

## What it is

Sushi Ordering Platform is a multi-tenant platform that helps sushi restaurants manage online orders efficiently. Customers can browse the sushi menu, view products and prices, and place their orders online, while restaurant staff can manage incoming orders.

## Palette

- Primary: #0B3954
- Accent: #087E8B — use for prices, primary buttons, badges and important actions
- Background: #F7F7F2

## Fonts

- Headings: Poppins
- Body: Open Sans

## Tone

Modern, simple, trustworthy. Not this: not a complicated corporate management system or a visually overloaded food-ordering website.

## Screens

- Sushi Menu (home)

## Stack, pinned

Plain HTML, CSS and JavaScript reading a local JSON file, styled with Bootstrap 5 loaded from a CDN. No framework, no npm, no build step.

Bootstrap 5 — two lines, both required:

```html
<!-- in <head> -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- just before </body> -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
```