// ==UserScript==
// @name         DarkPeers - ModQ Helper
// @namespace    https://github.com/ThatNeoByte/UserScripts
// @version      2.0.1
// @description  Modq helper tool to check for naming and metadata issue with uploaded torrents. Adapted to work for DarkPeers.
// @author       SOCS (original) | NeoByte (adaptation)
// @license      MIT

// @credits      Original script by SOCS
// @source       https://openuserjs.org/scripts/SOCS/ModQ_Helper
// @modified-by  ThatNeoByte (Major adaptation for DarkPeers)

// @match        *://darkpeers.org/torrents/*
// @match        *://luminarr.me/torrents/*
// @icon         https://darkpeers.org/favicon.ico
// @updateURL    https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/DarkPeers/DarkPeers-ModqHelper.user.js
// @downloadURL  https://raw.githubusercontent.com/ThatNeoByte/UserScripts/main/DarkPeers/DarkPeers-ModqHelper.user.js
// @run-at       document-idle

// @grant        GM_addStyle
// ==/UserScript==

/*
 * Based on "ModQ Helper" v1.2.1 by SOCS
 * Original source:
 * https://openuserjs.org/scripts/SOCS/ModQ_Helper
 *
 * Adapted for DarkPeers naming rules by NeoByte (2026)
 */


