type Props = {
  open: boolean
  visible: boolean
  onClose: () => void
}

export function ProgressSavedModal({ open, visible, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-[140] flex items-center justify-center px-4 transition-opacity duration-200 ${
        visible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.2)' }}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-[343px] h-[252px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] flex flex-col justify-start items-center gap-[34px] p-[40px] transition-all duration-200 ease-out ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: 0,
            color: 'rgba(0, 0, 0, 1)',
            fontFamily: 'Roboto, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: 32,
            lineHeight: '110%',
            letterSpacing: 0,
            textAlign: 'center',
          }}
        >
          Ваш прогресс
          <br />
          засчитан!
        </h3>
        <img
          src="/images/Check-in-Circle.svg"
          alt=""
          width={68}
          height={68}
          className="w-[68px] h-[68px] object-contain"
        />
      </div>
    </div>
  )
}
