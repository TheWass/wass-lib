import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export const baseConfig = [
    {
        ignores: ['**/dist/**', '**/dist*/**', '**/node_modules/**', '**/scripts/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    // Files which TSConfig does not need, but should be linted.
                    allowDefaultProject: [
                        'eslint.config.mjs',
                    ]
                }
            }
        }
    },
    {
        rules: 
        {
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],

            quotes: ['error', 'single'],
        },
    }
];

export default [...baseConfig];
