# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


## Technical Problems

1. What if user need to export the docx file with the data filled in the docx file? Can out application can handle this?

2. What if the user need to import the docx file and the data filled in the docx file?

3. Chưa biết định dạng 1 file auction bid agreement như nào?


## Verify feature

1. Upload a template docx file => user will be able to edit the template file (like google docs, tiptap, ...) => Its more like a document editor with a custom pre-configured format (eg: {{customer_name}}, {{project_name}}) for input fields for reusable  => After save the template file, user can download the template file to their local machine and for further use in future.

2. the custom pre-configured format is called "variables". Each "variable" will have a key (eg: {{customer_name}}) and a value (eg: John Doe). 

3. When user add a "variable" to a template file, the variable will appear in the right sidebar of the editor. User can fill the value of the variable in the right sidebar and also use those added variables in the template file. 

4. After finish editing the "variables" and template file, user can save the template file to the cloud (or a database).
  4.1. When user save the template file, the application will also save the "variables" to the cloud (or a database). 
  4.2. "Variables" data will be saved in the database with the template file (the relation is one-to-many, one template file can have many variables).

5. User can also download the template file to their local machine. 

6. Template file has version to track the changes ? => Not yet verified

7. User can comment on the template file ? => Not yet verified

8. User can approve/reject the template file ? => Verified

## Questions

1. After user save the template file, what will happen? What is the template file used for when we have many template files?

2. Assume we have a list of template files, and each template file has a list of variables. When user download a template, what does the content of the template look like? Does it contain the variables or not? Does the variables in the template file get replaced with "......" or something else?

3. What happen if user upload a docx file that contains variables? Will the application be able to detect the variables and replace them with the values from the database?

4. What happen if user upload a docx file that not empty, it has content and variables, and user want to use this docx file as a template file? Will the application be able to detect the variables and replace them with the values from the database?

5. What happen if user upload a docx file that not empty, it has content and the place holder for variables, and user want to use this docx file as a template file? 