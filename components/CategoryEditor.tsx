import { GameSubmissionCategory } from '@prisma/client';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { SiteConfig } from '../utils/siteConfig';
import { useValidatedState, ValidationSchemas } from '../utils/validation';
import { Button, FormItem, Label, TextAreaInput, TextInput } from './layout';

interface CategoryEditorProps {
  category: GameSubmissionCategory;
  onDelete: () => void;
  onUpdate: (value: GameSubmissionCategory) => void;
}

export const CategoryEditor: React.FC<CategoryEditorProps> = ({ category, onDelete, onUpdate }) => {
  const [validatedCategory, setCategoryField] = useValidatedState(category, ValidationSchemas.GameSubmissionCategory);

  const handleUpdate = useCallback((field: keyof GameSubmissionCategory, newValue: GameSubmissionCategory[typeof field]) => {
    onUpdate(setCategoryField(field, newValue));
  }, [onUpdate, setCategoryField]);

  const handleUpdateCategoryName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdate('categoryName', event.target.value);
  }, [handleUpdate]);

  const handleUpdateVideoURL = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdate('videoURL', event.target.value);
  }, [handleUpdate]);
  
  const handleUpdateEstimate = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleUpdate('estimate', event.target.value);
  }, [handleUpdate]);

  const handleUpdateDescription = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleUpdate('description', event.target.value);
  }, [handleUpdate]);
  
  return (
    <CategoryContainer>
      <FormItem>
        <Label htmlFor="categoryName">Category Name</Label>
        <TextInput
          id="categoryName"
          type="text"
          value={validatedCategory.value.categoryName}
          error={validatedCategory.error?.categoryName}
          maxLength={100}
          onChange={handleUpdateCategoryName}
        />
      </FormItem>
      <FormItem>
        <Label htmlFor="videoURL">Video URL</Label>
        <TextInput
          id="videoURL"
          type="text"
          value={validatedCategory.value.videoURL}
          error={validatedCategory.error?.videoURL}
          maxLength={2048}
          onChange={handleUpdateVideoURL}
        />
      </FormItem>
      <FormItem>
        <Label htmlFor="estimate">Estimate</Label>
        <TextInput
          id="estimate"
          type="text"
          value={validatedCategory.value.estimate}
          error={validatedCategory.error?.estimate}
          maxLength={8}
          onChange={handleUpdateEstimate}
        />
      </FormItem>
      <FormItem>
        <Label htmlFor="description">Description</Label>
        <TextAreaInput
          id="description"
          type="text"
          value={validatedCategory.value.description}
          error={validatedCategory.error?.description}
          maxLength={1000}
          onChange={handleUpdateDescription}
        />
      </FormItem>
      <DeleteCategoryButton variant="danger" onClick={onDelete}>Delete</DeleteCategoryButton>
    </CategoryContainer>
  );
};

const CategoryContainer = styled.div`
  display: flex;
  flex-direction: column;

  & + & {
    margin: 1rem 0 0;
    padding 1rem 0;
    border-top: 1px solid ${SiteConfig.colors.accents.separator};
  }
`;

const DeleteCategoryButton = styled(Button)`
  width: unset;
  margin-left: auto;
  margin-top: 0.5rem;
  font-size: 1.25rem;
`;
