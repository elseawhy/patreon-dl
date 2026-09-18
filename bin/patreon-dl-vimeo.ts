#!/usr/bin/env bun

/**
 * External downloader for embedded Vimeo videos. Obtains the appropriate URL to download from and
 * passes it to 'yt-dlp' (https://github.com/yt-dlp/yt-dlp).
 * 
 * Usage
 * -----
 * Place the following two lines in your 'patreon-dl' config file:
 *
 * [embed.downloader.vimeo]
 * exec = patreon-dl-vimeo -o "{dest.dir}/%(title)s.%(ext)s" --embed-html "{embed.html}" --embed-url "{embed.url}"
 * 
 * You can append the following additional options to the exec line if necessary:
 * --video-password "<password>": for password-protected videos
 * --yt-dlp "</path/to/yt-dlp>": if yt-dlp is not in the PATH
 * 
 * You can pass options directly to yt-dlp. To do so, add '--' to the end of the exec line, followed by the options.
 * For example:
 * exec = patreon-dl-vimeo -o "{dest.dir}/%(title)s.%(ext)s" --embed-html "{embed.html}" --embed-url "{embed.url}" -- --cookies-from-browser firefox
 * 
 * Upon encountering a post with embedded Vimeo content, 'patreon-dl' will call this script, which in turn proceeds to download through VimeoDownloader
 * (see the parent class EmbedlyDownloader for more info).
 */

import EmbedlyDownloader from './EmbedlyDownloader.ts';
import * as entities from 'entities';

class VimeoDownloader extends EmbedlyDownloader {
  constructor() {
    super('Vimeo', 'player.vimeo.com');
  }

  // Override
  getPlayerURL(html) {
    if (html) {
      const regex = /src=\"(https:\/\/player\.vimeo\.com\/video\/\d+(?:\?.+?)?)\"/g;
      const match = regex.exec(html);
      if (match && match[1]) {
        const url = entities.decodeHTML(match[1]);
        console.log("Found Vimeo player URL from embed HTML:", url);
        return url;
      }
      console.warn("Vimeo player URL not found in embed HTML");
    }
    return super.getPlayerURL(html);
  }
}

(async () => {
  const downloader = new VimeoDownloader();
  try {
    process.exit(await downloader.start());
  }
  catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();