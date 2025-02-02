import {
  assign,
  AssignArgs,
  ErrorActorEvent,
  fromPromise,
  InvokeConfig,
  setup,
} from 'xstate';
import { LoginService } from './LoginService';
import { DoneActorEvent } from 'xstate/dist/declarations/src/types';

export interface FetchContext {
  loginService: LoginService;
  error: Error | undefined;
  userId: string | undefined;
}

type FETCH_EVENT = { type: 'FETCH', email?: string };

const config = {
  context: {
    loginService: new LoginService(),
    error: undefined,
    userId: undefined,
  },
  id: 'loginForm',
  initial: 'idle',
  states: {
    idle: {
      on: {
        FETCH: {
          target: 'loading',
        },
      },
    },
    loading: {
      invoke: [{
        id: 'login',
        src: fromPromise(async ({ input }: {
          input: { email: string, loginService: LoginService }
        }): Promise<string> => {
          return await input.loginService.processLogin(input.email);
        }),
        input: ({ context, event }: { context: FetchContext, event: FETCH_EVENT }) => ({
          email: event.email,
          loginService: context.loginService,
        }),
        onDone: {
          target: 'success',
          actions: assign({
            userId: ({ event }: AssignArgs<FetchContext, DoneActorEvent<string, string>, FETCH_EVENT, any>) => event.output,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({ error: ({ event }: AssignArgs<FetchContext, ErrorActorEvent<Error, string>, FETCH_EVENT, any>) => event.error }),
        },
      } as InvokeConfig<FetchContext, FETCH_EVENT, any, any, any, any, any, any>,
      ],
    },
    success: {
      type: 'final' as const,
    },
    failure: {
      always: {
        target: 'idle',
      },
    },
  },
} as const;
export const loginStateMachine = setup({
  types: {
    context: {} as FetchContext,
    events: {} as FETCH_EVENT,
  },
}).createMachine<any>(config);

