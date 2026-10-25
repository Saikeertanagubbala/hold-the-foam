# Hold the Foam

A personal landing page designed around a coffee cup lid, with an About section, demo videos, an interactive 3D model of the lid, and social links.

## Folder layout

```
Hold_The_Foam/
├── index.html              The page itself (all the text lives here)
├── css/style.css           Colors, fonts, layout
├── js/main.js              Small page helpers (copy email, missing-video placeholders)
├── js/lid-viewer.js        The 3D lid viewer (three.js)
├── assets/
│   ├── images/             Profile photo and other pictures
│   │   └── thumbnails/     Poster images for each demo video
│   ├── videos/             Demo videos (.mp4)
│   └── models/             3D model: put your file here as lid.stl
├── netlify.toml            Netlify hosting settings
└── .gitignore              Files Git should skip
```

## Adding your files

| What | Where | Name it |
|---|---|---|
| 3D lid model | `assets/models/` | `lid.stl` |
| Demo videos | `assets/videos/` | `demo-1.mp4`, `demo-2.mp4`, `demo-3.mp4` |
| Video poster images | `assets/images/thumbnails/` | `demo-1.jpg`, `demo-2.jpg`, `demo-3.jpg` |
| Profile photo | `assets/images/` | `profile.jpg` |

Use lowercase names with dashes and no spaces. Web servers treat `Demo-1.MP4` and `demo-1.mp4` as different files.

### Size limits to know about

- **GitHub rejects any single file over 100 MB** and warns over 50 MB. Export demo videos as 1080p MP4 (H.264) and keep each under about 50 MB. HandBrake (free) does this well.
- Keep untouched raw footage in `assets/videos/raw/`. That folder is in `.gitignore`, so it never gets uploaded.
- Export the STL as **binary**, not ASCII. It is several times smaller. Aim for under 20 MB so it loads fast.
- For long videos, upload to YouTube instead and link to it.

## Preview on your computer

The 3D viewer loads `lid.stl` over the network, so opening `index.html` by double-clicking will not load the model. Run a small local server from this folder:

```bash
npx serve .
```

Then open the address it prints (usually http://localhost:3000).

## Put it online

1. Create a new empty repository on GitHub named `hold-the-foam`.
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "First version of Hold the Foam"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/hold-the-foam.git
   git push -u origin main
   ```
3. In Netlify, choose **Add new site → Import an existing project → GitHub**, pick the repo, and deploy. There is no build command; `netlify.toml` already says to publish the root folder.

Every push to `main` after that updates the live site automatically.
