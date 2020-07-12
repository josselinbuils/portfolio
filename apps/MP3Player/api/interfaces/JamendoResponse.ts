/* eslint-disable camelcase */
export interface JamendoResponse<T> {
  headers: {
    code: number;
    error_message: string;
    status: string;
  };
  results: T[];
}
