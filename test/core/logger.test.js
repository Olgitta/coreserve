'use strict';

const {faker} = require('@faker-js/faker');

const {createCtx, getCtx, getTraceId} = require('../../src/core/execution-context/context');

describe.skip('Logger Test', () => {

    it('should not fail when async context not available', () => {
        const log = require('../../src/core/logger')(faker.word.noun());
        /*
            {
              traceId: 'notraceid',
              payload: {
                context: {},
                book: { title: 'Oliver Twist', author: 'George Eliot' }
              },
              level: 'info',
              message: 'Volva causa aut adhaero.',
              timestamp: '2024-12-23T08:29:34.567Z'
            }
            {
              traceId: 'notraceid',
              payload: { context: {}, zoo: [ 'Savannah', 'Asiatic Lion' ] },
              level: 'warn',
              message: 'Stultus correptius sulum agnosco.',
              timestamp: '2024-12-23T08:29:34.571Z'
            }
            {
              traceId: 'notraceid',
              payload: {
                context: {},
                error: {
                  message: 'Error: Aranea valde.',
                  code: '',
                  stack: 'Error: Error: Aranea valde....
                  '    at runTest (C:\\Users\\olgao\\projects\\github\\coreserve\\node_modules\\jest-runner\\build\\runTest.js:444:34)'
                }
              },
              level: 'error',
              message: 'Audeo aequitas aspernatur tibi.',
              timestamp: '2024-12-23T08:29:34.577Z'
            }

         */

        log.info(faker.lorem.sentence(4), {
            book: {
                title: faker.book.title(),
                author: faker.book.author(),
            }
        });

        log.warn(faker.lorem.sentence(4), {
            zoo: [faker.animal.cat(), faker.animal.lion()],
        });

        const e = new Error(`Error: ${faker.lorem.sentence(2)}`);
        log.error(faker.lorem.sentence(4), e);
    })

    it('should output info log', () => {
        const log = require('../../src/core/logger')(faker.word.noun());

        /*
        {
          traceId: '4e4ed9a5-32b8-4067-a38e-704660ada44c',
          payload: {
            book: { title: 'The Heart of the Matter', author: 'Anthony Burgess' },
            context: { test: 'info', traceId: '4e4ed9a5-32b8-4067-a38e-704660ada44c' }
          },
          level: 'info',
          message: 'Attero tepesco usque vaco.',
          timestamp: '2024-12-23T08:14:45.511Z'
        }
         */
        createCtx({test: 'info'}, async () => {
            log.info(faker.lorem.sentence(4), {
                book: {
                    title: faker.book.title(),
                    author: faker.book.author(),
                }
            });
        });
    })

    it('should output warn log', () => {
        const log = require('../../src/core/logger')(faker.word.noun());

        /*
        {
          traceId: '8bb9a735-50f2-4f84-8839-39f5a1b845cf',
          payload: {
            context: { test: 'warn', traceId: '8bb9a735-50f2-4f84-8839-39f5a1b845cf' },
            zoo: [ 'Savannah', 'West African Lion' ]
          },
          level: 'warn',
          message: 'Peior abundans adicio considero.',
          timestamp: '2024-12-23T08:22:51.341Z'
        }
         */
        createCtx({test: 'warn'}, async () => {
            log.warn(faker.lorem.sentence(4), {
                zoo: [faker.animal.cat(), faker.animal.lion()],
            });
        });
    });

    it('should output error log', () => {
        const log = require('../../src/core/logger')(faker.word.noun());

        /*
            {
              traceId: '48b654de-3fe7-4646-b598-a4af9e517c5f',
              payload: {
                context: { test: 'error', traceId: '48b654de-3fe7-4646-b598-a4af9e517c5f' },
                error: {
                  message: 'Error: Temeritas vergo.',
                  code: '',
                  stack: 'Error: Error: Temeritas vergo.\n' +
                    '    at Object.<anonymous> (C:\\Users\\olgao\\projects\\github\\coreserve\\test\\core\\logger.test.js:52:19)\n' +
                    '    at Promise.then.co...runTestInternal (C:\\Users\\olgao\\projects\\github\\coreserve\\node_modules\\jest-runner\\build\\runTest.js:367:16)\n' +
                    '    at runTest (C:\\Users\\olgao\\projects\\github\\coreserve\\node_modules\\jest-runner\\build\\runTest.js:444:34)'
                }
              },
              level: 'error',
              message: 'Sunt accusamus comis vulariter.',
              timestamp: '2024-12-23T08:25:26.578Z'
            }

         */
        const e = new Error(`Error: ${faker.lorem.sentence(2)}`);
        createCtx({test: 'error'}, async () => {
            log.error(faker.lorem.sentence(4), e, {
                flights: [faker.airline.airline(), faker.airline.airline()]
            });
        });
    });
})