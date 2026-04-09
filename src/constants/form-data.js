const AGE_RANGES = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_25', label: '18 - 25' },
  { value: '26_30', label: '26 - 30' },
  { value: '31_35', label: '31 - 35' },
  { value: '36_plus', label: '36 and above' },
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const EDUCATION_LEVELS = ['secondary', 'undergraduate', 'graduate', 'postgraduate', 'other']

const STACKS = [
  {
    id: 'web_development',
    label: 'Web Development',
    description: 'Frontend & Agentic Web Development',
    tone: 'blue',
  },
  {
    id: 'data_analytics',
    label: 'Data Analytics',
    description: 'Data analysis, visualization & insights',
    tone: 'green',
  },
  {
    id: 'product_design',
    label: 'Product Design',
    description: 'UI/UX, design systems & prototyping',
    tone: 'violet',
  },
  {
    id: 'digital_marketing',
    label: 'Digital Marketing',
    description: 'SEO, social media & growth marketing',
    tone: 'orange',
  },
  {
    id: 'ai_automation',
    label: 'AI & Automation',
    description: 'AI tools, workflows & process automation',
    tone: 'indigo',
  },
]

const HEARD_FROM_OPTIONS = [
  'Instagram',
  'Facebook',
  'Twitter',
  'WhatsApp',
  'Friend or Colleague',
  'School/University',
  'Google Search',
  'Email Newsletter',
  'Event or Conference',
  'Other',
]

const STEP_FIELDS = {
  1: ['fullName', 'email', 'phone', 'gender', 'ageRange'],
  2: ['stack'],
  3: ['motivation', 'heardFrom', 'referralCode'],
}

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  gender: '',
  ageRange: '',
  educationLevel: 'undergraduate',
  institution: 'N/A',
  stack: '',
  motivation: '',
  heardFrom: '',
  referralCode: '',
  _hp: '',
}

export {
  AGE_RANGES,
  EDUCATION_LEVELS,
  GENDER_OPTIONS,
  HEARD_FROM_OPTIONS,
  INITIAL_VALUES,
  STACKS,
  STEP_FIELDS,
}
