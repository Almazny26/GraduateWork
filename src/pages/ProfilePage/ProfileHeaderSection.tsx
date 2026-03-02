import type { User } from '@/common/types'

type Props = {
  user: User
  onLogout: () => void
}

export function ProfileHeaderSection({ user, onLogout }: Props) {
  return (
    <section className="flex flex-col gap-[24px] sm:gap-[40px]">
      <h1
        className="text-left font-normal text-[24px] sm:text-[40px] leading-[1.1] text-black max-w-[810px]"
        style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
      >
        Профиль
      </h1>
      <div className="flex flex-col items-center gap-[30px] p-[30px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] w-[343px] h-[365px] sm:w-full sm:h-auto max-w-[1160px] mx-auto sm:mx-0">
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-0 sm:gap-[33px] w-full">
          <div className="mx-auto sm:mx-0 w-[141px] h-[141px] sm:w-[197px] sm:h-[197px] shrink-0 overflow-hidden rounded-[30px] bg-[#D9D9D9]">
            <img
              src="/images/photo_big.png"
              alt=""
              className="w-full h-full object-cover"
              width={197}
              height={197}
            />
          </div>
          <div className="mt-[30px] sm:mt-0 w-full flex flex-col items-start gap-[20px] sm:gap-[44px] min-w-0">
            <div className="flex flex-col gap-[20px] w-full items-start">
              <p
                className="text-left font-normal text-[24px] sm:text-[32px] leading-[1.1] text-black max-w-[300px]"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 500,
                }}
              >
                {user.name}
              </p>
              <p
                className="text-left text-[18px] leading-[1.1] text-black"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                Логин: {user.login}
              </p>
            </div>
            <div className="flex w-full items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={onLogout}
                className="box-border flex flex-row justify-center items-center gap-[10px] rounded-[46px] border border-black w-[283px] h-[50px] sm:w-[192px] sm:h-[53px] text-[16px] sm:text-[18px] leading-[1.1] text-black font-normal hover:bg-black/5 transition-colors px-[26px] py-[16px]"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  borderWidth: 1,
                }}
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
