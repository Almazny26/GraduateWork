export type Lesson = {
  id: string
  title: string
  youtubeEmbedUrl: string
  tasks: string[]
}

export const COURSE_LESSONS: Record<string, Lesson[]> = {
  yoga: [
    {
      id: 'yoga-1',
      title: 'Утренняя практика',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/v7AYKMP6rOE',
      tasks: [
        'Сделать разминку 5 минут',
        'Выполнить комплекс до конца без пропусков',
        'Записать самочувствие после тренировки',
      ],
    },
    {
      id: 'yoga-2',
      title: 'Красота и здоровье',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/4pKly2JojMw',
      tasks: [
        'Следить за дыханием на протяжении урока',
        'Удерживать каждую позу не менее 20 секунд',
        'Сделать короткую заминку',
      ],
    },
    {
      id: 'yoga-3',
      title: 'Асаны стоя',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/8TuRYV71Rgo',
      tasks: [
        'Сконцентрироваться на технике выполнения',
        'Не задерживать дыхание в статике',
        'Сделать 2 минуты расслабления в конце',
      ],
    },
    {
      id: 'yoga-4',
      title: 'Растягиваем мышцы бедра',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/COp7BR_Dvps',
      tasks: [
        'Держать корпус ровно в наклонах',
        'Фиксировать растяжение 20-30 секунд',
        'Не допускать резких движений',
      ],
    },
    {
      id: 'yoga-5',
      title: 'Гибкость спины',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/2pLT-olgUJs',
      tasks: [
        'Плавно входить в прогибы',
        'Контролировать дыхание во всех позициях',
        'Сделать расслабляющую заминку',
      ],
    },
  ],
  stretching: [
    {
      id: 'stretching-1',
      title: 'Стретчинг: урок 1',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/g_tea8ZNk5A',
      tasks: [
        'Разогреть мышцы перед растяжкой',
        'Выполнить все упражнения в спокойном темпе',
        'Не допускать болевых ощущений',
      ],
    },
    {
      id: 'stretching-2',
      title: 'Стретчинг: урок 2',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/qULTwquOuT4',
      tasks: [
        'Держать каждое положение 25-30 секунд',
        'Следить за ровной спиной',
        'Отметить прогресс в гибкости',
      ],
    },
    {
      id: 'stretching-3',
      title: 'Стретчинг: урок 3',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/Qf8dmyg2jck',
      tasks: [
        'Сфокусироваться на дыхании',
        'Добавить амплитуду только без боли',
        'Сделать 3 минуты расслабления',
      ],
    },
  ],
  fitness: [
    {
      id: 'fitness-1',
      title: 'Фитнес: урок 1',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/ml6cT4AZdqI',
      tasks: [
        'Выполнить весь круг без остановки',
        'Контролировать технику приседаний и планки',
        'Сделать заминку 3 минуты',
      ],
    },
    {
      id: 'fitness-2',
      title: 'Фитнес: урок 2',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/UItWltVZZmE',
      tasks: [
        'Соблюдать интервалы работы и отдыха',
        'Держать стабильный темп до конца',
        'Отметить пульс после тренировки',
      ],
    },
    {
      id: 'fitness-3',
      title: 'Фитнес: урок 3',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/Ce2Wl8M9Wf8',
      tasks: [
        'Не пропускать силовые блоки',
        'Контролировать положение корпуса',
        'Сделать растяжку основных мышц',
      ],
    },
  ],
  step: [
    {
      id: 'step-1',
      title: 'Степ-аэробика: урок 1',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/9zQf7v3fXxY',
      tasks: [
        'Держать ритм под музыку',
        'Следить за постановкой стопы',
        'Сделать восстановительное дыхание 2 минуты',
      ],
    },
    {
      id: 'step-2',
      title: 'Степ-аэробика: урок 2',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/Kf0fW1w7_7A',
      tasks: [
        'Выполнить все связки без пропусков',
        'Сохранять ровную осанку',
        'Контролировать дыхание',
      ],
    },
    {
      id: 'step-3',
      title: 'Степ-аэробика: урок 3',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/7tB4D8wLxZk',
      tasks: [
        'Увеличить амплитуду движений',
        'Держать устойчивый темп',
        'Сделать заминку 3 минуты',
      ],
    },
  ],
  bodyflex: [
    {
      id: 'bodyflex-1',
      title: 'Бодифлекс: урок 1',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/eA2fX4QKj4U',
      tasks: [
        'Освоить базовую дыхательную технику',
        'Сделать упражнения в медленном темпе',
        'Сконцентрироваться на качестве вдоха/выдоха',
      ],
    },
    {
      id: 'bodyflex-2',
      title: 'Бодифлекс: урок 2',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/7QfYz7GdQ6Q',
      tasks: [
        'Повторить технику дыхания без ошибок',
        'Удерживать статические позиции 10-15 секунд',
        'Сделать расслабление после урока',
      ],
    },
    {
      id: 'bodyflex-3',
      title: 'Бодифлекс: урок 3',
      youtubeEmbedUrl: 'https://www.youtube.com/embed/2pLT-olgUJs',
      tasks: [
        'Синхронизировать дыхание и движение',
        'Соблюдать равномерный ритм',
        'Оценить самочувствие после занятия',
      ],
    },
  ],
}

export function getLessonsByCourseSlug(slug: string): Lesson[] {
  return COURSE_LESSONS[slug] ?? []
}

export function getLessonByCourseAndLessonId(
  slug: string,
  lessonId: string,
): Lesson | undefined {
  return getLessonsByCourseSlug(slug).find((lesson) => lesson.id === lessonId)
}
