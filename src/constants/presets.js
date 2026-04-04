// Postcard dimensions in app's canonical coordinate system.
// Portrait layout with a 3:4 aspect ratio.
export const CARD_WIDTH = 300
export const CARD_HEIGHT = 400

/** Font for postcard back message (Google Fonts: Homemade Apple). */
export const POSTCARD_MESSAGE_FONT_FAMILY = 'Homemade Apple'
export const POSTCARD_MESSAGE_FONT_STACK = `'${POSTCARD_MESSAGE_FONT_FAMILY}', cursive`

/**
 * Inset from card edge to the message text box (matches editor: 20px wrap + 12px textarea padding).
 * Use for modal preview, export, and any layout that should match the typing view.
 */
export const POSTCARD_TEXT_INSET = 32

export const POSTCARD_TEXT_LINE_HEIGHT = 1.2

export function postcardMessageFontSizePt(textStyle) {
  return (textStyle?.size ?? 13) * 1.3
}

/** Inner width/height available for message text in canonical card coordinates. */
export const POSTCARD_TEXT_INNER_WIDTH = CARD_WIDTH - POSTCARD_TEXT_INSET * 2
export const POSTCARD_TEXT_INNER_HEIGHT = CARD_HEIGHT - POSTCARD_TEXT_INSET * 2

/**
 * After scaling type by export card width vs canonical inner width, canvas text still reads
 * ~1.6× the modal; apply this so the PNG matches the modal preview.
 */
export const POSTCARD_EXPORT_FONT_CALIBRATION = 1 / 1.6

/** Old default presets (Unsplash); rows in DB may still reference these. */
const LEGACY_PRESET_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1473447198193-39ea7e7e1cd1?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1434725039720-aaad6dd32dfe?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1200&q=80&sat=-100',
  'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80&sat=-100',
]

