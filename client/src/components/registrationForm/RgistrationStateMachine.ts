import {
  assign,
  AssignArgs,
  ErrorActorEvent,
  fromPromise,
  setup,
} from 'xstate';
import { DoneActorEvent } from 'xstate/dist/declarations/src/types';
import { RegistrationService } from './RegistrationService';

export interface FetchContext {
  registrationService: RegistrationService;
  error: Error | undefined;
  complete: boolean;
}

type FETCH_EVENT = { type: 'FETCH', email?: string, displayName?: string };

const config = {
  context: {
    registrationService: new RegistrationService(),
    error: undefined,
    complete: false,
  },
  id: 'registrationForm',
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
      invoke: {
        id: 'register',
        src: fromPromise(async ({ input }: {
          input: { email: string, displayName: string, registrationService: RegistrationService }
        }): Promise<boolean> => {
          return await input.registrationService.processRegistration(input.email, input.displayName);
        }),
        input: ({ context, event }: { context: FetchContext, event: FETCH_EVENT }) => ({
          email: event.email,
          displayName: event.displayName,
          registrationService: context.registrationService,
        }),
        onDone: {
          target: 'success',
          actions: assign({
            complete: ({ event }: AssignArgs<FetchContext, DoneActorEvent<boolean, string>, FETCH_EVENT, any>) => event.output,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({ error: ({ event }: AssignArgs<FetchContext, ErrorActorEvent<Error, string>, FETCH_EVENT, any>) => event.error }),
        },
      } as any,
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
export const registrationStateMachine = setup({
  types: {
    context: {} as FetchContext,
    events: {} as FETCH_EVENT,
  },
}).createMachine<any>(config);

