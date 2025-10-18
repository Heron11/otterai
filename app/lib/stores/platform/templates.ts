import { atom, map } from 'nanostores';
import type { Template, TemplateFilters } from '~/lib/types/platform/template';
import { mockTemplates } from '~/lib/mock/templates';

export const templatesStore = atom<Template[]>(mockTemplates);
export const templateFiltersStore = map<TemplateFilters>({});
export const selectedTemplateStore = atom<Template | null>(null);

export const getFilteredTemplates = () => {
  const templates = templatesStore.get();
  const filters = templateFiltersStore.get();
  
  return templates.filter(template => {
    if (filters.category && template.category !== filters.category) {
      return false;
    }
    
    if (filters.framework && template.framework !== filters.framework) {
      return false;
    }
    
    if (filters.tier && template.requiredTier !== filters.tier) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => template.tags.includes(tag));
      if (!hasTag) {
        return false;
      }
    }
    
    return true;
  });
};

export const setTemplateFilter = (key: keyof TemplateFilters, value: any) => {
  templateFiltersStore.setKey(key, value);
};

export const clearTemplateFilters = () => {
  templateFiltersStore.set({});
};

export const selectTemplate = (template: Template | null) => {
  selectedTemplateStore.set(template);
};



