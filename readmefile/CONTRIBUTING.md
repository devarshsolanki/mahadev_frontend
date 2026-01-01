# Contributing

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/ganesh_mart.git`
3. Add upstream: `git remote add upstream https://github.com/ORIGINAL-OWNER/ganesh_mart.git`
4. Create feature branch: `git checkout -b feature/your-feature`
5. Install dependencies: `npm install`
6. Start dev server: `npm run dev`

## Development Workflow

1. Make your changes
2. Ensure code quality:
   - `npm run type-check` - no TypeScript errors
   - `npm run lint:fix` - fix linting issues
   - `npm run test` - pass all tests
3. Commit with clear messages: `git commit -m "feat: description"`
4. Push to your fork: `git push origin feature/your-feature`
5. Create Pull Request with description

## Commit Message Format

```
type(scope): subject

body

footer
```

Types: feat, fix, docs, style, refactor, test, chore

Examples:
- `feat(auth): add two-factor authentication`
- `fix(cart): resolve checkout validation bug`
- `docs: update API endpoints`

## Code Style

- Use TypeScript strict mode
- No `any` types
- Use named exports
- 2-space indentation
- No console logs in production code
- Comment complex logic

## Testing

- Write tests for new features
- Maintain >80% code coverage
- Test edge cases
- Use descriptive test names

## Pull Request Checklist

- [ ] Follows code style guidelines
- [ ] Tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Updated relevant documentation
- [ ] Added tests for new features
- [ ] Commit messages follow convention

## Questions?

- Open a discussion in GitHub Discussions
- Check existing issues
- Join our community chat
