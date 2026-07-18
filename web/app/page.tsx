import curriculumData from "./curriculum-data.json";
import { CourseApp } from "./course-app";
import type { CurriculumData } from "./curriculum-types";

export default function Home() {
  return <CourseApp data={curriculumData as CurriculumData} />;
}