(function () {
  'use strict';

  const CONFIG = {
    minScreenshots: 3,
    validResolutions: ['480i', '480p', '576i', '576p', '720p', '1080i', '1080p', '2160p', '4320p'],
    validAudioCodecs: [
      'DTS-HD MA', 'DTS-HD HRA', 'DTS:X', 'DTS-ES', 'DTS', 'TrueHD',
      'DD+ EX', 'DD+', 'DDP', 'DD EX', 'DD', 'E-AC-3', 'AC-3',
      'LPCM', 'PCM', 'FLAC', 'ALAC', 'AAC', 'MP3', 'MP2', 'Opus', 'Vorbis'
    ],
    validObjects: ['Atmos', 'Auro3D'],
    validChannels: ['1.0', '2.0', '4.0', '5.1', '6.1', '7.1', '9.1', '11.1'],
    validVideoCodecs: [
      'AVC', 'HEVC', 'H.264', 'H.265', 'x264', 'x265',
      'MPEG-2', 'VC-1', 'VP9', 'AV1', 'XviD', 'DivX'
    ],
    hdrFormats: ['DV HDR10+', 'DV HDR', 'DoVi', 'HDR10+', 'HDR10', 'HDR', 'DV', 'HLG', 'PQ'],
    fullDiscTypes: ['Full Disc', 'BD50', 'BD25', 'BD66', 'BD100'],
    remuxTypes: ['REMUX'],
    encodeTypes: ['Encode'],
    webTypes: ['WEB-DL', 'WEBRip'],
    hdtvTypes: ['HDTV', 'SDTV', 'UHDTV', 'PDTV', 'DSR'],
    streamingServices: [
      'AMZN', 'NF', 'DSNP', 'HMAX', 'ATVP', 'PCOK', 'PMTP', 'HBO', 'HULU',
      'iT', 'MA', 'STAN', 'RED', 'CRAV', 'CRITERION', 'SHO', 'STARZ',
      'VUDU', 'MUBI', 'BCORE', 'PLAY', 'APTV'
    ],
    sources: {
      fullDisc: ['Blu-ray', 'UHD Blu-ray', 'HD DVD', 'DVD5', 'DVD9', 'NTSC DVD', 'PAL DVD'],
      remux: ['BluRay', 'UHD BluRay', 'HDDVD', 'NTSC DVD', 'PAL DVD'],
      encode: ['BluRay', 'UHD BluRay', 'DVDRip', 'HDDVD', 'BDRip', 'BRRip'],
      web: ['WEB-DL', 'WEBRip', 'WEB'],
      hdtv: ['HDTV', 'SDTV', 'UHDTV', 'PDTV', 'DSR']
    },
    bannedGroups: [
      '1000', '24xHD', '41RGB', '4K4U', 'AG', 'AOC', 'AROMA', 'aXXo', 'AZAZE',
      'BARC0DE', 'BAUCKLEY', 'BdC', 'beAst', 'BRiNK', 'BTM', 'C1NEM4', 'C4K',
      'CDDHD', 'CHAOS', 'CHD', 'CHX', 'CiNE', 'COLLECTiVE', 'CREATiVE24',
      'CrEwSaDe', 'CTFOH', 'd3g', 'DDR', 'DepraveD', 'DNL', 'DRX', 'EPiC',
      'EuReKA', 'EVO', 'FaNGDiNG0', 'Feranki1980', 'FGT', 'FMD', 'FRDS', 'FZHD',
      'GalaxyRG', 'GHD', 'GHOSTS', 'GPTHD', 'HDHUB4U', 'HDS', 'HDT', 'HDTime',
      'HDWinG', 'HiQVE', 'iNTENSO', 'iPlanet', 'iVy', 'jennaortegaUHD',
      'JFF', 'KC', 'KiNGDOM', 'KIRA', 'L0SERNIGHT', 'LAMA', 'Leffe', 'Liber8',
      'LiGaS', 'LT', 'LUCY', 'MarkII', 'MeGusta', 'Mesc', 'mHD', 'mSD', 'MT',
      'MTeam', 'MySiLU', 'NhaNc3', 'nhanc3', 'nHD', 'nikt0', 'nSD', 'OFT',
      'Paheph', 'PATOMiEL', 'PRODJi', 'PSA', 'PTNK', 'RARBG', 'RDN', 'Rifftrax',
      'RU4HD', 'SANTi', 'SasukeducK', 'Scene', 'SHD', 'ShieldBearer',
      'STUTTERSHIT', 'SUNSCREEN', 'TBS', 'TEKNO3D', 'TG', 'Tigole', 'TIKO',
      'VIDEOHOLE', 'VISIONPLUSHDR', 'WAF', 'WiKi', 'worldmkv', 'x0r', 'XLF',
      'YIFY', 'YTSMX', 'Zero00', 'Zeus'
    ],
    imageHosts: [
      'imgbb.com', 'imgur.com', 'ptpimg.me', 'imgbox.com', 'beyondhd.co',
      'img.luminarr.me', 'slowpic.', 'pixhost.', 'ibb.co', 'postimg.',
      'funkyimg.', 'image.tmdb.org'
    ],
    imageExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    languageMap: {
      'en': 'English',
      'fr': 'French',
      'ja': 'Japanese',
      'de': 'German',
      'it': 'Italian',
      'es': 'Spanish',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ru': 'Russian',
      'pt': 'Portuguese',
      'hi': 'Hindi',
      'da': 'Danish',
      'fi': 'Finnish',
      'no': 'Norwegian',
      'sv': 'Swedish',
      'nl': 'Dutch',
      'pl': 'Polish',
      'hu': 'Hungarian',
      'cs': 'Czech',
      'tr': 'Turkish',
      'el': 'Greek'
    },
    titleElementOrder: {
      fullDiscRemux: [
        'name', 'aka', 'locale', 'year', 'season', 'cut', 'ratio',
        'repack', 'resolution', 'edition', 'region', '3d', 'source',
        'type', 'hdr', 'vcodec', 'dub', 'acodec', 'channels', 'object', 'group'
      ],
      encodeWeb: [
        'name', 'aka', 'locale', 'year', 'season', 'cut', 'ratio',
        'repack', 'resolution', 'edition', '3d', 'source', 'type',
        'dub', 'acodec', 'channels', 'object', 'hdr', 'vcodec', 'group'
      ]
    },
    cuts: ['Theatrical', 'Director\'s Cut', 'Extended', 'Extended Cut', 'Extended Edition',
      'Special Edition', 'Unrated', 'Unrated Director\'s Cut', 'Uncut', 'Super Duper Cut',
      'Ultimate Cut', 'Ultimate Edition', 'Final Cut', 'Producer\'s Cut', 'Assembly Cut',
      'International Cut', 'Redux', 'Rough Cut', 'Bootleg Cut', 'Criterion', 'Criterion Cut',
      'Workprint', 'Hybrid Cut'
    ],
    ratios: ['IMAX', 'Open Matte', 'MAR'],
    editions: ['Anniversary Edition', 'Remastered', '4K Remaster', 'Criterion Collection',
      'Limited', 'Collector\'s Edition', 'Deluxe Edition', 'Restored'
    ],
    repacks: ['REPACK', 'REPACK2', 'REPACK3', 'PROPER', 'RERIP'],
    dubs: ['Multi', 'Dual-Audio', 'Dual Audio', 'Dubbed']
  };

  const DataExtractor = {
    getTorrentName() {
      const el = document.querySelector('h1.torrent__name');
      return el ? el.textContent.trim() : null;
    },

    getTmdbTitle() {
      const el = document.querySelector('h1.meta__title');
      if (!el) return null;
      const text = el.textContent.trim();
      const match = text.match(/^(.+?)\s*\(\d{4}\)\s*$/);
      return match ? match[1].trim() : text;
    },

    getTmdbYear() {
      const el = document.querySelector('h1.meta__title');
      if (!el) return null;
      const text = el.textContent.trim();
      const match = text.match(/\((\d{4})\)\s*$/);
      return match ? match[1] : null;
    },

    getCategory() {
      const el = document.querySelector('li.torrent__category a');
      return el ? el.textContent.trim() : null;
    },

    getType() {
      const el = document.querySelector('li.torrent__type a');
      return el ? el.textContent.trim() : null;
    },

    getResolution() {
      const el = document.querySelector('li.torrent__resolution a');
      return el ? el.textContent.trim() : null;
    },

    getDescription() {
      const panels = document.querySelectorAll('section.panelV2');
      for (const panel of panels) {
        const heading = panel.querySelector('.panel__heading');
        if (heading && heading.textContent.includes('Description')) {
          const body = panel.querySelector('.panel__body.bbcode-rendered');
          return body ? body.innerHTML : '';
        }
      }
      return '';
    },

    getFileStructure() {
      const dialogForms = document.querySelectorAll('.dialog__form[data-tab="hierarchy"]');

      for (const form of dialogForms) {
        const folderIcon = form.querySelector('i.fas.fa-folder');
        if (folderIcon) {
          const folderSpan = folderIcon.parentElement;
          if (folderSpan) {
            const folderNameEl = folderSpan.querySelector('span[style*="word-break"]');
            const folderName = folderNameEl ? folderNameEl.textContent.trim() : null;
            const countEl = folderSpan.querySelector('span[style*="grid-area: count"]');
            const countMatch = countEl ? countEl.textContent.match(/\((\d+)\)/) : null;
            const fileCount = countMatch ? parseInt(countMatch[1], 10) : 0;
            const files = [];
            const fileElements = form.querySelectorAll('details i.fas.fa-file');
            fileElements.forEach(fileIcon => {
              const fileSpan = fileIcon.parentElement;
              const fileNameEl = fileSpan?.querySelector('span[style*="word-break"]');
              if (fileNameEl) {
                files.push(fileNameEl.textContent.trim());
              }
            });

            return {
              hasFolder: true,
              folderName: folderName,
              fileCount: fileCount,
              files: files
            };
          }
        }

        const topLevelFile = form.querySelector(':scope > details > summary i.fas.fa-file');
        if (topLevelFile) {
          const fileSpan = topLevelFile.parentElement;
          const fileNameEl = fileSpan?.querySelector('span[style*="word-break"]');
          return {
            hasFolder: false,
            folderName: null,
            fileCount: 1,
            files: fileNameEl ? [fileNameEl.textContent.trim()] : []
          };
        }
      }

      const listTable = document.querySelector('.dialog__form[data-tab="list"] table.data-table tbody');
      if (listTable) {
        const rows = listTable.querySelectorAll('tr');
        const files = [];
        rows.forEach(row => {
          const nameCell = row.querySelector('td:nth-child(2)');
          if (nameCell) {
            files.push(nameCell.textContent.trim());
          }
        });

        if (files.length > 0 && files[0].includes('/')) {
          const parts = files[0].split('/');
          return {
            hasFolder: true,
            folderName: parts[0],
            fileCount: files.length,
            files: files
          };
        }

        return {
          hasFolder: false,
          folderName: null,
          fileCount: files.length,
          files: files
        };
      }

      return null;
    },

    hasMediaInfo() {
      const panels = document.querySelectorAll('div.panelV2, section.panelV2');
      for (const panel of panels) {
        const heading = panel.querySelector('.panel__heading');
        if (heading && heading.textContent.includes('MediaInfo')) {
          return true;
        }
      }
      return false;
    },

    hasBdInfo() {
      const panels = document.querySelectorAll('div.panelV2, section.panelV2');
      for (const panel of panels) {
        const heading = panel.querySelector('.panel__heading');
        if (heading && heading.textContent.includes('BDInfo')) {
          return true;
        }
      }
      return false;
    },

    isTV() {
      const category = this.getCategory();
      if (!category) return false;
      return category.toLowerCase().includes('tv') ||
        category.toLowerCase().includes('series') ||
        category.toLowerCase().includes('episode');
    },

    getOriginalLanguage() {
      const el = document.querySelector('.work__language-link');
      return el ? el.textContent.trim().toLowerCase() : null;
    },

    getMediaInfoLanguages() {
      const languages = new Set();
      const mediaInfoText = this.getMediaInfoText();

      if (mediaInfoText) {
        const sections = mediaInfoText.split(/\n(?=Audio(?: #\d+)?[\r\n])/);

        for (const section of sections) {
          if (!/^Audio(?:\s|$)/m.test(section)) continue;

          const lines = section.split('\n');
          let lang = null;
          let isCommentary = false;

          for (const line of lines) {
            if (/^(Video|Text|Menu|General|Chapter)/.test(line.trim())) break;

            const langMatch = line.match(/^Language\s*:\s*(.+)$/);
            if (langMatch) {
              lang = langMatch[1].trim();
            }

            const titleMatch = line.match(/^Title\s*:\s*(.+)$/);
            if (titleMatch && /commentary/i.test(titleMatch[1])) {
              isCommentary = true;
            }
          }

          if (lang && !isCommentary) {
            languages.add(lang);
          }
        }
      }

      if (languages.size === 0) {
        const flagImgs = document.querySelectorAll('.mediainfo__audio dl dd img');
        flagImgs.forEach(img => {
          if (img.alt) languages.add(img.alt.trim());
        });
      }

      return Array.from(languages);
    },

    getMediaInfoText() {
      const el = document.querySelector('.torrent-mediainfo-dump code, code[x-ref="mediainfo"]');
      return el ? el.textContent : '';
    },

    getMediaInfoSubtitles() {
      const subtitles = new Set();
      const subtitleImgs = document.querySelectorAll('.mediainfo__subtitles ul li img');
      subtitleImgs.forEach(img => {
        if (img.alt) subtitles.add(img.alt.trim());
      });

      if (subtitles.size === 0) {
        const mediaInfoText = this.getMediaInfoText();
        if (mediaInfoText) {
          const sections = mediaInfoText.split(/\n(?=Text(?: #\d+)?[\r\n])/);

          for (const section of sections) {
            if (!/^Text(?:\s|$)/m.test(section)) continue;

            const lines = section.split('\n');
            for (const line of lines) {
              if (/^(Video|Audio|Menu|General|Chapter)/.test(line.trim())) break;

              const langMatch = line.match(/^Language\s*:\s*(.+)$/);
              if (langMatch) {
                subtitles.add(langMatch[1].trim());
                break;
              }
            }
          }
        }
      }

      return Array.from(subtitles);
    },

    getAudioTracksFromMediaInfo() {
      const tracks = [];
      const mediaInfoText = this.getMediaInfoText();
      if (!mediaInfoText) return tracks;

      const sections = mediaInfoText.split(/\n(?=Audio(?: #\d+)?[\r\n])/);

      for (const section of sections) {
        if (!/^Audio(?:\s|$)/m.test(section)) continue;

        const track = {
          codec: null,
          channels: null,
          language: null,
          title: null,
          isDefault: false
        };
        const lines = section.split('\n');

        for (const line of lines) {
          if (/^(Video|Text|Menu|General|Chapter)/.test(line.trim())) break;

          const formatMatch = line.match(/^Format\s*:\s*(.+)$/);
          if (formatMatch && !track.codec) {
            track.codec = formatMatch[1].trim();
          }

          const commercialMatch = line.match(/^Commercial name\s*:\s*(.+)$/);
          if (commercialMatch) {
            track.commercialName = commercialMatch[1].trim();
          }

          const channelMatch = line.match(/^Channel\(s\)\s*:\s*(\d+)/);
          if (channelMatch) {
            const ch = parseInt(channelMatch[1], 10);
            if (ch === 1) track.channels = '1.0';
            else if (ch === 2) track.channels = '2.0';
            else if (ch === 6) track.channels = '5.1';
            else if (ch === 7) track.channels = '6.1';
            else if (ch === 8) track.channels = '7.1';
            else track.channels = `${ch}ch`;
          }

          const langMatch = line.match(/^Language\s*:\s*(.+)$/);
          if (langMatch) {
            track.language = langMatch[1].trim();
          }

          const titleMatch = line.match(/^Title\s*:\s*(.+)$/);
          if (titleMatch) {
            track.title = titleMatch[1].trim();
          }

          const defaultMatch = line.match(/^Default\s*:\s*(.+)$/);
          if (defaultMatch) {
            track.isDefault = defaultMatch[1].trim().toLowerCase() === 'yes';
          }
        }

        if (track.codec) {
          tracks.push(track);
        }
      }

      return tracks;
    },

    getHdrFromMediaInfo() {
      const hdrElements = document.querySelectorAll('.mediainfo__video dt');
      for (const dt of hdrElements) {
        if (dt.textContent.trim() === 'HDR') {
          const dd = dt.nextElementSibling;
          if (dd && dd.tagName === 'DD') {
            const hdrText = dd.textContent.trim();
            if (hdrText && hdrText !== 'Unknown') {
              return this.parseHdrFormats(hdrText);
            }
          }
        }
      }

      const mediaInfoText = this.getMediaInfoText();
      if (!mediaInfoText) return [];

      const hdrFormatMatch = mediaInfoText.match(/HDR format\s*:\s*(.+?)(?:\n|$)/i);
      if (hdrFormatMatch) {
        return this.parseHdrFormats(hdrFormatMatch[1]);
      }

      return [];
    },

    parseHdrFormats(hdrText) {
      const formats = [];
      const text = hdrText.toLowerCase();

      if (text.includes('dolby vision') || text.includes('dvhe')) {
        if (text.includes('profile 5') || text.includes('dvhe.05')) {
          formats.push('DV5');
        }
        else if (text.includes('profile 7') || text.includes('dvhe.07')) {
          formats.push('DV7');
        }
        else if (text.includes('profile 8') || text.includes('dvhe.08')) {
          formats.push('DV8');
        }
        else {
          formats.push('DV');
        }
      }

      if (text.includes('hdr10+') || text.includes('hdr10 plus') || text.includes('smpte st 2094')) {
        formats.push('HDR10+');
      }

      else if (text.includes('hdr10') || text.includes('smpte st 2086')) {
        formats.push('HDR10');
      }

      else if (text.includes('hdr') && !text.includes('dolby vision')) {
        formats.push('HDR');
      }

      if (text.includes('hlg')) {
        formats.push('HLG');
      }

      if (text.includes('pq') && !formats.length) {
        formats.push('PQ10');
      }

      return formats;
    },

    getModerationPanel() {
      const panels = document.querySelectorAll('section.panelV2');
      for (const panel of panels) {
        const heading = panel.querySelector('.panel__heading');
        if (heading && heading.textContent.includes('Moderation')) {
          return panel;
        }
      }
      return null;
    }
  };

  const Helpers = {
    extractReleaseGroup(name) {
      if (!name) return null;
      const match = name.match(/-([A-Za-z0-9$!._]+)$/);
      return match ? match[1] : null;
    },

    extractYear(name) {
      if (!name) return null;
      const match = name.match(/\b(19|20)\d{2}\b/);
      return match ? match[0] : null;
    },

    countScreenshots(descriptionHtml) {
      if (!descriptionHtml) return {
        count: 0,
        urls: []
      };

      const urls = [];

      const bbcodePattern = /\[img\](.*?)\[\/img\]/gi;
      let match;
      while ((match = bbcodePattern.exec(descriptionHtml)) !== null) {
        urls.push(match[1]);
      }

      const htmlPattern = /<img[^>]+src=["']([^"']+)["']/gi;
      while ((match = htmlPattern.exec(descriptionHtml)) !== null) {
        urls.push(match[1]);
      }

      const validUrls = urls.filter(url => {
        const lowerUrl = url.toLowerCase();
        const hasValidExtension = CONFIG.imageExtensions.some(ext => lowerUrl.includes(ext));
        const isKnownHost = CONFIG.imageHosts.some(host => lowerUrl.includes(host));
        const isTmdbMeta = lowerUrl.includes('image.tmdb.org') &&
          (lowerUrl.includes('/w342/') || lowerUrl.includes('/w500/') ||
            lowerUrl.includes('/w1280/') || lowerUrl.includes('/w138'));
        return (hasValidExtension || isKnownHost) && !isTmdbMeta;
      });

      const uniqueUrls = [...new Set(validUrls)];

      return {
        count: uniqueUrls.length,
        urls: uniqueUrls
      };
    },

    parseSeasonEpisode(name) {
      if (!name) return {
        season: null,
        episode: null,
        raw: null,
        isSeasonPack: false
      };

      const fullMatch = name.match(/S(\d{1,2})E(\d{1,2})/i);
      if (fullMatch) {
        return {
          season: parseInt(fullMatch[1], 10),
          episode: parseInt(fullMatch[2], 10),
          raw: fullMatch[0],
          isSeasonPack: false
        };
      }

      const seasonMatch = name.match(/\bS(\d{1,2})\b(?!E)/i);
      if (seasonMatch) {
        return {
          season: parseInt(seasonMatch[1], 10),
          episode: null,
          raw: seasonMatch[0],
          isSeasonPack: true
        };
      }

      return {
        season: null,
        episode: null,
        raw: null,
        isSeasonPack: false
      };
    },

    normalizeForComparison(str) {
      if (!str) return '';
      return str.toLowerCase()
        .replace(/['']/g, "'")
        .replace(/[""]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
    },

    detectAudioObject(mediaInfoText) {
      if (!mediaInfoText) return null;
      if (/(Dolby\s?Atmos|E-AC-3\s?JOC)/i.test(mediaInfoText)) return 'Atmos';
      if (/(Auro\s?3D)/i.test(mediaInfoText)) return 'Auro3D';
      return null;
    },

    extractTitleElements(torrentName, type) {
      if (!torrentName) return {
        elements: [],
        positions: {}
      };

      const elements = [];
      const positions = {};
      const name = torrentName;

      const recordElement = (elementType, match, index) => {
        if (match !== null && index !== -1) {
          elements.push({
            type: elementType,
            value: match,
            position: index
          });
          positions[elementType] = index;
        }
      };

      const yearMatch = name.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        recordElement('year', yearMatch[0], yearMatch.index);
      }

      const seasonMatch = name.match(/\bS(\d{1,2})(?:E(\d{1,2}))?\b/i);
      if (seasonMatch) {
        recordElement('season', seasonMatch[0], seasonMatch.index);
      }

      for (const res of CONFIG.validResolutions) {
        const idx = name.indexOf(res);
        if (idx !== -1) {
          recordElement('resolution', res, idx);
          break;
        }
      }

      const sortedHdr = [...CONFIG.hdrFormats].sort((a, b) => b.length - a.length);
      for (const hdr of sortedHdr) {
        const regex = new RegExp('\\b' + hdr.replace(/[+]/g, '\\+') + '\\b', 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('hdr', match[0], match.index);
          break;
        }
      }

      const sortedVideoCodecs = [...CONFIG.validVideoCodecs].sort((a, b) => b.length - a.length);
      for (const codec of sortedVideoCodecs) {
        const regex = new RegExp(codec.replace(/[.]/g, '\\.?'), 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('vcodec', match[0], match.index);
          break;
        }
      }

      const sortedAudioCodecs = [...CONFIG.validAudioCodecs].sort((a, b) => b.length - a.length);
      for (const codec of sortedAudioCodecs) {
        const regex = new RegExp(codec.replace(/[+]/g, '\\+').replace(/[-.]/g, '[-.]?'), 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('acodec', match[0], match.index);
          break;
        }
      }

      const channelMatch = name.match(/\b(\d{1,2}\.\d)\b/);
      if (channelMatch) {
        recordElement('channels', channelMatch[0], channelMatch.index);
      }

      const atmosMatch = name.match(/\bAtmos\b/i);
      const auroMatch = name.match(/\bAuro(?:3D)?\b/i);
      if (atmosMatch) {
        recordElement('object', atmosMatch[0], atmosMatch.index);
      }
      else if (auroMatch) {
        recordElement('object', auroMatch[0], auroMatch.index);
      }

      const allSources = [
        ...CONFIG.sources.fullDisc,
        ...CONFIG.sources.remux,
        ...CONFIG.sources.encode,
        ...CONFIG.sources.web,
        ...CONFIG.sources.hdtv
      ];
      const uniqueSources = [...new Set(allSources)].sort((a, b) => b.length - a.length);
      for (const source of uniqueSources) {
        const regex = new RegExp(source.replace(/[-.]/g, '[-. ]?'), 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('source', match[0], match.index);
          break;
        }
      }

      const typeMatch = name.match(/\b(REMUX|WEB-DL|WEBRip)\b/i);
      if (typeMatch) {
        recordElement('type', typeMatch[0], typeMatch.index);
      }

      for (const dub of CONFIG.dubs) {
        const regex = new RegExp(`\\b${dub.replace('-', '[-]?')}\\b`, 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('dub', match[0], match.index);
          break;
        }
      }

      for (const cut of CONFIG.cuts) {
        const regex = new RegExp(cut.replace(/'/g, "[']?"), 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('cut', match[0], match.index);
          break;
        }
      }

      for (const ratio of CONFIG.ratios) {
        const regex = new RegExp(` ${ratio} `, 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('ratio', ratio, match.index + 1);
          break;
        }
      }

      for (const repack of CONFIG.repacks) {
        const regex = new RegExp(`\\b${repack}\\b`, 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('repack', match[0], match.index);
          break;
        }
      }

      for (const edition of CONFIG.editions) {
        const regex = new RegExp(edition.replace(/'/g, "[']?"), 'i');
        const match = name.match(regex);
        if (match) {
          recordElement('edition', match[0], match.index);
          break;
        }
      }

      const match3d = name.match(/\b3D\b/);
      if (match3d) {
        recordElement('3d', '3D', match3d.index);
      }

      const groupMatch = name.match(/-([A-Za-z0-9$!._]+)$/);
      if (groupMatch) {
        recordElement('group', groupMatch[1], groupMatch.index);
      }

      elements.sort((a, b) => a.position - b.position);

      return {
        elements,
        positions
      };
    }
  };

  const Checks = {
    tmdbNameMatch(torrentName, tmdbTitle) {
      if (!tmdbTitle) {
        return {
          status: 'warn',
          message: 'TMDB title not found on page',
          details: null
        };
      }

      if (!torrentName) {
        return {
          status: 'fail',
          message: 'Torrent name not found',
          details: null
        };
      }

      const normalizedTorrent = Helpers.normalizeForComparison(torrentName);
      const normalizedTmdb = Helpers.normalizeForComparison(tmdbTitle);

      if (normalizedTorrent.startsWith(normalizedTmdb)) {
        return {
          status: 'pass',
          message: `"${tmdbTitle}" found at start of title`,
          details: null
        };
      }

      if (normalizedTmdb.startsWith('the ') &&
        normalizedTorrent.startsWith(normalizedTmdb.substring(4))) {
        return {
          status: 'warn',
          message: `"${tmdbTitle}" found (without "The" prefix)`,
          details: null
        };
      }

      const akaMatch = normalizedTorrent.match(/^(.+?)\s+aka\s+/i);
      if (akaMatch) {
        const beforeAka = akaMatch[1].trim();
        if (beforeAka === normalizedTmdb ||
          beforeAka === 'the ' + normalizedTmdb ||
          (normalizedTmdb.startsWith('the ') && beforeAka === normalizedTmdb.substring(4))) {
          return {
            status: 'pass',
            message: `"${tmdbTitle}" found (AKA format)`,
            details: null
          };
        }
      }

      return {
        status: 'fail',
        message: `Title should start with "${tmdbTitle}"`,
        details: {
          expected: tmdbTitle,
          found: torrentName.substring(0, Math.min(50, torrentName.length)) + (torrentName.length > 50 ? '...' : '')
        }
      };
    },

    movieFolderStructure(fileStructure, category, isTV, type) {
      const isFullDisc = CONFIG.fullDiscTypes.some(t => type?.includes(t));
      if (isFullDisc) {
        return {
          status: 'na',
          message: 'N/A - Full Disc (folder structure expected)',
          details: null
        };
      }

      if (isTV) {
        return {
          status: 'na',
          message: 'N/A - Folder structure check not applicable for TV',
          details: null
        };
      }

      const isMovie = category?.toLowerCase().includes('movie');
      if (!isMovie) {
        return {
          status: 'na',
          message: 'N/A - Not a movie',
          details: null
        };
      }

      if (!fileStructure) {
        return {
          status: 'warn',
          message: 'Could not determine file structure',
          details: null
        };
      }

      if (fileStructure.hasFolder) {
        if (fileStructure.fileCount === 1) {
          return {
            status: 'fail',
            message: 'Movie should not have a top-level folder',
            details: {
              found: `${fileStructure.folderName}/${fileStructure.files[0] || '...'}`,
              expected: fileStructure.files[0] || 'Single file without folder wrapper'
            }
          };
        }

        return {
          status: 'warn',
          message: `Movie has folder with ${fileStructure.fileCount} files`,
          details: {
            folder: fileStructure.folderName,
            fileCount: fileStructure.fileCount
          }
        };
      }

      return {
        status: 'pass',
        message: 'File structure correct (no folder wrapper)',
        details: null
      };
    },

    seasonEpisodeFormat(torrentName, isTV) {
      if (!isTV) {
        return {
          status: 'na',
          message: 'N/A - Not TV content',
          details: null
        };
      }

      const parsed = Helpers.parseSeasonEpisode(torrentName);
      const fullMatch = torrentName.match(/S(\d{2,})E(\d{2,})/i);
      const seasonOnlyMatch = torrentName.match(/\bS(\d{2,})\b(?!E)/i);

      if (fullMatch) {
        return {
          status: 'pass',
          message: `Episode format correct: S${fullMatch[1]}E${fullMatch[2]}`,
          details: null
        };
      }

      if (seasonOnlyMatch) {
        return {
          status: 'pass',
          message: `Season pack format correct: S${seasonOnlyMatch[1]}`,
          details: null
        };
      }

      const badFullFormat = torrentName.match(/S(\d)E(\d)(?!\d)/i);
      const badSeasonFormat = torrentName.match(/\bS(\d)\b(?!E|\d)/i);

      if (badFullFormat) {
        return {
          status: 'fail',
          message: `Season/Episode must be zero-padded: found S${badFullFormat[1]}E${badFullFormat[2]}, expected S0${badFullFormat[1]}E0${badFullFormat[2]}`,
          details: null
        };
      }

      if (badSeasonFormat) {
        return {
          status: 'fail',
          message: `Season must be zero-padded: found S${badSeasonFormat[1]}, expected S0${badSeasonFormat[1]}`,
          details: null
        };
      }

      return {
        status: 'fail',
        message: 'No S##E## or S## format found in TV content title',
        details: null
      };
    },

    namingGuideCompliance(torrentName, type, mediaInfoText) {
      const results = {
        status: 'pass',
        checks: []
      };

      const name = torrentName || '';
      const isTV = DataExtractor.isTV();

      const yearMatch = Helpers.extractYear(name);
      let yearStatus = 'fail';
      let yearMessage = 'No year found';

      if (yearMatch) {
        if (name.includes(`(${yearMatch})`)) {
          yearStatus = 'warn';
          yearMessage = `Found: (${yearMatch}) - Remove parentheses`;
        }
        else {
          yearStatus = 'pass';
          yearMessage = `Found: ${yearMatch}`;
        }
      }
      else {
        if (isTV) {
          yearStatus = 'pass';
          yearMessage = 'No year found (Optional for TV)';
        }
        else {
          yearStatus = 'fail';
          yearMessage = 'No year found (Required for Movies)';
        }
      }

      results.checks.push({
        name: 'Year',
        status: yearStatus,
        message: yearMessage,
        required: !isTV
      });

      const resMatch = CONFIG.validResolutions.find(r => name.includes(r));
      const isDvdSource = /\b(NTSC|PAL)\b/i.test(name);
      const resFound = resMatch || isDvdSource;
      const resLabel = resMatch ? resMatch : (isDvdSource ? name.match(/\b(NTSC|PAL)\b/i)[1] : null);
      results.checks.push({
        name: 'Resolution',
        status: resFound ? 'pass' : 'fail',
        message: resFound ? `Found: ${resLabel}` : 'No valid resolution found',
        required: true
      });

      const sortedCodecs = [...CONFIG.validAudioCodecs].sort((a, b) => b.length - a.length);
      let audioMatch = null;
      for (const codec of sortedCodecs) {
        const regex = new RegExp(codec.replace(/[+]/g, '\\+').replace(/[-.]/g, '[-.]?'), 'i');
        if (regex.test(name)) {
          audioMatch = codec;
          break;
        }
      }
      results.checks.push({
        name: 'Audio Codec',
        status: audioMatch ? 'pass' : 'fail',
        message: audioMatch ? `Found: ${audioMatch}` : 'No audio codec found',
        required: true
      });

      const channelMatch = name.match(/\b(\d{1,2}\.\d)\b/);
      results.checks.push({
        name: 'Channels',
        status: channelMatch ? 'pass' : 'fail',
        message: channelMatch ? `Found: ${channelMatch[1]}` : 'No channel config found (e.g., 5.1)',
        required: true
      });

      const groupMatch = Helpers.extractReleaseGroup(name);
      results.checks.push({
        name: 'Release Group',
        status: groupMatch ? 'pass' : 'fail',
        message: groupMatch ? `Found: ${groupMatch}` : 'No release group tag found (should end with -GROUP)',
        required: true
      });

      const isFullDiscNaming = CONFIG.fullDiscTypes.some(t => type?.includes(t));
      const detectedObject = isFullDiscNaming ? null : Helpers.detectAudioObject(mediaInfoText);
      const titleHasAtmos = /Atmos/i.test(name);
      const titleHasAuro = /Auro/i.test(name);
      let objectStatus = 'pass';
      let objectMessage = 'No object audio detected';

      if (detectedObject === 'Atmos') {
        if (titleHasAtmos) {
          objectStatus = 'pass';
          objectMessage = 'Atmos detected & in title';
        }
        else {
          objectStatus = 'warn';
          objectMessage = 'Atmos detected in MediaInfo but missing from Title';
        }
      }
      else if (detectedObject === 'Auro3D') {
        if (titleHasAuro) {
          objectStatus = 'pass';
          objectMessage = 'Auro3D detected & in title';
        }
        else {
          objectStatus = 'warn';
          objectMessage = 'Auro3D detected in MediaInfo but missing from Title';
        }
      }
      else if (titleHasAtmos || titleHasAuro) {
        if (isFullDiscNaming) {
          objectStatus = 'pass';
          objectMessage = `${titleHasAtmos ? 'Atmos' : 'Auro3D'} in title (Full Disc - MediaInfo not validated)`;
        }
        else {
          objectStatus = 'warn';
          objectMessage = 'Object tag in title but not confirmed in MediaInfo';
        }
      }

      if (detectedObject || titleHasAtmos || titleHasAuro) {
        results.checks.push({
          name: 'Audio Object',
          status: objectStatus,
          message: objectMessage,
          required: !!detectedObject
        });
      }

      const sourceCheck = this.checkSourceForType(name, type);
      results.checks.push(sourceCheck);

      const sortedVideoCodecs = [...CONFIG.validVideoCodecs].sort((a, b) => b.length - a.length);
      let videoMatch = null;
      for (const codec of sortedVideoCodecs) {
        const regex = new RegExp(codec.replace(/[.]/g, '\\.?'), 'i');
        if (regex.test(name)) {
          videoMatch = codec;
          break;
        }
      }
      const isFullDiscOrRemux = CONFIG.fullDiscTypes.some(t => type?.includes(t)) ||
        CONFIG.remuxTypes.some(t => type?.toUpperCase().includes(t.toUpperCase()));
      results.checks.push({
        name: 'Video Codec',
        status: videoMatch ? 'pass' : (isFullDiscOrRemux ? 'na' : 'warn'),
        message: videoMatch ? `Found: ${videoMatch}` : (isFullDiscOrRemux ? 'N/A for Full Disc/REMUX' : 'No video codec found (may be implied)'),
        required: false
      });

      if (name.includes('2160p') || name.includes('4320p')) {
        const mediaInfoHdr = DataExtractor.getHdrFromMediaInfo();

        // Extract the single best (longest) HDR tag from the title.
        // Sorted longest-first so compound tags like "DV HDR10+" match
        // before their components "DV", "HDR10+", "HDR", etc.
        const sortedHdr = [...CONFIG.hdrFormats].sort((a, b) => b.length - a.length);
        let titleHdrTag = null;
        for (const hdr of sortedHdr) {
          const regex = new RegExp('(?:^|\\s)' + hdr.replace(/[+]/g, '\\+') + '(?:\\s|$)', 'i');
          if (regex.test(name)) {
            titleHdrTag = hdr.toUpperCase();
            break;
          }
        }

        let hdrStatus = 'pass';
        let hdrMessage = '';

        // "HDR10" alone in title is always wrong - should be "HDR"
        const hasHDR10InTitleRaw = /\bHDR10\b/i.test(name) && !/\bHDR10\+/i.test(name);

        if (hasHDR10InTitleRaw && (!titleHdrTag || titleHdrTag === 'HDR10')) {
          hdrStatus = 'fail';
          hdrMessage = '"HDR10" in title should be renamed to "HDR"';
        }
        else if (isFullDiscNaming) {
          if (titleHdrTag) {
            hdrStatus = 'pass';
            hdrMessage = `HDR in title: ${titleHdrTag} (Full Disc - MediaInfo not validated)`;
          }
          else {
            hdrMessage = 'SDR (no HDR in title)';
          }
        }
        else if (mediaInfoHdr.length === 0) {
          if (!titleHdrTag) {
            hdrMessage = 'SDR (no HDR in title or MediaInfo)';
          }
          else {
            hdrStatus = 'warn';
            hdrMessage = `Title has ${titleHdrTag} but MediaInfo shows no HDR`;
          }
        }
        else {
          const mediaInfoDisplay = mediaInfoHdr.join(', ');
          const hasDV = mediaInfoHdr.some(f => f.startsWith('DV'));
          const hasHDR10Plus = mediaInfoHdr.includes('HDR10+');
          const hasHDR10 = mediaInfoHdr.includes('HDR10');
          const hasHDR = mediaInfoHdr.includes('HDR');

          let expectedTag = null;
          if (hasDV && hasHDR10Plus) {
            expectedTag = 'DV HDR10+';
          }
          else if (hasDV && (hasHDR10 || hasHDR)) {
            expectedTag = 'DV HDR';
          }
          else if (hasDV) {
            expectedTag = 'DV';
          }
          else if (hasHDR10Plus) {
            expectedTag = 'HDR10+';
          }
          else if (hasHDR10) {
            expectedTag = 'HDR';
          }
          else if (hasHDR) {
            expectedTag = 'HDR';
          }

          if (titleHdrTag && expectedTag && titleHdrTag === expectedTag.toUpperCase()) {
            hdrStatus = 'pass';
            hdrMessage = `Correct: ${expectedTag} (MediaInfo: ${mediaInfoDisplay})`;
          }
          else if (!titleHdrTag && !expectedTag) {
            hdrMessage = 'SDR (no HDR in title or MediaInfo)';
          }
          else if (!titleHdrTag) {
            hdrStatus = 'fail';
            hdrMessage = `Missing HDR tag - MediaInfo shows ${mediaInfoDisplay}, title should include: ${expectedTag}`;
          }
          else if (!expectedTag) {
            hdrStatus = 'warn';
            hdrMessage = `Title has ${titleHdrTag} but could not determine expected tag from MediaInfo (${mediaInfoDisplay})`;
          }
          else {
            hdrStatus = 'fail';
            hdrMessage = `Wrong HDR tag - MediaInfo shows ${mediaInfoDisplay}, title has ${titleHdrTag} but should be: ${expectedTag}`;
          }
        }

        results.checks.push({
          name: 'HDR Format',
          status: hdrStatus,
          message: hdrMessage,
          required: false
        });
      }

      const hasFailedRequired = results.checks.some(c => c.required && c.status === 'fail');
      const hasWarnings = results.checks.some(c => c.status === 'warn');
      results.status = hasFailedRequired ? 'fail' : (hasWarnings ? 'warn' : 'pass');

      return results;
    },

    checkSourceForType(torrentName, type) {
      const name = torrentName.toUpperCase();
      const normalizedType = type?.toUpperCase() || '';

      let validSources = [];
      let typeCategory = 'Unknown';

      if (CONFIG.fullDiscTypes.some(t => normalizedType.includes(t.toUpperCase()))) {
        validSources = CONFIG.sources.fullDisc;
        typeCategory = 'Full Disc';
      }
      else if (CONFIG.remuxTypes.some(t => normalizedType.includes(t.toUpperCase()))) {
        validSources = CONFIG.sources.remux;
        typeCategory = 'REMUX';
      }
      else if (CONFIG.encodeTypes.some(t => normalizedType.includes(t.toUpperCase()))) {
        validSources = CONFIG.sources.encode;
        typeCategory = 'Encode';
      }
      else if (CONFIG.webTypes.some(t => normalizedType.includes(t.toUpperCase()))) {
        validSources = [...CONFIG.sources.web, ...CONFIG.streamingServices];
        typeCategory = 'WEB';
      }
      else if (CONFIG.hdtvTypes.some(t => normalizedType.includes(t.toUpperCase()))) {
        validSources = CONFIG.sources.hdtv;
        typeCategory = 'HDTV';
      }
      else {
        validSources = [
          ...CONFIG.sources.fullDisc,
          ...CONFIG.sources.remux,
          ...CONFIG.sources.encode,
          ...CONFIG.sources.web,
          ...CONFIG.sources.hdtv,
          ...CONFIG.streamingServices
        ];
        validSources = [...new Set(validSources)];
      }

      let sourceMatch = null;
      for (const source of validSources) {
        const regex = new RegExp(source.replace(/[-.]/g, '[-. ]?'), 'i');
        if (regex.test(torrentName)) {
          sourceMatch = source;
          break;
        }
      }

      if (!sourceMatch && typeCategory === 'Encode') {
        if (/blu-?ray/i.test(torrentName)) {
          sourceMatch = 'BluRay';
        }
      }

      return {
        name: 'Source',
        status: sourceMatch ? 'pass' : 'fail',
        message: sourceMatch ?
          `Found: ${sourceMatch}${typeCategory !== 'Unknown' ? ` (valid for ${typeCategory})` : ''}` : `No valid source for ${typeCategory} type`,
        required: true
      };
    },

    titleElementOrder(torrentName, type) {
      const {
        elements,
        positions
      } = Helpers.extractTitleElements(torrentName, type);

      if (elements.length < 3) {
        return {
          status: 'warn',
          message: 'Too few elements detected to validate order',
          details: null,
          violations: []
        };
      }

      const isFullDiscOrRemux = CONFIG.fullDiscTypes.some(t => type?.includes(t)) ||
        CONFIG.remuxTypes.some(t => type?.toUpperCase().includes(t.toUpperCase()));

      const expectedOrder = isFullDiscOrRemux ?
        CONFIG.titleElementOrder.fullDiscRemux :
        CONFIG.titleElementOrder.encodeWeb;

      const orderType = isFullDiscOrRemux ? 'Full Disc/REMUX' : 'Encode/WEB';

      const violations = [];
      const detectedTypes = elements.map(e => e.type);

      for (let i = 0; i < detectedTypes.length; i++) {
        for (let j = i + 1; j < detectedTypes.length; j++) {
          const first = detectedTypes[i];
          const second = detectedTypes[j];

          const expectedFirstIdx = expectedOrder.indexOf(first);
          const expectedSecondIdx = expectedOrder.indexOf(second);

          if (expectedFirstIdx === -1 || expectedSecondIdx === -1) continue;

          if (expectedFirstIdx > expectedSecondIdx) {
            violations.push({
              first: {
                type: first,
                value: elements[i].value
              },
              second: {
                type: second,
                value: elements[j].value
              },
              message: `"${elements[i].value}" (${first}) should come after "${elements[j].value}" (${second})`
            });
          }
        }
      }

      if (violations.length === 0) {
        return {
          status: 'pass',
          message: `Element order correct for ${orderType}`,
          details: null,
          violations: []
        };
      }

      const hdrVcodecViolation = violations.find(v =>
        (v.first.type === 'hdr' && v.second.type === 'vcodec') ||
        (v.first.type === 'vcodec' && v.second.type === 'hdr')
      );

      let message = `${violations.length} ordering issue(s) found`;
      if (hdrVcodecViolation) {
        if (isFullDiscOrRemux) {
          message = 'HDR should come BEFORE video codec for Full Disc/REMUX';
        }
        else {
          message = 'HDR should come AFTER video codec for Encode/WEB';
        }
      }

      return {
        status: 'fail',
        message: message,
        details: {
          orderType: orderType,
          violations: violations.map(v => v.message)
        },
        violations: violations
      };
    },

    audioTagCompliance(torrentName, originalLangCode, mediaInfoLanguages, type, mediaInfoText) {
      const isFullDisc = CONFIG.fullDiscTypes.some(t => type?.includes(t));
      if (isFullDisc) {
        return {
          status: 'na',
          message: 'N/A - Full Disc (no MediaInfo)',
          details: null,
          checks: []
        };
      }

      const checks = [];

      if (mediaInfoLanguages && mediaInfoLanguages.length > 0) {
        const lowerName = (torrentName || '').toLowerCase();
        const isDual = lowerName.includes('dual-audio') || lowerName.includes('dual audio');
        const isMulti = lowerName.includes('multi');
        const count = mediaInfoLanguages.length;

        const mappedOriginal = CONFIG.languageMap[originalLangCode] || originalLangCode;
        const originalIsEnglish = originalLangCode === 'en';

        const isEnglish = (lang) => lang.toLowerCase().startsWith('english');

        const matchesOriginal = (lang) => {
          if (!mappedOriginal) return false;
          const lowerLang = lang.toLowerCase();
          const lowerOriginal = mappedOriginal.toLowerCase();
          return lowerLang === lowerOriginal ||
            lowerLang.startsWith(lowerOriginal) ||
            lowerLang.includes(lowerOriginal);
        };

        if (isDual) {
          if (originalIsEnglish) {
            checks.push({
              name: 'Language Tags',
              status: 'fail',
              message: 'Dual-Audio invalid for English-original content'
            });
          }
          else if (count > 2) {
            checks.push({
              name: 'Language Tags',
              status: 'fail',
              message: `Tagged Dual-Audio but found ${count} languages. Should be "Multi"`
            });
          }
          else if (count < 2) {
            checks.push({
              name: 'Language Tags',
              status: 'fail',
              message: `Tagged Dual-Audio but found only ${count} language`
            });
          }
          else {
            const hasEnglish = mediaInfoLanguages.some(isEnglish);
            const hasOriginal = mediaInfoLanguages.some(matchesOriginal);

            if (!hasEnglish) {
              checks.push({
                name: 'Language Tags',
                status: 'fail',
                message: 'Dual-Audio requires English track'
              });
            }
            else if (!hasOriginal) {
              checks.push({
                name: 'Language Tags',
                status: 'warn',
                message: `Dual-Audio implies Original Language (${mappedOriginal}) present`
              });
            }
            else {
              checks.push({
                name: 'Language Tags',
                status: 'pass',
                message: `Dual-Audio correct (English + ${mappedOriginal})`
              });
            }
          }
        }
        else if (isMulti) {
          if (count < 2) {
            checks.push({
              name: 'Language Tags',
              status: 'fail',
              message: `"Multi" used but found only ${count} language`
            });
          }
          else {
            checks.push({
              name: 'Language Tags',
              status: 'pass',
              message: `Multi-Audio correct (${count} languages)`
            });
          }
        }
        else if (count > 2) {
          checks.push({
            name: 'Language Tags',
            status: 'warn',
            message: `Found ${count} languages but no "Multi" tag`
          });
        }
        else if (count === 2) {
          const hasEnglish = mediaInfoLanguages.some(isEnglish);
          const hasOriginal = mediaInfoLanguages.some(matchesOriginal);

          if (hasEnglish && hasOriginal && !originalIsEnglish) {
            checks.push({
              name: 'Language Tags',
              status: 'warn',
              message: `Found English + Original (${mappedOriginal}), consider "Dual-Audio" tag`
            });
          }
          else {
            checks.push({
              name: 'Language Tags',
              status: 'pass',
              message: `Audio languages OK (${count})`
            });
          }
        }
        else {
          checks.push({
            name: 'Language Tags',
            status: 'pass',
            message: `Audio languages OK (${count})`
          });
        }
      }

      const tracks = DataExtractor.getAudioTracksFromMediaInfo();

      if (tracks.length > 0) {
        const isUntouched = CONFIG.remuxTypes.some(t => type?.toUpperCase().includes(t.toUpperCase())) ||
          /\b(HDTV|PDTV|SDTV)\b/i.test(type || '') ||
          /\bDVD\b/i.test(type || '');

        const isHdtvOrDvd = /\b(HDTV|PDTV|SDTV|DVD)\b/i.test(type || '') || isUntouched;

        const normalizeCodec = (format, commercialName) => {
          const f = (format || '').toLowerCase();
          const c = (commercialName || '').toLowerCase();

          if (f.includes('dts') && (c.includes('dts-hd') || c.includes('dts:x') || c.includes('master audio') || c.includes('dts-hd ma'))) return 'DTS-HD';
          if (f.includes('dts')) return 'DTS';
          if (f === 'ac-3' || f.includes('ac-3')) return 'AC-3';
          if (f === 'e-ac-3' || f.includes('e-ac-3')) return 'E-AC-3';
          if (f.includes('mlp fba') || c.includes('truehd')) return 'TrueHD';
          if (f === 'flac' || f.includes('flac')) return 'FLAC';
          if (f === 'opus' || f.includes('opus')) return 'Opus';
          if (f === 'pcm' || f.includes('pcm') || f.includes('lpcm')) return 'LPCM';
          if (f === 'aac' || f.includes('aac')) return 'AAC';
          if (f === 'mpeg audio' && c.includes('mp2')) return 'MP2';
          if (f === 'mpeg audio' && c.includes('mp3')) return 'MP3';
          if (f.includes('mp3') || (f === 'mpeg audio' && !c)) return 'MP3';
          if (f.includes('mp2')) return 'MP2';
          if (f.includes('vorbis')) return 'Vorbis';
          if (f.includes('alac')) return 'ALAC';
          return format;
        };

        const isStereoOrMono = (channels) => {
          if (!channels) return false;
          return channels === '1.0' || channels === '2.0' || channels === '1ch' || channels === '2ch';
        };

        const isCommentary = (track) => {
          const title = (track.title || '').toLowerCase();
          return title.includes('commentary') || title.includes('comment');
        };

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];
          const codec = normalizeCodec(track.codec, track.commercialName);
          const label = `Track ${i + 1}: ${codec}${track.channels ? ' ' + track.channels : ''}${track.language ? ' (' + track.language + ')' : ''}`;

          if (codec === 'FLAC' || codec === 'Opus' || codec === 'LPCM') {
            if (!isStereoOrMono(track.channels) && !isUntouched) {
              checks.push({
                name: label,
                status: 'fail',
                message: `${codec} only allowed as mono/stereo. Found: ${track.channels || 'unknown'}`
              });
            }
            else {
              checks.push({
                name: label,
                status: 'pass',
                message: isStereoOrMono(track.channels) ? `${codec} mono/stereo OK` : `${codec} multichannel (untouched OK)`
              });
            }
          }
          else if (codec === 'MP2') {
            if (!isHdtvOrDvd) {
              checks.push({
                name: label,
                status: 'fail',
                message: 'MP2 only allowed if untouched (HDTV/DVD)'
              });
            }
            else {
              checks.push({
                name: label,
                status: 'pass',
                message: 'MP2 OK (untouched source)'
              });
            }
          }
          else if (codec === 'MP3') {
            if (!isCommentary(track)) {
              checks.push({
                name: label,
                status: 'warn',
                message: 'MP3 only allowed for supplementary tracks (e.g. commentary)'
              });
            }
            else {
              checks.push({
                name: label,
                status: 'pass',
                message: 'MP3 OK (commentary track)'
              });
            }
          }
          else if (codec === 'Vorbis' || codec === 'ALAC') {
            checks.push({
              name: label,
              status: 'fail',
              message: `${codec} is not an allowed audio codec`
            });
          }
          else if (['DTS', 'DTS-HD', 'AC-3', 'E-AC-3', 'TrueHD', 'AAC'].includes(codec)) {
            checks.push({
              name: label,
              status: 'pass',
              message: `${codec} OK`
            });
          }
          else {
            checks.push({
              name: label,
              status: 'warn',
              message: `Unrecognized codec: ${track.codec}${track.commercialName ? ' / ' + track.commercialName : ''}`
            });
          }
        }
      }

      if (checks.length === 0) {
        return {
          status: 'na',
          message: 'No audio data detected in MediaInfo',
          details: null,
          checks: []
        };
      }

      const hasFails = checks.some(c => c.status === 'fail');
      const hasWarns = checks.some(c => c.status === 'warn');
      const overallStatus = hasFails ? 'fail' : (hasWarns ? 'warn' : 'pass');

      return {
        status: overallStatus,
        message: overallStatus === 'pass' ?
          `Audio OK (${tracks.length} track${tracks.length !== 1 ? 's' : ''})` :
          `Audio issues found`,
        details: null,
        checks: checks
      };
    },

    mediaInfoPresent(hasMediaInfo, hasBdInfo, type) {
      const isFullDisc = CONFIG.fullDiscTypes.some(t => type?.includes(t));

      if (isFullDisc) {
        if (hasBdInfo) {
          return {
            status: 'pass',
            message: 'BDInfo present (Full Disc)',
            details: null
          };
        }
        else if (hasMediaInfo) {
          return {
            status: 'warn',
            message: 'BDInfo expected for Full Disc',
            details: null
          };
        }
        else {
          return {
            status: 'fail',
            message: 'BDInfo required for Full Disc uploads',
            details: null
          };
        }
      }
      else {
        if (hasBdInfo) {
          return {
            status: 'fail',
            message: 'Release is not Full Disc, BDInfo should be empty',
            details: null
          };
        }
        else if (hasMediaInfo) {
          return {
            status: 'pass',
            message: 'MediaInfo Present',
            details: null
          };
        }
        else {
          return {
            status: 'fail',
            message: 'MediaInfo Required',
            details: null
          };
        }
      }
    },

    subtitleRequirement(mediaInfoLanguages, mediaInfoSubtitles, originalLangCode, type) {
      const isFullDisc = CONFIG.fullDiscTypes.some(t => type?.includes(t));
      if (isFullDisc) {
        return {
          status: 'na',
          message: 'N/A - Full Disc (no MediaInfo)',
          details: null
        };
      }

      if (!mediaInfoLanguages || mediaInfoLanguages.length === 0) {
        return {
          status: 'na',
          message: 'No audio languages detected',
          details: null
        };
      }

      const isEnglish = (lang) => {
        const lower = lang.toLowerCase();
        return lower === 'english' || lower.startsWith('english');
      };

      const hasEnglishAudio = mediaInfoLanguages.some(isEnglish);

      if (hasEnglishAudio) {
        return {
          status: 'pass',
          message: 'English audio present - subtitles optional',
          details: null
        };
      }

      if (!mediaInfoSubtitles || mediaInfoSubtitles.length === 0) {
        return {
          status: 'fail',
          message: 'No English audio & no subtitles detected',
          details: {
            audio: mediaInfoLanguages.join(', '),
            expected: 'English subtitles required for non-English audio'
          }
        };
      }

      const hasEnglishSubs = mediaInfoSubtitles.some(isEnglish);

      if (hasEnglishSubs) {
        return {
          status: 'pass',
          message: `Non-English audio with English subtitles`,
          details: null
        };
      }

      return {
        status: 'fail',
        message: 'Non-English audio requires English subtitles',
        details: {
          audio: mediaInfoLanguages.join(', '),
          subtitles: mediaInfoSubtitles.join(', ') || 'None detected',
          expected: 'English subtitles'
        }
      };
    },

    screenshotCount(descriptionHtml) {
      const {
        count,
        urls
      } = Helpers.countScreenshots(descriptionHtml);

      if (count >= CONFIG.minScreenshots) {
        return {
          status: 'pass',
          count,
          message: `${count} screenshots found`,
          details: null
        };
      }
      else if (count > 0) {
        return {
          status: 'warn',
          count,
          message: `Only ${count} screenshot(s) found (${CONFIG.minScreenshots}+ required)`,
          details: null
        };
      }
      else {
        return {
          status: 'fail',
          count: 0,
          message: 'No screenshots found in description',
          details: null
        };
      }
    },

    containerFormat(fileStructure, type) {
      const isFullDisc = CONFIG.fullDiscTypes.some(t => type?.includes(t));

      if (isFullDisc) {
        return {
          status: 'na',
          message: 'N/A - Full Disc uploads use native folder structure',
          details: null
        };
      }

      if (!fileStructure || !fileStructure.files || fileStructure.files.length === 0) {
        return {
          status: 'warn',
          message: 'Could not determine file structure to verify container',
          details: null
        };
      }

      const videoExtensions = ['.mkv', '.mp4', '.avi', '.wmv', '.m4v', '.ts', '.m2ts', '.vob', '.mpg', '.mpeg', '.mov', '.flv', '.webm'];
      const videoFiles = fileStructure.files.filter(f => {
        const lower = f.toLowerCase();
        return videoExtensions.some(ext => lower.endsWith(ext));
      });

      if (videoFiles.length === 0) {
        return {
          status: 'warn',
          message: 'No video files detected in file list',
          details: null
        };
      }

      const nonMkv = videoFiles.filter(f => !f.toLowerCase().endsWith('.mkv'));

      if (nonMkv.length === 0) {
        return {
          status: 'pass',
          message: `MKV container verified (${videoFiles.length} video file${videoFiles.length > 1 ? 's' : ''})`,
          details: null
        };
      }

      const badExtensions = [...new Set(nonMkv.map(f => f.split('.').pop().toUpperCase()))];
      return {
        status: 'fail',
        message: `Non-MKV container detected: ${badExtensions.join(', ')}`,
        details: {
          expected: 'MKV container for all non-Full Disc releases',
          found: nonMkv.join(', ')
        }
      };
    },

    packUniformity(fileStructure, type) {
      const isFullDisc = CONFIG.fullDiscTypes.some(t => type?.includes(t));
      if (isFullDisc) {
        return {
          status: 'na',
          message: 'N/A - Full Disc',
          details: null,
          checks: []
        };
      }

      if (!fileStructure || !fileStructure.files || fileStructure.files.length === 0) {
        return {
          status: 'na',
          message: 'N/A - No files detected',
          details: null,
          checks: []
        };
      }

      const videoExtensions = ['.mkv', '.mp4', '.avi', '.wmv', '.m4v', '.ts', '.m2ts', '.vob', '.mpg', '.mpeg', '.mov', '.flv', '.webm'];
      const videoFiles = fileStructure.files.filter(f => {
        const lower = f.toLowerCase();
        return videoExtensions.some(ext => lower.endsWith(ext));
      });

      if (videoFiles.length < 2) {
        return {
          status: 'na',
          message: 'N/A - Single file upload',
          details: null,
          checks: []
        };
      }

      const parseFileAttributes = (fileName) => {
        const attrs = {};

        const resMatch = CONFIG.validResolutions.find(r => fileName.includes(r));
        attrs.resolution = resMatch || null;

        const sourcePatterns = [{
            pattern: /\bWEB-DL\b/i,
            name: 'WEB-DL'
          },
          {
            pattern: /\bWEBRip\b/i,
            name: 'WEBRip'
          },
          {
            pattern: /\bWEB\b/i,
            name: 'WEB'
          },
          {
            pattern: /\bBlu-?Ray\b/i,
            name: 'BluRay'
          },
          {
            pattern: /\bREMUX\b/i,
            name: 'REMUX'
          },
          {
            pattern: /\bHDTV\b/i,
            name: 'HDTV'
          },
          {
            pattern: /\bSDTV\b/i,
            name: 'SDTV'
          },
          {
            pattern: /\bDVDRip\b/i,
            name: 'DVDRip'
          },
          {
            pattern: /\bBDRip\b/i,
            name: 'BDRip'
          },
          {
            pattern: /\bBRRip\b/i,
            name: 'BRRip'
          },
          {
            pattern: /\bHDDVD\b/i,
            name: 'HDDVD'
          },
          {
            pattern: /\bWEBDL\b/i,
            name: 'WEB-DL'
          }
        ];
        attrs.source = null;
        for (const sp of sourcePatterns) {
          if (sp.pattern.test(fileName)) {
            attrs.source = sp.name;
            break;
          }
        }

        const sortedAudio = [...CONFIG.validAudioCodecs].sort((a, b) => b.length - a.length);
        attrs.audioCodec = null;
        for (const codec of sortedAudio) {
          const regex = new RegExp(codec.replace(/[+]/g, '\\+').replace(/[-.]/g, '[-.]?'), 'i');
          if (regex.test(fileName)) {
            attrs.audioCodec = codec;
            break;
          }
        }

        const chanMatch = fileName.match(/(\d{1,2}\.\d)(?!\d)/);
        attrs.channels = chanMatch ? chanMatch[1] : null;

        const sortedVideo = [...CONFIG.validVideoCodecs].sort((a, b) => b.length - a.length);
        attrs.videoCodec = null;
        for (const codec of sortedVideo) {
          const regex = new RegExp(codec.replace(/[.]/g, '\\.?'), 'i');
          if (regex.test(fileName)) {
            attrs.videoCodec = codec;
            break;
          }
        }

        const groupMatch = fileName.match(/-([A-Za-z0-9$!._]+?)(?:\.[a-z0-9]+)?$/i);
        attrs.group = groupMatch ? groupMatch[1] : null;

        return attrs;
      };

      const parsed = videoFiles.map(f => ({
        file: f,
        attrs: parseFileAttributes(f)
      }));

      const attributeNames = [{
          key: 'resolution',
          label: 'Resolution'
        },
        {
          key: 'source',
          label: 'Source/Format'
        },
        {
          key: 'audioCodec',
          label: 'Audio Codec'
        },
        {
          key: 'videoCodec',
          label: 'Video Codec'
        },
        {
          key: 'group',
          label: 'Release Group'
        }
      ];

      const checks = [];
      let hasFail = false;

      for (const {
          key,
          label
        }
        of attributeNames) {
        const values = parsed.map(p => p.attrs[key]).filter(v => v !== null);
        const unique = [...new Set(values.map(v => v.toUpperCase()))];

        if (values.length === 0) {
          checks.push({
            name: label,
            status: 'warn',
            message: `Could not detect ${label.toLowerCase()} in filenames`
          });
        }
        else if (unique.length === 1) {
          checks.push({
            name: label,
            status: 'pass',
            message: `Uniform: ${values[0]}`
          });
        }
        else {
          hasFail = true;
          const valueCounts = {};
          values.forEach(v => {
            const upper = v.toUpperCase();
            valueCounts[upper] = (valueCounts[upper] || 0) + 1;
          });
          const breakdown = Object.entries(valueCounts)
            .map(([val, count]) => `${val} (${count})`)
            .join(', ');

          checks.push({
            name: label,
            status: 'fail',
            message: `Mixed: ${breakdown}`
          });
        }
      }

      const hasWarns = checks.some(c => c.status === 'warn');
      const overallStatus = hasFail ? 'fail' : (hasWarns ? 'warn' : 'pass');

      return {
        status: overallStatus,
        message: hasFail ?
          `Mixed pack detected across ${videoFiles.length} files` :
          `Uniform across ${videoFiles.length} files`,
        details: null,
        checks: checks
      };
    },

    bannedReleaseGroup(torrentName) {
      const group = Helpers.extractReleaseGroup(torrentName);

      if (!group) {
        return {
          status: 'warn',
          group: null,
          message: 'Could not extract release group from title',
          alert: false
        };
      }

      const isBanned = CONFIG.bannedGroups.some(
        banned => banned.toLowerCase() === group.toLowerCase()
      );

      if (isBanned) {
        return {
          status: 'fail',
          group,
          message: `BANNED GROUP: ${group}`,
          alert: true
        };
      }

      return {
        status: 'pass',
        group,
        message: `Release Group: ${group}`,
        alert: false
      };
    }
  };

  const UI = {
  getStatusIcon(status) {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warn': return '⚠️';
      case 'na': return '➖';
      default: return '❓';
    }
  },

  getStatusClass(status) {
    switch (status) {
      case 'pass': return 'mod-helper-pass';
      case 'fail': return 'mod-helper-fail';
      case 'warn': return 'mod-helper-warn';
      case 'na': return 'mod-helper-na';
      default: return '';
    }
  },

  createPanel(results) {
    const allStatuses = [
      results.tmdbMatch.status,
      results.seasonEpisode.status,
      results.namingGuide.status,
      results.elementOrder.status,
      results.folderStructure.status,
      results.mediaInfo.status,
      results.audioTags.status,
      results.subtitleRequirement.status,
      results.screenshots.status,
      results.bannedGroup.status,
      results.containerFormat.status,
      results.packUniformity.status
    ].filter(s => s !== 'na');

    const hasFails = allStatuses.includes('fail');
    const hasWarns = allStatuses.includes('warn');
    const overallStatus = hasFails ? 'fail' : (hasWarns ? 'warn' : 'pass');
    const overallIcon = this.getStatusIcon(overallStatus);

    let html = `
      <div class="panelV2 mod-helper-panel" x-data="{ isToggledOn: true, isToggledOff: false }">
        <h2 class="panel__heading" style="cursor:pointer" x-on:click="isToggledOn = !isToggledOn; isToggledOff = !isToggledOff">
          <i class="fas fa-search"></i>
          Moderation Quick Check
          <i class="fas fa-minus-circle fa-pull-right" x-show="isToggledOff" style="display:none;"></i>
          <i class="fas fa-plus-circle fa-pull-right" x-show="isToggledOn"></i>
        </h2>
        <div class="panel__body mod-helper-body" x-show="isToggledOff">
    `;

    // Core checks
    html += this.createCheckItem(
      'TMDB Title Match',
      results.tmdbMatch.status,
      results.tmdbMatch.message,
      results.tmdbMatch.details
    );

    if (results.seasonEpisode.status !== 'na') {
      html += this.createCheckItem(
        'Season/Episode Format',
        results.seasonEpisode.status,
        results.seasonEpisode.message
      );
    }

    if (results.folderStructure.status !== 'na') {
      html += this.createCheckItem(
        'Folder Structure',
        results.folderStructure.status,
        results.folderStructure.message,
        results.folderStructure.details
      );
    }

    if (results.containerFormat.status !== 'na') {
      html += this.createCheckItem(
        'Container Format',
        results.containerFormat.status,
        results.containerFormat.message,
        results.containerFormat.details
      );
    }

    if (results.packUniformity.status !== 'na') {
      html += this.createPackUniformitySection(results.packUniformity);
    }

    html += this.createNamingGuideSection(results.namingGuide);
    html += this.createElementOrderSection(results.elementOrder);

    html += this.createCheckItem(
      'MediaInfo',
      results.mediaInfo.status,
      results.mediaInfo.message
    );

    if (results.audioTags.checks && results.audioTags.checks.length > 0) {
      html += this.createAudioSection(results.audioTags);
    } else {
      html += this.createCheckItem(
        'Audio Compliance',
        results.audioTags.status,
        results.audioTags.message,
        results.audioTags.details
      );
    }

    if (results.subtitleRequirement.status !== 'na') {
      html += this.createCheckItem(
        'Subtitle Requirement',
        results.subtitleRequirement.status,
        results.subtitleRequirement.message,
        results.subtitleRequirement.details
      );
    }

    html += this.createCheckItem(
      'Screenshots',
      results.screenshots.status,
      results.screenshots.message
    );

    const groupClass = results.bannedGroup.alert ? 'mod-helper-alert' : '';
    html += this.createCheckItem(
      'Release Group',
      results.bannedGroup.status,
      results.bannedGroup.message,
      null,
      groupClass
    );

    html += '</div></div>'; // close panel__body & panelV2

    const panel = document.createElement('section');
    panel.innerHTML = html;
    return panel;
  },

  createCheckItem(title, status, message, details = null, extraClass = '') {
    const icon = this.getStatusIcon(status);
    const statusClass = this.getStatusClass(status);

    let html = `
      <div class="mod-helper-item ${extraClass}">
        <span class="mod-helper-status ${statusClass}">${icon}</span>
        <span class="mod-helper-title">${title}</span>
        <span class="mod-helper-message ${statusClass}">${message}</span>
    `;

    if (details) {
      html += `
        <div class="mod-helper-details">
          <small>Expected: "${details.expected}"</small><br>
          <small>Found: "${details.found}"</small>
        </div>
      `;
    }

    html += '</div>';
    return html;
  },

  createNamingGuideSection(namingGuide) {
    const icon = this.getStatusIcon(namingGuide.status);
    const statusClass = this.getStatusClass(namingGuide.status);

    let html = `
      <div class="mod-helper-item mod-helper-section">
        <span class="mod-helper-status ${statusClass}">${icon}</span>
        <span class="mod-helper-title">Naming Guide</span>
        <div class="mod-helper-sub-items">
    `;

    for (const check of namingGuide.checks) {
      const subIcon = this.getStatusIcon(check.status);
      const subClass = this.getStatusClass(check.status);
      const requiredMark = check.required ? '' : ' <small>(optional)</small>';

      html += `
        <div class="mod-helper-sub-item">
          <span class="mod-helper-sub-status ${subClass}">${subIcon}</span>
          <span class="mod-helper-sub-name">${check.name}${requiredMark}</span>
          <span class="mod-helper-sub-message ${subClass}">${check.message}</span>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  },

  createElementOrderSection(orderResult) {
    const icon = this.getStatusIcon(orderResult.status);
    const statusClass = this.getStatusClass(orderResult.status);

    let html = `
      <div class="mod-helper-item">
        <span class="mod-helper-status ${statusClass}">${icon}</span>
        <span class="mod-helper-title">Title Element Order</span>
        <span class="mod-helper-message ${statusClass}">${orderResult.message}</span>
    `;

    if (orderResult.details && orderResult.details.violations && orderResult.details.violations.length > 0) {
      html += `
        <div class="mod-helper-details">
          <small><strong>Order type:</strong> ${orderResult.details.orderType}</small><br>
          <small><strong>Issues:</strong></small>
          <ul style="margin:0.25rem 0 0 1rem; padding:0;">
      `;
      for (const violation of orderResult.details.violations) {
        html += `<li style="font-size:0.85rem; color:#fc8181;">${violation}</li>`;
      }
      html += '</ul></div>';
    }

    html += '</div>';
    return html;
  },

  createPackUniformitySection(uniformityResult) {
    const icon = this.getStatusIcon(uniformityResult.status);
    const statusClass = this.getStatusClass(uniformityResult.status);

    let html = `
      <div class="mod-helper-item mod-helper-section">
        <span class="mod-helper-status ${statusClass}">${icon}</span>
        <span class="mod-helper-title">Pack Uniformity</span>
        <div class="mod-helper-sub-items">
    `;

    for (const check of uniformityResult.checks) {
      const subIcon = this.getStatusIcon(check.status);
      const subClass = this.getStatusClass(check.status);

      html += `
        <div class="mod-helper-sub-item">
          <span class="mod-helper-sub-status ${subClass}">${subIcon}</span>
          <span class="mod-helper-sub-name">${check.name}</span>
          <span class="mod-helper-sub-message ${subClass}">${check.message}</span>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  },

  createAudioSection(audioResult) {
    const icon = this.getStatusIcon(audioResult.status);
    const statusClass = this.getStatusClass(audioResult.status);

    let html = `
      <div class="mod-helper-item mod-helper-section">
        <span class="mod-helper-status ${statusClass}">${icon}</span>
        <span class="mod-helper-title">Audio Compliance</span>
        <div class="mod-helper-sub-items">
    `;

    for (const check of audioResult.checks) {
      const subIcon = this.getStatusIcon(check.status);
      const subClass = this.getStatusClass(check.status);

      html += `
        <div class="mod-helper-sub-item">
          <span class="mod-helper-sub-status ${subClass}">${subIcon}</span>
          <span class="mod-helper-sub-name">${check.name}</span>
          <span class="mod-helper-sub-message ${subClass}">${check.message}</span>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  },

  injectPanel(panel) {
    const moderationPanel = DataExtractor.getModerationPanel();
    if (moderationPanel) {
      moderationPanel.parentNode.insertBefore(panel, moderationPanel);
    } else {
      const torrentTags = document.querySelector('ul.torrent__tags');
      if (torrentTags) {
        torrentTags.parentNode.insertBefore(panel, torrentTags.nextSibling);
      }
    }
    // Alpine.js handles collapse; no manual event binding required
  }
};



  const STYLES = `
        .mod-helper-panel {
            margin-bottom: 1rem;
            border-radius: 8px;
        }

        .mod-helper-header {
            background: #292a2e;
            padding: 0;
            cursor: pointer;
        }

        .mod-helper-body {
            padding: 1rem;
        }

        .mod-helper-item {
            display: grid;
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            gap: 0.25rem 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid #555;
            align-items: start;
        }

        .mod-helper-item:last-child {
            border-bottom: none;
        }

        .mod-helper-status {
            grid-row: 1;
            grid-column: 1;
            font-size: 1.1rem;
        }

        .mod-helper-title {
            grid-row: 1;
            grid-column: 2;
            font-weight: 600;
            color: #e2e8f0;
        }

        .mod-helper-message {
            grid-row: 2;
            grid-column: 2;
            font-size: 1rem;
            color: #a0aec0;
        }

        .mod-helper-details {
            grid-row: 3;
            grid-column: 2;
            font-size: 1rem;
            color: #718096;
            background: #232428;
            padding: 0.5rem;
            border-radius: 4px;
            margin-top: 0.25rem;
        }

        .mod-helper-section .mod-helper-title {
            grid-column: 2;
        }

        .mod-helper-sub-items {
            grid-row: 2;
            grid-column: 2;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            margin-top: 0.5rem;
            padding-left: 0.5rem;
            border-left: 2px solid #4a5568;
        }

        .mod-helper-sub-item {
            display: grid;
            grid-template-columns: auto auto 1fr;
            gap: 0.5rem;
            align-items: center;
            font-size: 1rem;
        }

        .mod-helper-sub-status {
            font-size: 1rem;
        }

        .mod-helper-sub-name {
            color: #cbd5e0;
            font-weight: 500;
        }

        .mod-helper-sub-message {
            color: #a0aec0;
        }

        .mod-helper-pass {
            color: #48bb78 !important;
        }

        .mod-helper-fail {
            color: #fc8181 !important;
        }

        .mod-helper-warn {
            color: #f6e05e !important;
        }

        .mod-helper-na {
            color: #a0aec0 !important;
        }

        .mod-helper-alert {
            background: rgba(252, 129, 129, 0.1);
            border-radius: 4px;
            padding: 0.5rem;
            border: 1px solid rgba(252, 129, 129, 0.3);
        }

        .mod-helper-alert .mod-helper-message {
            font-weight: bold;
        }

        .mod-helper-panel {
            padding: 0;
        }

        .mod-helper-panel .panel__header {
            display: flex;
        }

        .mod-helper-panel .panel__actions {
            display: flex;
            align-items: center;
            width: 100%;
        }

        .mod-helper-panel .panel__action {
            margin-left: auto;
        }

        #mod-helper-toggle {
            padding: 1.5rem;
        }
    `;

  function init() {
    const data = {
      torrentName: DataExtractor.getTorrentName(),
      tmdbTitle: DataExtractor.getTmdbTitle(),
      tmdbYear: DataExtractor.getTmdbYear(),
      category: DataExtractor.getCategory(),
      type: DataExtractor.getType(),
      resolution: DataExtractor.getResolution(),
      description: DataExtractor.getDescription(),
      hasMediaInfo: DataExtractor.hasMediaInfo(),
      mediaInfoText: DataExtractor.getMediaInfoText(),
      hasBdInfo: DataExtractor.hasBdInfo(),
      isTV: DataExtractor.isTV(),
      originalLanguage: DataExtractor.getOriginalLanguage(),
      mediaInfoLanguages: DataExtractor.getMediaInfoLanguages(),
      mediaInfoSubtitles: DataExtractor.getMediaInfoSubtitles(),
      fileStructure: DataExtractor.getFileStructure()
    };

    console.log('[Mod Helper] Extracted data:', data);

    const results = {
      tmdbMatch: Checks.tmdbNameMatch(data.torrentName, data.tmdbTitle),
      seasonEpisode: Checks.seasonEpisodeFormat(data.torrentName, data.isTV),
      namingGuide: Checks.namingGuideCompliance(data.torrentName, data.type, data.mediaInfoText),
      elementOrder: Checks.titleElementOrder(data.torrentName, data.type),
      folderStructure: Checks.movieFolderStructure(data.fileStructure, data.category, data.isTV, data.type),
      mediaInfo: Checks.mediaInfoPresent(data.hasMediaInfo, data.hasBdInfo, data.type),
      audioTags: Checks.audioTagCompliance(data.torrentName, data.originalLanguage, data.mediaInfoLanguages, data.type, data.mediaInfoText),
      subtitleRequirement: Checks.subtitleRequirement(data.mediaInfoLanguages, data.mediaInfoSubtitles, data.originalLanguage, data.type),
      screenshots: Checks.screenshotCount(data.description),
      bannedGroup: Checks.bannedReleaseGroup(data.torrentName),
      containerFormat: Checks.containerFormat(data.fileStructure, data.type),
      packUniformity: Checks.packUniformity(data.fileStructure, data.type)
    };

    console.log('[Mod Helper] Check results:', results);

    GM_addStyle(STYLES);

    const panel = UI.createPanel(results);
    UI.injectPanel(panel);

    console.log('[Mod Helper] Panel injected successfully');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
  else {
    init();
  }
})();
