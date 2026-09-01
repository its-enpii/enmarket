export interface ActionResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  ok?: boolean;
  message?: string;
  redirectTo?: string;
}

export const EMPTY_ACTION_RESULT: ActionResult = {};
