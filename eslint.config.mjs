import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export const baseConfig = [
    {
        ignores: ['dist/*', 'dist*/*', 'node_modules/*', 'scripts/*'],
    },
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
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
