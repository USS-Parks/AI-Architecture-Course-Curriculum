export type CurriculumSection = {
  title: string;
  items: string[];
};

export type CurriculumWeek = {
  id: string;
  number: number;
  title: string;
  sections: CurriculumSection[];
};

export type CurriculumModule = {
  id: string;
  number: number;
  title: string;
  phaseId: string;
  range: string;
  overview: string[];
  weeks: CurriculumWeek[];
  closingSections: CurriculumSection[];
};

export type CurriculumPhase = {
  id: string;
  label: string;
  title: string;
  moduleIds: string[];
};

export type ReferenceGroup = {
  title: string;
  items: string[];
};

export type ReferenceSection = {
  id: string;
  title: string;
  groups: ReferenceGroup[];
};

export type CurriculumData = {
  meta: {
    title: string;
    subtitle: string;
    instructionalWeeks: number;
    totalUnits: number;
    weeklyCommitment: string;
    capstone: string;
  };
  phases: CurriculumPhase[];
  modules: CurriculumModule[];
  referenceSections: ReferenceSection[];
};
