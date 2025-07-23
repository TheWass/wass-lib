// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: ['*.ts', '*.tsx'],
    ignores: ['dist/*', 'dist*/*', 'node_modules/*', 'scripts/*'],
    extends: [
        eslint.configs.recommended,
        tseslint.configs.recommended,
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
    ]
});
