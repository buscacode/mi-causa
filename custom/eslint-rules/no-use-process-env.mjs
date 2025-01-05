export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of process.env outside of global.config.ts',
      category: 'Best Practices'
    },
    messages: {
      noProcessEnv:
        'Using process.env is not allowed outside of global.config.ts'
    },
    // fixable: 'code',
    schema: [] // no options
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.name === 'process' &&
          node.property.name === 'env' &&
          !context.getFilename().includes('global.config.ts')
        ) {
          context.report({
            node,
            messageId: 'noProcessEnv',
            suggest: [
              {
                desc: 'Use src/global.config.ts instead',
                fix: () => null
              }
            ]
          })
        }
      }
    }
  }
}
