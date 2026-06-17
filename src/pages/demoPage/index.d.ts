import type { FC } from 'react';

export function parseVariableKeysFromApi(str: string | null | undefined): string[];

export function applyTemplateVariables(
  template: string,
  variableValues?: Record<string, string | undefined>
): string;

declare const SendSmsPage: FC;
export default SendSmsPage;
