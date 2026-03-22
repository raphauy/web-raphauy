# /redact — Blur sensitive info in project screenshots

## Usage
```
/redact <slug>          # process all raw/ images for a specific project
/redact                 # scan all projects for unprocessed images
```

The raw arguments are: `$ARGUMENTS`

## Instructions

You are processing screenshots to blur sensitive information (phone numbers, email addresses) before they are used in the portfolio.

### Directory structure
- **Raw (input):** `projects/<slug>/screenshots/raw/` — original unprocessed screenshots
- **Processed (output):** `public/projects/<slug>/screenshots/` — blurred versions served by Next.js
- **data.json:** `projects/<slug>/data.json` — the `screenshots` array must be updated with filenames

### Workflow

**Step 1 — Find pending images**

If a slug was provided, look only in that project. Otherwise scan all `projects/*/screenshots/raw/` directories.

For each image in `raw/`, check if a same-named file exists in `public/projects/<slug>/screenshots/`. If it does, skip it (already processed). Collect the list of pending images.

If no pending images are found, tell the user and stop.

**Step 2 — Process each image**

For each pending image:

1. **Read the image** using the Read tool (you are multimodal and can see images).
2. **Analyze it** for sensitive information:
   - Phone numbers (any format: +598 99 123 456, 099123456, etc.)
   - Email addresses
   - Any other obviously personal data you notice (ID numbers, credit cards, etc.)
3. **If no sensitive data is found:** Copy the image as-is to the public directory:
   ```bash
   cp "projects/<slug>/screenshots/raw/<filename>" "public/projects/<slug>/screenshots/<filename>"
   ```
4. **If sensitive data IS found:** Estimate bounding box coordinates for each sensitive region. Consider:
   - The image dimensions (get them with: `identify -format '%wx%h' <path>` or read from Sharp metadata)
   - The relative position of the text in the image
   - Add generous padding around the text (±20px) to ensure full coverage

   Then run the redact script:
   ```bash
   tsx scripts/redact.ts "projects/<slug>/screenshots/raw/<filename>" "public/projects/<slug>/screenshots/<filename>" '<regions-json>'
   ```
   Where `<regions-json>` is a JSON array of `{"x": <int>, "y": <int>, "width": <int>, "height": <int>}` objects.

5. **Show the result:** After processing, read the output image with the Read tool and show it to the user for validation.

**Step 3 — Report**

**Step 3 — Update data.json**

After processing all images for a slug, update `projects/<slug>/data.json`:
- Read the current `screenshots` array
- Add any new filenames that were just processed (preserve existing entries)
- Write back the updated file

**Step 4 — Report**

After processing all images, show a summary:
- How many images were processed
- How many had sensitive data blurred
- How many were copied as-is
- Remind the user to review the processed images

### Important notes
- Be generous with blur regions — it's better to blur a bit too much than to miss sensitive data.
- The user will validate results, so don't worry about pixel-perfect accuracy.
- If you're unsure whether something is sensitive, blur it and mention it to the user.
- Process images one at a time so the user can give feedback between images if needed.
