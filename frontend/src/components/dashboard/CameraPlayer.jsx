import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export default function CameraPlayer({ camera }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !camera.stream_url) return

    setError(false)
    setLoaded(false)

    const isHls = camera.stream_url.includes('.m3u8')

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false })
      hlsRef.current = hls
      hls.loadSource(camera.stream_url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
        setLoaded(true)
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError(true)
      })
    } else {
      video.src = camera.stream_url
      video.onloadeddata = () => setLoaded(true)
      video.onerror = () => setError(true)
    }

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [camera.stream_url])

  return (
    <div className="bg-black rounded-xl overflow-hidden relative aspect-video">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 text-sm font-body gap-2">
          <span className="text-2xl">📷</span>
          <span>Stream unavailable</span>
          <span className="text-xs text-white/30 max-w-[160px] text-center break-all">{camera.stream_url}</span>
        </div>
      ) : (
        <>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs font-body">
              Connecting…
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls
            className="w-full h-full object-contain"
          />
        </>
      )}
    </div>
  )
}
