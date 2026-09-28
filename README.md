# Online Gallery of Electrical Abuse Documentation

A free static website assembled from the `Online Gallery.xlsx` workbook. The website has no server-side component, subscription, or build step.

## Open or host the site

- Open `index.html` in a modern browser to use the searchable media index.
- `gallery.html` shows a 48-hour window beginning at midnight. Its window selector and previous/next buttons include only spans that contain media.
- To publish it on a free static host, upload this folder as a static site. Keep `index.html`, `gallery.html`, `media-data.js`, and `assets/` together.

## Edit the site

- Edit `media-data.js` to change media names, timestamps, Google Drive links, video lengths, and album descriptor summaries. The data is grouped by Google Drive file ID so duplicate workbook rows do not duplicate a media card.
- Edit `assets/site.css` for colors, spacing, and layout.
- Edit `assets/site.js` for gallery, filtering, or sorting behavior.
- Edit `index.html` and `gallery.html` for page titles and text.

## Media access

Photo and video thumbnails load from Google Drive. Click a video thumbnail to start the embedded Google Drive player; the linked file name opens its Google Drive page. The source Drive file must be accessible to the visitor's Google account or shared for the required audience.

## Workbook snapshot

The data snapshot contains 2,075 unique media files from 2023-03-20 through 2024-09-22, consolidated from 8,572 workbook rows. Media dated in 2022 is excluded. Gallery navigation lists only 48-hour windows that contain at least one media file. The displayed timestamps are the workbook timestamps, and page windows use those timestamps without timezone conversion.
