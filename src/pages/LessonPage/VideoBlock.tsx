type Props = {
  lessonVideoUrl: string
  lessonTitle: string
  showVideo: boolean
  onShowVideo: () => void
  videoLoaded: boolean
  onVideoLoaded: () => void
  isLessonLoading: boolean
}

export function VideoBlock({
  lessonVideoUrl,
  lessonTitle,
  showVideo,
  onShowVideo,
  videoLoaded,
  onVideoLoaded,
  isLessonLoading,
}: Props) {
  const videoPreviewThumbnail =
    lessonVideoUrl && !showVideo
      ? (() => {
          const m = lessonVideoUrl.match(/embed\/([a-zA-Z0-9_-]{11})/)?.[1]
          return m ? `https://img.youtube.com/vi/${m}/maxresdefault.jpg` : null
        })()
      : null

  return (
    <section className="flex flex-col gap-5">
      <div
        className="relative w-[343px] sm:w-full max-w-[343px] sm:max-w-[1160px] h-[189px] sm:h-auto lg:h-[639px] rounded-[9px] sm:rounded-[30px] overflow-hidden shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] bg-[#ECECEC]"
        style={{ minHeight: 189 }}
      >
        {!showVideo && videoPreviewThumbnail && (
          <div
            className="absolute inset-0 z-[1] bg-cover bg-center"
            style={{ backgroundImage: `url(${videoPreviewThumbnail})` }}
            aria-hidden
          />
        )}
        {showVideo && (
          <iframe
            className="relative z-0 w-full h-full min-h-[189px] sm:min-h-[260px]"
            src={lessonVideoUrl}
            title={lessonTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            onLoad={onVideoLoaded}
          />
        )}
        {!showVideo ? (
          <button
            type="button"
            onClick={() => lessonVideoUrl && onShowVideo()}
            disabled={!lessonVideoUrl || isLessonLoading}
            className="absolute inset-0 z-10 flex items-center justify-center disabled:opacity-60 transition-transform duration-200 hover:scale-105"
            aria-label="Запустить видео"
          >
            <img
              src="/images/play.svg"
              alt=""
              width={46}
              height={46}
              className="w-[46px] h-[46px] sm:w-[156px] sm:h-[156px] object-contain transition-transform duration-200 hover:scale-110"
            />
          </button>
        ) : (
          !videoLoaded && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              aria-hidden
            >
              <img
                src="/images/play.svg"
                alt=""
                width={46}
                height={46}
                className="w-[46px] h-[46px] sm:w-[156px] sm:h-[156px] object-contain opacity-0"
              />
            </div>
          )
        )}
      </div>
    </section>
  )
}
