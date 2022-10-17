import { User } from '@prisma/client';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useSaveable } from '../utils/hooks';
import { useValidatedState, ValidationSchemas } from '../utils/validation';
import { Button, FormItem, Label, TextInput, ToggleSwitch, Alert, StaticInput } from './layout';

const SAVE_OPTS = {
  requestOptions: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  formatBody(value: User) {
    return {
      displayName: value.displayName,
      email: value.email,
      showPronouns: value.showPronouns,
      pronouns: value.pronouns,
      showSubmissions: value.showSubmissions,
    };
  },
};

interface ProfileEditorProps {
  user: User;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ user }) => {
  const [validatedProfile, setProfileField] = useValidatedState(user, ValidationSchemas.User);
  const [saveResponse, setSaveResponse] = useState<string | null>(null);

  const handleUpdateDisplayName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileField('displayName', event.target.value);
  }, [setProfileField]);

  const handleUpdateShowPronouns = useCallback((value: boolean) => {
    setProfileField('showPronouns', value);
  }, [setProfileField]);

  const handleUpdateShowSubmissions = useCallback((value: boolean) => {
    setProfileField('showSubmissions', value);
  }, [setProfileField]);

  const handleUpdatePronouns = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileField('pronouns', event.target.value);
  }, [setProfileField]);

  const handleUpdateEmail = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileField('email', event.target.value);
  }, [setProfileField]);

  const [save, isSaving, saveError] = useSaveable<User, { message: string }>('/api/user/update', !validatedProfile.error, SAVE_OPTS);

  const handleSave = useCallback(async () => {
    setSaveResponse(null);
    const response = await save(validatedProfile.value);

    if (response) setSaveResponse(response.message);
  }, [save, validatedProfile]);

  return (
    <Container>
      <Instructions>
        Please make sure your profile looks correct.
      </Instructions>

      {saveError.error && (
        <Alert variant="error">{saveError.message}</Alert>
      )}

      {saveResponse && (
        <Alert variant="default">{saveResponse}</Alert>
      )}
      <FormItem>
        <Label>Discord Username</Label>
        <StaticInput>{user.name}</StaticInput>
      </FormItem>
      <FormItem>
        <Label htmlFor="displayName">Display Name</Label>
        <TextInput
          id="displayName"
          type="text"
          placeholder={user.name ?? undefined}
          defaultValue={validatedProfile.value.displayName ?? undefined}
          error={validatedProfile.error?.displayName}
          maxLength={100}
          onChange={handleUpdateDisplayName}
        />
      </FormItem>
      <FormItem>
        <Label htmlFor="email">Email</Label>
        <TextInput
          id="email"
          type="text"
          defaultValue={validatedProfile.value.email ?? undefined}
          error={validatedProfile.error?.email}
          maxLength={250}
          onChange={handleUpdateEmail}
        />
      </FormItem>
      <FormItem>
        <Label htmlFor="pronouns">Pronouns</Label>
        <TextInput
          id="pronouns"
          type="text"
          defaultValue={validatedProfile.value.pronouns ?? undefined}
          error={validatedProfile.error?.pronouns}
          maxLength={100}
          onChange={handleUpdatePronouns}
        />
      </FormItem>
      <FormItem>
        <ToggleSwitch
          toggled={validatedProfile.value.showPronouns}
          onChange={handleUpdateShowPronouns}
        >
          Show my pronouns on stream
        </ToggleSwitch>
      </FormItem>
      <FormItem>
        <ToggleSwitch
          toggled={validatedProfile.value.showSubmissions}
          onChange={handleUpdateShowSubmissions}
        >
          Show my submissions in the public submission list
        </ToggleSwitch>
      </FormItem>
      <FormItem>
        <Button onClick={handleSave} disabled={isSaving || !!validatedProfile.error}>Save</Button>
      </FormItem>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Instructions = styled.h2`
  margin: 0.5rem 0;
  font-size: 1.5rem;
`;
