# A Life in Frames — Eita Taiwo Victor

A luxury-cinematic birthday documentary website starter for 22 November 2026.

## Included
- Responsive HTML/CSS/JavaScript website
- Birthday countdown
- Story timeline, twin chapter, memory gallery, documentary section
- Guestbook form
- Optional Supabase integration for public moderated wishes
- SQL schema with Row Level Security
- Preview mode when Supabase has not been configured

## 1. Preview locally
Open `index.html` in a browser. For the best experience, use a local static server (for example VS Code Live Server).

Without Supabase credentials, guestbook submissions are stored only in the current browser for preview. They are NOT shared with other visitors.

## 2. Add your real content
- Replace the portrait and gallery placeholder image URLs in `index.html` with your own photos.
- Replace the twin section image with a photo you and your twin sister are both comfortable sharing.
- Upload your documentary to YouTube or Vimeo, then replace the film poster with the platform's embed iframe.
- Update the timeline text with real dates and memories.
- The current portrait caption includes a placeholder age/chapter label; update it to match your actual age.

## 3. Configure Supabase guestbook
1. Create a project at https://supabase.com.
2. In the SQL Editor, run `supabase/schema.sql`.
3. Open Project Settings / API (or Connect) and copy the project URL and publishable/anon key.
4. Paste those values into `SUPABASE_URL` and `SUPABASE_ANON_KEY` at the top of `script.js`.
5. Test a submission. It should be stored with `approved = false`, and should not appear publicly yet.
6. In Supabase Table Editor, review each submission. Set `approved = true` only for appropriate messages. Approved wishes appear on the website.
7. Never expose a `service_role` key or Supabase secret key in client-side JavaScript.

For a public launch, consider adding CAPTCHA or rate limiting and a private authenticated admin interface if spam becomes an issue. The starter uses manual approval in the Supabase dashboard.

## 4. Deploy to Vercel via GitHub
1. Create a GitHub repository named `a-life-in-frames`.
2. Upload all project files, keeping `index.html` at the repository root.
3. In Vercel, select Add New → Project and import the repository.
4. Select Framework Preset: Other. Leave Build Command blank. Use `.` as the Output Directory if Vercel asks for one.
5. Click Deploy.
6. Open the generated URL on your phone and test all sections and the guestbook.
7. Every push to the connected production branch triggers a new deployment.

## 5. Documentary planning
Recommended 3–5 minute structure:
1. Opening (0:00–0:15): title, current portrait, “Every life is a story.”
2. Childhood (0:15–0:55): early photos, family, home, first memories.
3. Twin chapter (0:55–1:35): you and your twin sister, shared memories, differences, gratitude.
4. Growing up (1:35–2:20): education, friendships, faith, challenges and lessons.
5. Becoming a developer (2:20–3:00): learning, building, your craft and purpose.
6. People and gratitude (3:00–3:40): family, friends, mentors, community.
7. The next chapter (3:40–4:10): what you are grateful for, what you hope to build, birthday message.
Use only photos/videos you have permission to publish, especially childhood photos and photos of your twin sister. Add captions/subtitles and use music you have permission to use.

## Notes
- The image URLs are illustrative remote placeholders; replace them with personal photos before launch.
- The website is a starter project, not yet a deployed public site.
- Do a final mobile, accessibility, privacy, and database-policy check before sharing publicly.
