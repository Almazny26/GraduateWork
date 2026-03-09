export type CourseCardProps = {
  title: string
  imageSrc: string
  slug: string
  onAddCourse?: () => void | Promise<void>
  addDisabled?: boolean
  isAdded?: boolean
}
