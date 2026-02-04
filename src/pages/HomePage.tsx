import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { CourseCard } from '@/components/CourseCard'
import { COURSES } from '@/data/courses'

export function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-page font-sans text-text">
      <Header />
      <Hero />
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-[60px] pb-10 sm:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-x-[40px] sm:gap-y-[76px] w-full max-w-[1160px] min-w-0">
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              title={course.title}
              imageSrc={course.image}
              slug={course.slug}
            />
          ))}
        </div>
      </section>
      <footer className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pb-12 sm:pb-16 flex justify-center">
        <a
          href="#top"
          className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity shrink-0"
          style={{
            width: 127,
            height: 52,
            gap: 8,
            padding: '16px 26px',
            background: 'rgba(188, 236, 48, 1)',
            color: 'rgba(0, 0, 0, 1)',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: '18px',
            lineHeight: '110%',
            letterSpacing: 0,
            textAlign: 'center',
          }}
        >
          <span className="inline-flex flex-row items-baseline gap-1">
            Наверх
            <span className="inline-block -translate-y-1" aria-hidden>
              ↑
            </span>
          </span>
        </a>
      </footer>
    </div>
  )
}