export const PRESET_IMAGES = [
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/arete.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvYXJldGUucG5nIiwiaWF0IjoxNzc1MjcxODYyLCJleHAiOjE4MDY4MDc4NjJ9.GnW6Ni25SPblTDFlREdxW1khWBcCkjCHS9q0MtZ1AAg',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/bel%20hall%20straight.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvYmVsIGhhbGwgc3RyYWlnaHQucG5nIiwiaWF0IjoxNzc1MjcxODgyLCJleHAiOjE4MDY4MDc4ODJ9.vDbjBOxgzo1A6ko_QYqPgykgttbGu5zyOhbAS0YYZyw',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/bel%20outside.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvYmVsIG91dHNpZGUucG5nIiwiaWF0IjoxNzc1MjcxODkwLCJleHAiOjE4MDY4MDc4OTB9.6ciFmYW1K65i7pLapZwpoqUBcne8ViydUKBz-WNCML0',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/cov%20benches.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvY292IGJlbmNoZXMucG5nIiwiaWF0IjoxNzc1MjcxOTE5LCJleHAiOjE4MDY4MDc5MTl9.u_RyHeZHctTu3oBGJFJk0nE8mhaBobkPNmLlBhwnrTY',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/cov%20outside.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvY292IG91dHNpZGUucG5nIiwiaWF0IjoxNzc1MjcxOTMwLCJleHAiOjE4MDY4MDc5MzB9.RaEF18JQ6EZHmoSi13rkIt2ASSKzaan_Vg5ui79dTcY',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/ejeep.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvZWplZXAucG5nIiwiaWF0IjoxNzc1MjcxOTQ1LCJleHAiOjE4MDY4MDc5NDV9.lWfY5RdLVxvGAOIrxGKEBkNvkpF-yOCHa0_UVf4IpHc',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/gesu%20inside.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvZ2VzdSBpbnNpZGUucG5nIiwiaWF0IjoxNzc1MjcxOTY2LCJleHAiOjE4MDY4MDc5NjZ9.u8EDSOpXtW_2vJLwzGPSWPhbxuC1sQFljB0xORN49cg',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/gesu%20outside.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvZ2VzdSBvdXRzaWRlLnBuZyIsImlhdCI6MTc3NTI3MTk3MywiZXhwIjoxODA2ODA3OTczfQ.2ApbVbzVgRMXTFkz4IgaNQFxelVUdDR4RtD81W-MHGM',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/gesu%20statue.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvZ2VzdSBzdGF0dWUucG5nIiwiaWF0IjoxNzc1MjcxOTc5LCJleHAiOjE4MDY4MDc5Nzl9.lkZeARlMFcwQ6FywYWnMbYs3j4akj1RieCwGrhsucLk',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/gonz%20road.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvZ29ueiByb2FkLnBuZyIsImlhdCI6MTc3NTI3MTk4OCwiZXhwIjoxODA2ODA3OTg4fQ.gxlwktpwWlJWOQBlCb6cwCntJU-_Nr1Njh3MVNnBBJI',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/iso.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvaXNvLnBuZyIsImlhdCI6MTc3NTI3MTk5NSwiZXhwIjoxODA2ODA3OTk1fQ.5kMQ_mszHSE-OkH1D-vKYIl9R4IF-lPm_P1ivQqH5-0',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/lovers%20lane%20again%20oop.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvbG92ZXJzIGxhbmUgYWdhaW4gb29wLnBuZyIsImlhdCI6MTc3NTI3MjAxMCwiZXhwIjoxODA2ODA4MDEwfQ.3TRYrOjnDqAyoIfATT1Am6v5Wk4n6AvPIHLT65iH8FM',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/lovers%20lane%20idk.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvbG92ZXJzIGxhbmUgaWRrLnBuZyIsImlhdCI6MTc3NTI3MjAxOSwiZXhwIjoxODA2ODA4MDE5fQ.97yAgfCSki2xup6zNLJw6r1hqJrszQRR-370eEyjc4M',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/nrl.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvbnJsLnBuZyIsImlhdCI6MTc3NTI3MjAyNSwiZXhwIjoxODA2ODA4MDI1fQ.m1aF19Dwfus9R7yoSGRW-bRWPlUYL_vqU4o9pzxZAnw',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/old%20rizal%20again%20ig.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvb2xkIHJpemFsIGFnYWluIGlnLnBuZyIsImlhdCI6MTc3NTI3MjAzMiwiZXhwIjoxODA2ODA4MDMyfQ.Lx-u6BPsOr1aM0ca3ZEhNr-MeA-XRKO_iRex5I9atJM',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/sec%20field.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvc2VjIGZpZWxkLnBuZyIsImlhdCI6MTc3NTI3MjA0OCwiZXhwIjoxODA2ODA4MDQ4fQ.8d-BIhX3xCx8jqD8CS2hZTsVe2Zc0y1JkAy4zLyfsRs',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/sec%20hall%20light.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvc2VjIGhhbGwgbGlnaHQucG5nIiwiaWF0IjoxNzc1MjcyMDgxLCJleHAiOjE4MDY4MDgwODF9.vHN-x78_GD-UTnNI3DSnuK8Th1guWGTpzF8BHlxN11U',
  'https://ydzxkzcrhhxnwnauirqi.supabase.co/storage/v1/object/sign/postcards/skywalk%201.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MzA5ZGM0OS0xY2JhLTRhNDUtOGQ0NS04NTE4MDUwMTQ5YmQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwb3N0Y2FyZHMvc2t5d2FsayAxLnBuZyIsImlhdCI6MTc3NTI3MjA5MSwiZXhwIjoxODA2ODA4MDkxfQ.kS2GqbFxoiMTzcuR0Eq32Iyr-uGD3CnPRHSzYafncwo',
]

/** Map stored legacy preset URLs to the current Supabase asset (same index). */
export function resolvePresetImageUrl(url) {
  if (!url) return url
  const i = LEGACY_PRESET_IMAGE_URLS.indexOf(url)
  return i >= 0 ? PRESET_IMAGES[i] : url
}

export function withResolvedPresetImage(postcard) {
  if (!postcard?.image_url) return postcard
  const next = resolvePresetImageUrl(postcard.image_url)
  if (next === postcard.image_url) return postcard
  return { ...postcard, image_url: next }
}
