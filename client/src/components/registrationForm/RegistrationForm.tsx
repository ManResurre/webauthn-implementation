import {
  supported,
} from '@github/webauthn-json/browser-ponyfill';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import GppBadIcon from '@mui/icons-material/GppBad';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import { useActorRef } from '@xstate/react';
import { createBrowserInspector } from '@statelyai/inspect';
import { registrationStateMachine } from './RgistrationStateMachine';

const inspector = createBrowserInspector({
  autoStart: false,
});

interface IRegistrationForm {
  email: string;
  displayName: string;
}

function RegistrationForm() {
  const actor = useActorRef(registrationStateMachine, { inspect: inspector.inspect });
  const currentState = actor.getSnapshot();
  const { control, handleSubmit } = useForm<IRegistrationForm>({
    defaultValues: {
      email: '',
      displayName: '',
    },
  });
  const navigate = useNavigate();

  const [valid, setValid] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setValid(supported());
  }, []);

  useEffect(() => {
    inspector.start();
    const subscription = actor.subscribe((snapshot) => {
      if (snapshot.context.error) {
        setError(snapshot.context.error);
      }

      if (snapshot.value === 'success') {
        setTimeout(() => void navigate('/login'), 3000);
      }
    });

    return () => {
      subscription.unsubscribe();
      inspector.stop();
    };
  }, []);

  const onSubmit = (data: IRegistrationForm) => {
    if (!currentState.can({ type: 'FETCH' })) {
      return;
    }

    actor.send({ type: 'FETCH', email: data.email, displayName: data.displayName });
  };

  if (!valid) {
    return <div>Not Supported</div>;
  }

  return <>
    {error && <Alert icon={<GppBadIcon fontSize="inherit" />} severity="error">
      {error.message}
    </Alert>}

    {currentState.value === 'success' && <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
      Congratulations you are registered.
    </Alert>}

    <Stack
      spacing={1}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      autoComplete="off"
    >
      <Typography textAlign="center" variant="h5">Registration</Typography>
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
      <Controller
        name="displayName"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextField
            id={'displayName'}
            key={'displayName'}
            value={value}
            onChange={onChange}
            placeholder={'Display Name'}
            label={'Display Name'}
            size="small"
          />
        )}
      />
      <Button size="small" variant="contained" type="submit">Submit</Button>
    </Stack>
  </>;
}

export default RegistrationForm;
