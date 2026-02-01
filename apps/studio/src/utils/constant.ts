import {ComposeIcon, CogIcon, InsertAboveIcon, SearchIcon} from '@sanity/icons'
import type {FieldGroupDefinition} from 'sanity'
import {ALL_FIELDS_GROUP} from 'sanity'

export const GROUP = {
  SEO: 'seo',
  MAIN_CONTENT: 'main-content',
  CARD: 'card',
  RELATED: 'related',
  OG: 'og',
  WORKFLOW: 'workflow',
}

export const GROUPS: FieldGroupDefinition[] = [
  {
    ...ALL_FIELDS_GROUP,
    hidden: true,
  },
  {
    name: GROUP.MAIN_CONTENT,
    icon: ComposeIcon,
    title: 'Content',
    default: true,
  },
  {
    name: GROUP.SEO,
    icon: SearchIcon,
    title: 'SEO',
  },
  {
    name: GROUP.OG,
    icon: InsertAboveIcon,
    title: 'Open Graph',
  },
  {
    name: GROUP.WORKFLOW,
    icon: CogIcon,
    title: 'Workflow',
  },
]
