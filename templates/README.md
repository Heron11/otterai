# OtterAI Templates

This directory contains local template repositories for the OtterAI platform.

## Structure

Each template should be in its own directory with a name matching the template ID from `app/lib/mock/templates.ts`:

- `react-vite/` - React Vite Starter (template ID: "1")
- `react-todo/` - React Todo App (template ID: "2") 
- `react-calculator/` - React Calculator (template ID: "3")
- `create-react-app/` - Create React App (template ID: "4")
- `react-weather/` - React Weather App (template ID: "5")

## Adding Templates

1. Clone the desired repository into the appropriate directory
2. Ensure the template works in WebContainer environment
3. Test that all dependencies are compatible
4. Update template metadata in `app/lib/mock/templates.ts` if needed

## Template Requirements

Templates should:
- Work in WebContainer (browser-based Node.js)
- Have reasonable dependency sizes
- Include a functional development server
- Be properly structured for the target framework
