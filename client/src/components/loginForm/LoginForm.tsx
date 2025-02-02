import React, { useEffect, useState } from 'react';
import { useActorRef } from '@xstate/react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import GppBadIcon from '@mui/icons-material/GppBad';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { loginStateMachine } from './LoginStateMachine';
import { createBrowserInspector } from '@statelyai/inspect';

const inspector = createBrowserInspector({
  autoStart: false,
});

function LoginForm() {
  const [error, setError] = useState<Error>();
  const navigate = useNavigate();

  const actor = useActorRef(loginStateMachine, { inspect: inspector.inspect });
  const currentState = actor.getSnapshot();

  const { handleSubmit, control } = useForm({
    defaultValues: {
      email: '',
    },
  });
  const onSubmit = (data: any) => {
    if (!currentState.can({ type: 'FETCH' })) {
      return;
    }

    actor.send({ type: 'FETCH', email: data.email });
  };

  useEffect(() => {
    inspector.start();
    const subscription = actor.subscribe((snapshot) => {
      if (snapshot.context.error) {
        setError(snapshot.context.error);
      }

      if (snapshot.value === 'success') {
        void navigate('/private');
      }
    });

    return () => {
      subscription.unsubscribe();
      inspector.stop();
    };
  }, []);

  return <>

    {error && <Alert icon={<GppBadIcon fontSize="inherit" />} severity="error">
      {error.message ?? 'Something went wrong :('}
    </Alert>}
    <Typography textAlign="center" variant="h5">Login</Typography>
    <Stack
      spacing={1}
      component="form"
      onSubmit={void handleSubmit(onSubmit)}
      noValidate
      autoComplete="off"
    >
      <Controller
        name="email"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextField
            id={'email'}
            key={'email'}
            value={value}
            onChange={onChange}
            placeholder={'Email'}
            label={'Email'}
            size="small"
          />
        )}
      />

      <Button size="small" variant="contained" type="submit">Login</Button>
    </Stack>

  </>;
}

export default LoginForm;
